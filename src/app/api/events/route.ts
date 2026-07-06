import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { incrementLandingMetric } from "@/lib/growth/landing-metrics";
import {
  getExperimentVariantMetricUpdate,
  normalizeGrowthLocale,
  toPublicGrowthEventName,
} from "@/lib/growth/events";
import { getAnalyticsEventRateLimit } from "@/lib/admin/date-windows";
import { checkInMemoryRateLimit, getClientIp } from "@/lib/rate-limit";

const eventSchema = z.object({
  eventId: z.string().min(8).max(128),
  eventName: z.string().min(1).max(64),
  landingPageId: z.string().optional().nullable(),
  destinationId: z.string().optional().nullable(),
  locale: z.string().max(16).optional().nullable(),
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
    const rate = checkInMemoryRateLimit(
      `events:${getClientIp(request.headers)}`,
      getAnalyticsEventRateLimit(),
      60 * 1000
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: "RATE_LIMITED" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const body = await request.json();
    const data = eventSchema.parse(body);
    const eventName = toPublicGrowthEventName(data.eventName);

    if (!eventName) {
      return NextResponse.json({ ok: false, error: "UNKNOWN_EVENT" }, { status: 400 });
    }

    if (!data.landingPageId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    let sentToMeta = false;
    let sentToTikTok = false;
    let sentToGA4 = false;
    let sentToGTM = false;
    let validVariantId: string | undefined;

    const landing = await prisma.landingPage.findUnique({
      where: { id: data.landingPageId },
      include: { trackingProfile: true },
    });

    if (!landing) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (landing.trackingProfile?.status === "ACTIVE") {
      const tp = landing.trackingProfile;
      sentToMeta = tp.enableMeta && Boolean(tp.metaPixelId);
      sentToTikTok = tp.enableTikTok && Boolean(tp.tiktokPixelId);
      sentToGA4 = tp.enableGA4 && Boolean(tp.ga4MeasurementId);
      sentToGTM = tp.enableGTM && Boolean(tp.gtmContainerId);
    }

    if (data.variantId) {
      const variant = await prisma.experimentVariant.findUnique({
        where: { id: data.variantId },
        select: {
          id: true,
          experiment: {
            select: {
              landingPageId: true,
              status: true,
              startAt: true,
              endAt: true,
            },
          },
        },
      });
      const now = new Date();
      if (
        variant?.experiment.landingPageId === landing.id &&
        variant.experiment.status === "RUNNING" &&
        (!variant.experiment.startAt || variant.experiment.startAt <= now) &&
        (!variant.experiment.endAt || variant.experiment.endAt >= now)
      ) {
        validVariantId = variant.id;
      }
    }

    await prisma.pixelEventLog.create({
      data: {
        eventId: data.eventId,
        eventName,
        landingPageId: landing.id,
        destinationId: landing.destinationId,
        locale: normalizeGrowthLocale(data.locale) ?? landing.locale,
        offerId: landing.offerId ?? undefined,
        source: data.source ?? undefined,
        medium: data.medium ?? undefined,
        campaign: data.campaign ?? undefined,
        content: data.content ?? undefined,
        creativeAngle: data.creativeAngle ?? undefined,
        ctaLocation: data.ctaLocation ?? undefined,
        needType: data.needType ?? undefined,
        pageUrl: data.pageUrl ?? undefined,
        sessionId: data.sessionId ?? undefined,
        variantId: validVariantId,
        sentToMeta,
        sentToTikTok,
        sentToGA4,
        sentToGTM,
      },
    });

    await incrementLandingMetric(landing.id, eventName);

    const variantUpdate = validVariantId ? getExperimentVariantMetricUpdate(eventName) : null;
    if (validVariantId && variantUpdate) {
      await prisma.experimentVariant.update({
        where: { id: validVariantId },
        data: variantUpdate,
      }).catch((err) => {
        console.error("Failed to increment experiment variant metric:", err);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
