import type { Prisma } from "@prisma/client";
import {
  PUCK_BUILDER_VERSION,
  PUCK_EDITOR,
  type BadgeItem,
  type FaqItem,
  type LeadOptionItem,
  type OfferCardItem,
  type TmsPuckData,
  parsePuckData,
  safeParsePuckData,
} from "@/lib/builder/puck-data-schema";

type Locale = "FR" | "EN" | "ES";
type JsonRecord = Record<string, unknown>;

export type PuckLandingSource = {
  id?: string;
  locale?: Locale;
  slug?: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  microNote?: string | null;
  primaryCta?: string | null;
  secondaryCta?: string | null;
  painChips?: unknown;
  proofBadges?: unknown;
  processSteps?: unknown;
  faq?: unknown;
  content?: unknown;
  complianceText?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  whatsappChannelId?: string | null;
  trackingProfileId?: string | null;
  testimonialIds?: unknown;
  heroImage?: { url?: string | null; altFr?: string | null; altEn?: string | null; altEs?: string | null } | null;
  offer?: {
    publicNameFr?: string | null;
    publicNameEn?: string | null;
    publicNameEs?: string | null;
    publicName?: string | null;
    internalName?: string | null;
    showPrice?: boolean | null;
    priceAmount?: unknown;
    priceNoteFr?: string | null;
    priceNoteEn?: string | null;
    priceNoteEs?: string | null;
  } | null;
  destination?: {
    cityName?: string | null;
    displayNameFr?: string | null;
    displayNameEn?: string | null;
    displayNameEs?: string | null;
    slug?: string | null;
  } | null;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function nonEmpty(value: unknown, fallback = "") {
  const next = stringValue(value);
  return next || fallback;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

export function asBadgeArray(value: unknown): BadgeItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => record(item))
    .map((item) => ({ value: stringValue(item.value), label: stringValue(item.label) }))
    .filter((item) => item.value && item.label);
}

export function asFaqArray(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => record(item))
    .map((item) => ({ question: stringValue(item.question), answer: stringValue(item.answer) }))
    .filter((item) => item.question && item.answer);
}

export function asLeadOptions(value: unknown): LeadOptionItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => record(item))
    .map((item) => ({ value: stringValue(item.value), label: stringValue(item.label) }))
    .filter((item) => item.value && item.label);
}

function asOfferCards(value: unknown): OfferCardItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => record(item))
    .map((item) => ({
      title: stringValue(item.title),
      subtitle: stringValue(item.subtitle),
      description: stringValue(item.description),
      includes: asStringArray(item.includes),
      ctaLabel: nonEmpty(item.ctaLabel, "WhatsApp"),
      whatsappIntent: stringValue(item.whatsappIntent, "book_intent") as OfferCardItem["whatsappIntent"],
    }))
    .filter((item) => item.title && item.ctaLabel);
}

function localizedOfferName(landing: PuckLandingSource) {
  const offer = landing.offer;
  if (!offer) return "";
  if (landing.locale === "EN") return offer.publicNameEn ?? offer.publicName ?? offer.internalName ?? "";
  if (landing.locale === "ES") return offer.publicNameEs ?? offer.publicName ?? offer.internalName ?? "";
  return offer.publicNameFr ?? offer.publicName ?? offer.internalName ?? "";
}

function localizedOfferPriceNote(landing: PuckLandingSource) {
  const offer = landing.offer;
  if (!offer) return "";
  if (landing.locale === "EN") return offer.priceNoteEn ?? "";
  if (landing.locale === "ES") return offer.priceNoteEs ?? "";
  return offer.priceNoteFr ?? "";
}

function localizedHeroAlt(landing: PuckLandingSource) {
  if (landing.locale === "EN") return landing.heroImage?.altEn ?? "";
  if (landing.locale === "ES") return landing.heroImage?.altEs ?? "";
  return landing.heroImage?.altFr ?? "";
}

function finalCtaCopy(locale: Locale, city: string) {
  if (locale === "EN") {
    return {
      title: `Check availability in ${city || "your city"}`,
      body: "Send a short request and the team will respond based on availability.",
      primary: "Check on WhatsApp",
      secondary: "Use the quick form",
    };
  }
  if (locale === "ES") {
    return {
      title: `Consultar disponibilidad en ${city || "tu ciudad"}`,
      body: "Envía una solicitud corta y el equipo responde según disponibilidad.",
      primary: "Consultar por WhatsApp",
      secondary: "Usar el formulario",
    };
  }
  return {
    title: `Vérifier une disponibilité à ${city || "votre destination"}`,
    body: "Envoyez une demande courte et l'équipe répond selon les disponibilités.",
    primary: "Vérifier sur WhatsApp",
    secondary: "Utiliser le formulaire",
  };
}

