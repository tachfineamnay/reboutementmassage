import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { incrementLandingMetric } from "@/lib/growth/landing-metrics";

const eventSchema = z.object({
  eventId: z.string().min(8).max(128),
  eventName: z.string().min(1).max(64),
  landingPageId: z.string().optional().nullable(),
  destinationId: z.string().optional().nullable(),
  locale: z.enum(["FR", "EN", "ES"]).optional().nullable(),
  offerId: z.string().optional().nullable(),
  source: z.string().max(128).optional().nullable(),
  medium: z.string().max(128).optional().nullable(),
  campaign: z.string().max(128).optional().nullable(),
  content: z.string().max(128).optional().nullable(),
  creativeAngle: z.string().max(128).optional().nullable(),
  ctaLocation: z.string().max(64).optional().nullable(),
  needType: z
    .enum(["back", "neck", "stress", "fatigue", "travel", "mobility", "recovery", "other"])
    .optional()
    .nullable(),
  pageUrl: z.string().url().optional().nullable(),
  sessionId: z.string().max(128).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = eventSchema.parse(body);

    let sentToMeta = false;
    let sentToTikTok = false;
    let sentToGA4 = false;
    let sentToGTM = false;

    if (data.landingPageId) {
      const landing = await prisma.landingPage.findUnique({
        where: { id: data.landingPageId },
        include: { trackingProfile: true },
      });

      if (landing?.trackingProfile?.status === "ACTIVE") {
        const tp = landing.trackingProfile;
        sentToMeta = tp.enableMeta && Boolean(tp.metaPixelId);
        sentToTikTok = tp.enableTikTok && Boolean(tp.tiktokPixelId);
        sentToGA4 = tp.enableGA4 && Boolean(tp.ga4MeasurementId);
        sentToGTM = tp.enableGTM && Boolean(tp.gtmContainerId);
      }
    }

    await prisma.pixelEventLog.create({
      data: {
        eventId: data.eventId,
        eventName: data.eventName,
        landingPageId: data.landingPageId ?? undefined,
        destinationId: data.destinationId ?? undefined,
        locale: data.locale ?? undefined,
        offerId: data.offerId ?? undefined,
        source: data.source ?? undefined,
        medium: data.medium ?? undefined,
        campaign: data.campaign ?? undefined,
        content: data.content ?? undefined,
        creativeAngle: data.creativeAngle ?? undefined,
        ctaLocation: data.ctaLocation ?? undefined,
        needType: data.needType ?? undefined,
        pageUrl: data.pageUrl ?? undefined,
        sessionId: data.sessionId ?? undefined,
        sentToMeta,
        sentToTikTok,
        sentToGA4,
        sentToGTM,
      },
    });

    if (data.landingPageId) {
      await incrementLandingMetric(data.landingPageId, data.eventName);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
