import { trackCampaignEvent, type CampaignEventName, type CampaignTrackingParams, normalizeNeedType } from "@/lib/campaign-tracking";

export type GrowthTrackPayload = CampaignTrackingParams & {
  landingPageId?: string;
  destinationId?: string;
  offerId?: string | null;
  eventId?: string;
  sessionId?: string;
  variantId?: string;
};

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
        needType: payload.need_type ? normalizeNeedType(payload.need_type) : undefined,
        pageUrl: window.location.href,
        sessionId: payload.sessionId,
        variantId: payload.variantId,
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
