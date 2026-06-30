import type { NormalizedNeedType } from "@prisma/client";
import { trackCampaignEvent, type CampaignEventName, type CampaignTrackingParams } from "@/lib/campaign-tracking";

export type GrowthTrackPayload = CampaignTrackingParams & {
  landingPageId?: string;
  destinationId?: string;
  offerId?: string;
  eventId?: string;
  sessionId?: string;
};

export async function logEventServer(payload: {
  eventId: string;
  eventName: string;
  landingPageId?: string;
  destinationId?: string;
  locale?: string;
  offerId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  creativeAngle?: string;
  ctaLocation?: string;
  needType?: NormalizedNeedType;
  pageUrl?: string;
  sessionId?: string;
}) {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.pixelEventLog.create({
      data: {
        eventId: payload.eventId,
        eventName: payload.eventName,
        landingPageId: payload.landingPageId,
        destinationId: payload.destinationId,
        locale: payload.locale as "FR" | "EN" | "ES" | undefined,
        offerId: payload.offerId,
        source: payload.source,
        medium: payload.medium,
        campaign: payload.campaign,
        content: payload.content,
        creativeAngle: payload.creativeAngle,
        ctaLocation: payload.ctaLocation,
        needType: payload.needType,
        pageUrl: payload.pageUrl,
        sessionId: payload.sessionId,
        sentToMeta: true,
      },
    });
  } catch {
    // Non-blocking if DB unavailable
  }
}

export function trackGrowthEvent(event: CampaignEventName, payload: GrowthTrackPayload = {}) {
  trackCampaignEvent(event, payload);

  if (typeof window !== "undefined" && payload.landingPageId) {
    const eventId =
      payload.eventId ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `evt_${Date.now()}`);

    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        eventName: event,
        landingPageId: payload.landingPageId,
        destinationId: payload.destinationId,
        offerId: payload.offerId,
        locale: payload.language,
        source: payload.source,
        medium: payload.utm_medium,
        campaign: payload.utm_campaign,
        content: payload.utm_content,
        creativeAngle: payload.creative_angle,
        ctaLocation: payload.cta_location,
        needType: payload.need_type,
        pageUrl: window.location.href,
        sessionId: payload.sessionId,
      }),
      keepalive: true,
    });
  }
}

export function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
