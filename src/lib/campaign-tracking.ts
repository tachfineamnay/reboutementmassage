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
  city?: string;
  offer?: string;
  session_duration?: string;
  language?: string;
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

function pushDataLayer(event: CampaignEventName, params: CampaignTrackingParams) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
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
      content_name: "cdmx_private_session",
      content_category: "manual_therapy",
      lang,
      page_path: pagePath,
    });
    trackTikTok("ViewContent", {
      content_name: "cdmx_private_session",
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
        intent: "private_session",
        preferred_channel: "ghl",
        lead_segment: "b2c_premium",
        page_path: pagePath,
      },
      params.meta_event_id ? { eventID: params.meta_event_id } : undefined
    );
    trackTikTok("SubmitForm", {
      content_name: "cdmx_short_form",
    });
  }
}

export function getCampaignBaseParams(language: string): CampaignTrackingParams {
  return {
    city: "cdmx",
    offer: "private_session",
    session_duration: "75_min",
    language,
    ...getUtmParams(),
  };
}

export function trackCampaignEvent(event: CampaignEventName, params: CampaignTrackingParams = {}) {
  const merged = { ...getCampaignBaseParams(params.language || "fr"), ...params };
  pushDataLayer(event, merged);
  bridgeMetaEvent(event, merged);
}

export function trackLandingViewed(language: string) {
  trackCampaignEvent("landing_viewed", { language });
}
