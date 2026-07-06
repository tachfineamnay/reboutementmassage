import type { Prisma } from "@prisma/client";

export const PUBLIC_GROWTH_EVENTS = [
  "landing_viewed",
  "hero_whatsapp_clicked",
  "sticky_whatsapp_clicked",
  "booking_clicked",
  "video_played",
  "testimonial_viewed",
  "form_started",
  "form_submitted",
  "faq_opened",
  "language_switched",
] as const;

export type PublicGrowthEventName = (typeof PUBLIC_GROWTH_EVENTS)[number];
export type ServerGrowthMetricEventName = "lead_created";
export type GrowthMetricEventName = PublicGrowthEventName | ServerGrowthMetricEventName;

export type GrowthMetricField =
  | "views"
  | "whatsappClicks"
  | "stickyClicks"
  | "formStarts"
  | "formSubmits"
  | "bookingClicks"
  | "paymentClicks"
  | "videoPlays"
  | "leads";

const PUBLIC_EVENT_SET = new Set<string>(PUBLIC_GROWTH_EVENTS);

const METRIC_FIELD_MAP: Partial<Record<GrowthMetricEventName, GrowthMetricField>> = {
  landing_viewed: "views",
  hero_whatsapp_clicked: "whatsappClicks",
  sticky_whatsapp_clicked: "stickyClicks",
  form_started: "formStarts",
  form_submitted: "formSubmits",
  booking_clicked: "bookingClicks",
  video_played: "videoPlays",
  lead_created: "leads",
};

export function normalizeGrowthLocale(value: unknown): "FR" | "EN" | "ES" | undefined {
  if (typeof value !== "string") return undefined;

  const locale = value.trim().split(/[-_]/)[0]?.toUpperCase();
  if (locale === "FR" || locale === "EN" || locale === "ES") return locale;

  return undefined;
}

export function toPublicGrowthEventName(value: unknown): PublicGrowthEventName | undefined {
  if (typeof value !== "string") return undefined;
  return PUBLIC_EVENT_SET.has(value) ? (value as PublicGrowthEventName) : undefined;
}

export function getLandingMetricField(eventName: GrowthMetricEventName): GrowthMetricField | undefined {
  return METRIC_FIELD_MAP[eventName];
}

export function getExperimentVariantMetricUpdate(
  eventName: PublicGrowthEventName
): Prisma.ExperimentVariantUpdateInput | null {
  if (eventName === "landing_viewed") {
    return { impressions: { increment: 1 } };
  }

  if (
    eventName === "hero_whatsapp_clicked" ||
    eventName === "sticky_whatsapp_clicked"
  ) {
    return { whatsappClicks: { increment: 1 } };
  }

  if (eventName === "form_submitted") {
    return {
      formSubmits: { increment: 1 },
    };
  }

  if (eventName === "booking_clicked") {
    return { bookingClicks: { increment: 1 } };
  }

  return null;
}
