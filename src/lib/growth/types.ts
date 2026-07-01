import type {
  LandingPage,
  Offer,
  WhatsappChannel,
  TrackingProfile,
  CrmRoutingRule,
  Destination,
  Experiment,
  ExperimentVariant,
  MediaAssetType,
  Prisma,
} from "@prisma/client";

export type { MediaAssetType };

export type LandingContentTestimonial = {
  posterSrc?: string;
  videoSrc?: string;
  cta?: string;
  testimonialId?: string;
};

export type LandingPageContent = Record<string, unknown> & {
  testimonial?: LandingContentTestimonial;
};

export type ExperimentWithVariants = Experiment & {
  variants: ExperimentVariant[];
};

export type ExperimentVariantInput = {
  id?: string;
  name: string;
  trafficSplit: number;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  primaryCta?: string | null;
  testimonialId?: string | null;
  contentOverrides?: Record<string, unknown>;
};

export type ExperimentVariantFormState = {
  id: string;
  name: string;
  trafficSplit: number | string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCta: string;
  testimonialId: string;
  contentOverrides: string;
  errors: string;
};

export function mergeLandingContent(
  content: Prisma.JsonValue,
  patch: Record<string, unknown>
): Prisma.JsonValue {
  const base =
    typeof content === "object" && content !== null && !Array.isArray(content)
      ? (content as Record<string, unknown>)
      : {};
  return { ...base, ...patch } as Prisma.JsonValue;
}

export type LandingPageWithRelations = LandingPage & {
  destination: Destination;
  offer: Offer | null;
  whatsappChannel: WhatsappChannel | null;
  trackingProfile: TrackingProfile | null;
  crmRoutingRule: CrmRoutingRule | null;
  heroImage?: { url: string } | null;
  ogImage?: { url: string } | null;
};

export type ReadinessIssue = {
  code: string;
  severity: "critical" | "warning" | "info";
  message: string;
  actionUrl?: string;
};

export type ReadinessResult = {
  score: number;
  issues: ReadinessIssue[];
};

export const COMPLIANCE_DEFAULT_FR =
  "La Méthode TMS® est une approche manuelle de bien-être et de soulagement. Elle ne remplace pas un diagnostic, un traitement médical ou l'avis d'un professionnel de santé.";

export const FORBIDDEN_MEDICAL_TERMS = [
  /guérir/i,
  /guérison/i,
  /traiter\s+(une\s+)?pathologie/i,
  /diagnostic/i,
  /résultat\s+garanti/i,
  /miracle/i,
  /disparition\s+définitive/i,
  /remplace.*médecin/i,
  /cure/i,
  /heal(s|ing)?/i,
  /guaranteed\s+result/i,
  /treat(s|ing)?\s+(a\s+)?(disease|pathology|condition)/i,
  /cura(r)?/i,
  /resultado\s+garantizado/i,
];

export type GrowthLandingInclude = {
  destination: true;
  offer: true;
  whatsappChannel: true;
  trackingProfile: true;
  crmRoutingRule: true;
  heroImage: true;
  ogImage: true;
};

export const growthLandingInclude: Prisma.LandingPageInclude = {
  destination: true,
  offer: true,
  whatsappChannel: true,
  trackingProfile: true,
  crmRoutingRule: true,
  heroImage: true,
  ogImage: true,
};

export function localeToLang(locale: "FR" | "EN" | "ES"): "fr" | "en" | "es" {
  if (locale === "EN") return "en";
  if (locale === "ES") return "es";
  return "fr";
}

export function langToLocale(lang: string): "FR" | "EN" | "ES" {
  if (lang === "en") return "EN";
  if (lang === "es") return "ES";
  return "FR";
}
