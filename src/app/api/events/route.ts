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
  variantId: z.string().optional().nullable(),
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

    // Incrémenter les métriques du variant d'expérience A/B
    if (data.variantId) {
      const updateData: Record<string, any> = {};
      const ev = data.eventName.toLowerCase();

      if (ev === "landing_viewed" || ev === "view" || ev === "page_view") {
        updateData.impressions = { increment: 1 };
      } else if (ev === "hero_whatsapp_clicked" || ev === "sticky_whatsapp_clicked" || ev === "whatsapp_clicked" || ev === "testimonial_whatsapp_clicked") {
        updateData.whatsappClicks = { increment: 1 };
      } else if (ev === "lead_submitted" || ev === "form_submitted") {
        updateData.formSubmits = { increment: 1 };
        updateData.leads = { increment: 1 };
      } else if (ev === "hero_booking_clicked" || ev === "booking_clicked") {
        updateData.bookingClicks = { increment: 1 };
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.experimentVariant.update({
          where: { id: data.variantId },
          data: updateData,
        }).catch((err) => {
          console.error("Failed to increment experiment variant metric:", err);
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
