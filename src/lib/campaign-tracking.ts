import type { CampaignNeedCategory } from "@/data/campaign-landings";
import { trackMetaContact, trackMetaLead, trackMetaViewContent } from "@/components/MetaPixel";

export type CampaignEventName =
  | "landing_viewed"
  | "hero_whatsapp_clicked"
  | "sticky_whatsapp_clicked"
  | "booking_clicked"
  | "video_played"
  | "testimonial_viewed"
  | "form_started"
  | "form_submitted"
  | "faq_opened"
  | "language_switched";

export type CtaLocation = "hero" | "sticky" | "testimonial" | "form" | "footer" | "offer";

export type CampaignTrackingParams = {
  landingPageId?: string;
  destinationId?: string;
  offerId?: string | null;
  city?: string;
  country?: string;
  locale?: string;
  offer?: string;
  offerType?: string;
  session_duration?: string;
  language?: string;
  content_name?: string;
  lead_segment?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  creative_angle?: string;
  cta_location?: CtaLocation;
  need_type?: CampaignNeedCategory;
  faq_question?: string;
  meta_event_id?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
    };
  }
}

function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const searchParams = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (key.toLowerCase().startsWith("utm_")) {
      utm[key] = value;
    }
  }

  const creativeAngle = searchParams.get("creative_angle");
  if (creativeAngle) utm.creative_angle = creativeAngle;

  return utm;
}

const ALLOWED_NEED_TYPES = new Set([
  "back",
  "neck",
  "stress",
  "fatigue",
  "travel",
  "mobility",
  "recovery",
  "other",
]);

export function normalizeNeedType(value: any): string | undefined {
  if (typeof value !== "string") return undefined;
  const val = value.toLowerCase();
  return ALLOWED_NEED_TYPES.has(val) ? val : undefined;
}

function pushDataLayer(event: CampaignEventName, params: CampaignTrackingParams) {
  if (typeof window === "undefined") return;

  const normalizedNeed = params.need_type ? normalizeNeedType(params.need_type) : undefined;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    landingPageId: params.landingPageId,
    destinationId: params.destinationId,
    offerId: params.offerId,
    city: params.city,
    country: params.country,
    locale: params.locale || params.language,
    offerType: params.offerType,
    session_duration: params.session_duration,
    cta_location: params.cta_location,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_content: params.utm_content,
    creative_angle: params.creative_angle,
    need_type: normalizedNeed,
  });
}

function trackTikTok(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track(event, params);
}

function bridgeMetaEvent(event: CampaignEventName, params: CampaignTrackingParams) {
  const lang = (params.language?.toUpperCase() || "FR") as "FR" | "EN" | "ES";
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";

  if (event === "landing_viewed") {
    trackMetaViewContent({
      content_name: params.content_name || "cdmx_private_session",
      content_category: "manual_therapy",
      lang,
      page_path: pagePath,
    });
    trackTikTok("ViewContent", {
      content_name: params.content_name || "cdmx_private_session",
      content_category: "manual_therapy",
    });
    return;
  }

  if (
    event === "hero_whatsapp_clicked" ||
    event === "sticky_whatsapp_clicked" ||
    event === "testimonial_viewed"
  ) {
    trackMetaContact({
      content_name: "contact_click",
      contact_channel: "whatsapp",
      lang,
      page_path: pagePath,
    });
    trackTikTok("ClickButton", {
      content_name: event,
      cta_location: params.cta_location,
    });
    return;
  }

  if (event === "booking_clicked") {
    trackMetaContact({
      content_name: "contact_click",
      contact_channel: "form_cta",
      lang,
      page_path: pagePath,
    });
    trackTikTok("ClickButton", {
      content_name: "booking_clicked",
      cta_location: params.cta_location,
    });
    return;
  }

  if (event === "form_submitted") {
    trackMetaLead(
      {
        content_name: "lead_form_submission",
        content_category: "manual_therapy",
        lang,
        intent: params.offer || "private_session",
        preferred_channel: "ghl",
        lead_segment: params.lead_segment || "b2c_premium",
        page_path: pagePath,
      },
      params.meta_event_id ? { eventID: params.meta_event_id } : undefined
    );
    const normalizedNeed = params.need_type ? normalizeNeedType(params.need_type) : undefined;
    trackTikTok("SubmitForm", {
      content_name: params.content_name ? `${params.content_name}_short_form` : "cdmx_short_form",
      need_type: normalizedNeed,
    });
  }
}

export function getCampaignBaseParams(language: string): CampaignTrackingParams {
  return {
    language,
    ...getUtmParams(),
  };
}

export function trackCampaignEvent(event: CampaignEventName, params: CampaignTrackingParams = {}) {
  const merged = { ...getCampaignBaseParams(params.language || "fr"), ...params };
  pushDataLayer(event, merged);
  bridgeMetaEvent(event, merged);
}

export function trackLandingViewed(language: string, params: CampaignTrackingParams = {}) {
  trackCampaignEvent("landing_viewed", { language, ...params });
}