function defaultNeedOptions(locale: Locale): LeadOptionItem[] {
  if (locale === "EN") {
    return [
      { value: "neck", label: "Stiff neck" },
      { value: "back", label: "Back tension" },
      { value: "stress", label: "Accumulated stress" },
      { value: "other", label: "Other need" },
    ];
  }
  if (locale === "ES") {
    return [
      { value: "neck", label: "Cuello rígido" },
      { value: "back", label: "Espalda cargada" },
      { value: "stress", label: "Estrés acumulado" },
      { value: "other", label: "Otra necesidad" },
    ];
  }
  return [
    { value: "neck", label: "Nuque raide" },
    { value: "back", label: "Dos chargé" },
    { value: "stress", label: "Stress accumulé" },
    { value: "other", label: "Autre besoin" },
  ];
}

function ensureOfferCards(title: string, props: { bullets: string[]; ctaLabel: string; launchRateLine: string }) {
  return [
    {
      title,
      subtitle: "",
      description: props.launchRateLine,
      includes: props.bullets,
      ctaLabel: props.ctaLabel,
      whatsappIntent: "book_intent" as const,
    },
  ];
}

export function createDefaultPuckDataFromLanding(landing: PuckLandingSource): TmsPuckData {
  const content = record(landing.content);
  const hero = record(content.hero);
  const shortForm = record(content.shortForm);
  const offerBlock = record(content.offerBlock);
  const difference = record(content.difference);
  const sections = record(content.sections);
  const testimonial = record(content.testimonial);
  const finalCta = record(content.finalCta);

  const locale = landing.locale ?? "FR";
  const city =
    landing.destination?.cityName ??
    landing.destination?.displayNameFr ??
    landing.destination?.displayNameEn ??
    landing.destination?.displayNameEs ??
    "";
  const offerTitle = nonEmpty(offerBlock.title, localizedOfferName(landing) || "Séance privée");
  const offerBullets = asStringArray(offerBlock.bullets ?? content.offerBullets);
  const ctaLabel = nonEmpty(offerBlock.ctaLabel, landing.primaryCta ?? "WhatsApp");
  const finalCopy = finalCtaCopy(locale, city);
  const proofBadges = asBadgeArray(landing.proofBadges);
  const faq = asFaqArray(landing.faq);

  const data: TmsPuckData = {
    root: {
      props: {
        pageStyle: "premium-reset",
        density: "conversion",
        locale,
      },
    },
    content: [
      {
        type: "HeroSection",
        props: {
          id: "hero",
          variant: "immersive",
          eyebrow: nonEmpty(hero.eyebrow, city ? `${city} · Private session` : ""),
          title: nonEmpty(landing.heroTitle, "Nouvelle landing TMS"),
          subtitle: stringValue(landing.heroSubtitle),
          body: stringValue(hero.body),
          microNote: stringValue(landing.microNote),
          primaryCta: nonEmpty(landing.primaryCta, "WhatsApp"),
          secondaryCta: stringValue(landing.secondaryCta),
          secondaryHref: stringValue(hero.secondaryHref, "#solicitud"),
          proofLine: stringValue(hero.proofLine),
          imageSrc: stringValue(landing.heroImage?.url ?? hero.imageSrc),
          imageAlt: nonEmpty(localizedHeroAlt(landing) || hero.imageAlt, landing.heroTitle ?? "TMS"),
        },
      },
      {
        type: "PainChipsSection",
        props: {
          id: "for-you",
          variant: "chips",
          title: nonEmpty(content.forYouIfTitle, locale === "EN" ? "For you if your body feels overloaded." : locale === "ES" ? "Para ti si tu cuerpo se siente cargado." : "Pour vous si votre corps se sent chargé."),
          body: stringValue(content.forYouIfBody),
          items: asStringArray(landing.painChips),
        },
      },
      {
        type: "ProofBadgesSection",
        props: {
          id: "proof",
          variant: "stat-grid",
          badges: proofBadges,
        },
      },
      {
        type: "OfferSection",
        props: {
          id: "offer",
          variant: "cards",
          title: offerTitle,
          bullets: offerBullets,
          launchRateLine: stringValue(offerBlock.launchRateLine),
          showPrice: Boolean(landing.offer?.showPrice ?? offerBlock.showPrice),
          priceLabel: stringValue(offerBlock.priceLabel ?? localizedOfferPriceNote(landing)),
          priceValue: stringValue(offerBlock.priceValue ?? landing.offer?.priceAmount),
          ctaLabel,
          whatsappIntent: "book_intent",
          cards: asOfferCards(offerBlock.cards).length
            ? asOfferCards(offerBlock.cards)
            : ensureOfferCards(offerTitle, {
                bullets: offerBullets,
                ctaLabel,
                launchRateLine: stringValue(offerBlock.launchRateLine),
              }),
        },
      },
      {
        type: "DifferenceSection",
        props: {
          id: "difference",
          variant: "image-copy",
          title: nonEmpty(difference.title, locale === "EN" ? "Not a regular massage." : locale === "ES" ? "No es un masaje clásico." : "Ce n'est pas un massage classique."),
          body: stringValue(difference.body),
          points: asStringArray(difference.points),
          imageSrc: stringValue(difference.imageSrc),
          imageAlt: stringValue(difference.imageAlt),
        },
      },
      {
        type: "TestimonialSection",
        props: {
          id: "testimonial",
          variant: stringValue(testimonial.videoSrc) ? "video" : "quote",
          quote: stringValue(testimonial.quote),
          attribution: stringValue(testimonial.attribution),
          posterSrc: stringValue(testimonial.posterSrc, landing.heroImage?.url ?? "/practice-01.webp"),
          videoSrc: stringValue(testimonial.videoSrc),
          cta: stringValue(testimonial.cta),
        },
      },
      {
        type: "ProcessSection",
        props: {
          id: "process",
          variant: "numbered",
          eyebrow: stringValue(sections.processEyebrow, "Process"),
          title: stringValue(content.processTitle, locale === "EN" ? "How it works" : locale === "ES" ? "Cómo funciona" : "Comment ça se passe"),
          steps: asStringArray(landing.processSteps),
        },
      },
      {
        type: "LeadFormSection",
        props: {
          id: "lead-form",
          variant: "short",
          label: stringValue(shortForm.label),
          headline: nonEmpty(shortForm.headline, locale === "EN" ? "Prefer to write before WhatsApp" : locale === "ES" ? "Prefieres escribir antes de WhatsApp" : "Vous préférez écrire avant WhatsApp"),
          sub: stringValue(shortForm.sub),
          tensionLabel: stringValue(shortForm.tensionLabel),
          tensionPlaceholder: stringValue(shortForm.tensionPlaceholder),
          whatsappLabel: stringValue(shortForm.whatsappLabel),
          whatsappPlaceholder: stringValue(shortForm.whatsappPlaceholder),
          submit: stringValue(shortForm.submit),
          needOptions: asLeadOptions(shortForm.needOptions).length ? asLeadOptions(shortForm.needOptions) : defaultNeedOptions(locale),
          complianceText: stringValue(landing.complianceText),
        },
      },
      {
        type: "FAQSection",
        props: {
          id: "faq",
          variant: "accordion",
          eyebrow: stringValue(sections.faqEyebrow, "FAQ"),
          title: stringValue(sections.faqTitle, "FAQ"),
          items: faq,
        },
      },
      {
        type: "FinalCtaSection",
        props: {
          id: "final-cta",
          variant: "centered",
          title: nonEmpty(finalCta.title, finalCopy.title),
          body: nonEmpty(finalCta.body, finalCopy.body),
          primary: nonEmpty(finalCta.primary, finalCopy.primary),
          secondary: nonEmpty(finalCta.secondary, finalCopy.secondary),
        },
      },
    ],
  };

  return parsePuckData(data);
}

export function isPuckLanding(content: unknown): boolean {
  const value = record(content);
  return value.editor === PUCK_EDITOR && value.builderVersion === PUCK_BUILDER_VERSION && safeParsePuckData(value.puckData).success;
}

export function ensurePuckData(content: unknown, landing: PuckLandingSource): TmsPuckData {
  const value = record(content);
  const parsed = safeParsePuckData(value.puckData);
  if (parsed.success) return parsed.data as TmsPuckData;
  return createDefaultPuckDataFromLanding(landing);
}

export function getPuckDataFromLanding(landing: PuckLandingSource): TmsPuckData {
  return ensurePuckData(landing.content, landing);
}

export function initializePuckDataForLanding(landing: PuckLandingSource): Prisma.InputJsonValue {
  const base = record(landing.content);
  return {
    ...base,
    editor: PUCK_EDITOR,
    builderVersion: PUCK_BUILDER_VERSION,
    puckData: ensurePuckData(base, landing),
  } as Prisma.InputJsonValue;
}

export function initializePuckDataForLandingDraft(
  draft: Prisma.LandingPageUncheckedCreateInput
): Prisma.InputJsonValue {
  return initializePuckDataForLanding(draft as PuckLandingSource);
}
