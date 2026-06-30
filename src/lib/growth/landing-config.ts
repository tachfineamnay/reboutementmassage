import type { CampaignLandingConfig, CampaignLeadOption, WhatsappIntent } from "@/data/campaign-landings";
import type { Language } from "@/data/copy";
import type { LandingPageWithRelations } from "@/lib/growth/types";
import { localeToLang, langToLocale } from "@/lib/growth/types";
import { generateWhatsappUrl } from "@/lib/growth/whatsapp";
import type { WhatsappChannel } from "@prisma/client";

type JsonRecord = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function asBadgeArray(value: unknown): Array<{ value: string; label: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { value: string; label: string } =>
      typeof v === "object" && v !== null && "value" in v && "label" in v
    )
    .map((v) => ({ value: String(v.value), label: String(v.label) }));
}

function asFaq(value: unknown): Array<{ question: string; answer: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { question: string; answer: string } =>
      typeof v === "object" && v !== null && "question" in v && "answer" in v
    )
    .map((v) => ({ question: String(v.question), answer: String(v.answer) }));
}

const NEED_OPTIONS: Record<"fr" | "en" | "es", CampaignLeadOption[]> = {
  en: [
    { value: "neck", label: "Stiff neck" },
    { value: "back", label: "Back tension" },
    { value: "fatigue", label: "Heavy body" },
    { value: "stress", label: "Stress accumulated" },
    { value: "travel", label: "After travel" },
    { value: "mobility", label: "Too much laptop" },
    { value: "other", label: "Sport or intense rhythm" },
  ],
  es: [
    { value: "neck", label: "Cuello rígido" },
    { value: "back", label: "Espalda cargada" },
    { value: "fatigue", label: "Cuerpo pesado" },
    { value: "stress", label: "Estrés acumulado" },
    { value: "travel", label: "Después de viaje" },
    { value: "mobility", label: "Demasiada computadora" },
    { value: "other", label: "Deporte o ritmo intenso" },
  ],
  fr: [
    { value: "neck", label: "Nuque raide" },
    { value: "back", label: "Dos chargé" },
    { value: "fatigue", label: "Corps lourd" },
    { value: "stress", label: "Stress accumulé" },
    { value: "travel", label: "Après voyage" },
    { value: "mobility", label: "Trop d'ordinateur" },
    { value: "other", label: "Sport ou rythme intense" },
  ],
};

const SHORT_FORM_COPY: Record<
  "fr" | "en" | "es",
  Omit<CampaignLandingConfig["shortForm"], "needOptions" | "languageOptions">
> = {
  en: {
    label: "Quick request",
    headline: "Prefer to write before WhatsApp",
    sub: "Short form — Grégory or the team responds based on availability.",
    tensionLabel: "Main tension",
    tensionPlaceholder: "Select an option",
    whatsappLabel: "WhatsApp",
    whatsappPlaceholder: "+52...",
    languageLabel: "Preferred language",
    submit: "Send request",
    submitting: "Sending...",
    contactError: "Please enter a valid WhatsApp number.",
    requiredError: "This field is required.",
    submitError: "Could not send. Check your contact and try again.",
    successTitle: "Request received.",
    successBody: "Grégory will personally review and respond based on availability.",
    successNote: "Your request is recorded confidentially.",
    newRequest: "Send another request",
    whatsappAfterLabel: "Add context on WhatsApp",
  },
  es: {
    label: "Solicitud rápida",
    headline: "Prefieres escribir antes de WhatsApp",
    sub: "Formulario corto — Grégory o el equipo responde según disponibilidad.",
    tensionLabel: "Tensión principal",
    tensionPlaceholder: "Selecciona una opción",
    whatsappLabel: "WhatsApp",
    whatsappPlaceholder: "+52...",
    languageLabel: "Idioma preferido",
    submit: "Enviar solicitud",
    submitting: "Enviando...",
    contactError: "Indica un WhatsApp válido.",
    requiredError: "Este campo es necesario.",
    submitError: "No se pudo enviar. Revisa el contacto e inténtalo de nuevo.",
    successTitle: "Solicitud recibida.",
    successBody: "Grégory revisará personalmente y responderá según disponibilidad.",
    successNote: "Tu solicitud queda registrada de forma confidencial.",
    newRequest: "Enviar otra solicitud",
    whatsappAfterLabel: "Añadir contexto por WhatsApp",
  },
  fr: {
    label: "Demande rapide",
    headline: "Vous préférez écrire avant WhatsApp",
    sub: "Formulaire court — Grégory ou l'équipe répond selon disponibilité.",
    tensionLabel: "Tension principale",
    tensionPlaceholder: "Sélectionnez une option",
    whatsappLabel: "WhatsApp",
    whatsappPlaceholder: "+52...",
    languageLabel: "Langue préférée",
    submit: "Envoyer la demande",
    submitting: "Envoi...",
    contactError: "Indiquez un WhatsApp valide.",
    requiredError: "Ce champ est nécessaire.",
    submitError: "La demande n'a pas pu être envoyée. Vérifiez le contact puis réessayez.",
    successTitle: "Demande reçue.",
    successBody: "Grégory étudiera personnellement et répondra selon disponibilité.",
    successNote: "Votre demande est enregistrée de façon confidentielle.",
    newRequest: "Envoyer une autre demande",
    whatsappAfterLabel: "Ajouter du contexte sur WhatsApp",
  },
};

function buildWhatsappMessages(
  channel: WhatsappChannel | null,
  content: JsonRecord,
  locale: "fr" | "en" | "es"
): Record<WhatsappIntent, string> {
  const fromContent = content.whatsappMessages as Record<WhatsappIntent, string> | undefined;
  if (fromContent) return fromContent;

  const loc = locale === "en" ? "EN" : locale === "es" ? "ES" : "FR";
  const base = channel
    ? decodeURIComponent(generateWhatsappUrl(channel, loc, "default").split("text=")[1] ?? "")
    : "";

  return {
    default: base,
    book_intent: base,
    more_info_intent: base,
    testimonial_cta: base,
    sticky_cta: base,
  };
}

export function landingPageToCampaignConfig(landing: LandingPageWithRelations): CampaignLandingConfig {
  const content = (landing.content ?? {}) as JsonRecord;
  const lang = localeToLang(landing.locale);
  const language = landing.locale as Language;
  const htmlLang = lang;
  const route = `/${lang}/${landing.slug}`;
  const difference = (content.difference ?? {}) as JsonRecord;
  const offerBlock = (content.offerBlock ?? {}) as JsonRecord;
  const testimonial = (content.testimonial ?? {}) as JsonRecord;
  const heroExtra = (content.hero ?? {}) as JsonRecord;
  const stickyCta = (content.stickyCta ?? {}) as JsonRecord;
  const sections = (content.sections ?? {}) as JsonRecord;
  const offer = landing.offer;

  const painItems = asStringArray(landing.painChips);
  const forYouTitle =
    typeof content.forYouIfTitle === "string"
      ? content.forYouIfTitle
      : lang === "en"
        ? "For you if your body feels overloaded."
        : lang === "es"
          ? "Para ti si tu cuerpo se siente cargado."
          : "Pour vous si votre corps se sent chargé.";

  const channel = landing.whatsappChannel;
  const messages = buildWhatsappMessages(channel, content, lang);
  const cityContext = { city: landing.destination.cityName };
  const whatsappUrls = {
    default: channel
      ? generateWhatsappUrl(channel, landing.locale, "default", cityContext)
      : "#",
    book_intent: channel
      ? generateWhatsappUrl(channel, landing.locale, "book_intent", cityContext)
      : "#",
    more_info_intent: channel
      ? generateWhatsappUrl(channel, landing.locale, "more_info_intent", cityContext)
      : "#",
    testimonial_cta: channel
      ? generateWhatsappUrl(channel, landing.locale, "testimonial_cta", cityContext)
      : "#",
    sticky_cta: channel
      ? generateWhatsappUrl(channel, landing.locale, "sticky_cta", cityContext)
      : "#",
  };

  return {
    id: landing.id,
    route,
    language,
    htmlLang,
    cityName: landing.destination.cityName,
    destination: landing.destination.cityName,
    offer: "private_session",
    leadType: `Client privé ${landing.destination.slug.toUpperCase()}`,
    leadSegment: "b2c_premium",
    landingPageId: landing.id,
    destinationId: landing.destinationId,
    offerId: landing.offerId,
    destinationSlug: landing.destination.slug,
    country: landing.destination.country,
    currency: landing.destination.currency,
    durationMinutes: offer?.durationMinutes ?? 75,
    offerType: offer?.type ?? "private_session",
    bookingUrl: offer?.bookingUrl ?? null,
    paymentUrl: offer?.paymentUrl ?? null,
    whatsappUrls,
    meta: {
      title: landing.seoTitle ?? landing.heroTitle,
      description: landing.metaDescription ?? landing.heroSubtitle ?? "",
    },
    tracking: {
      viewContentName: `landing_${landing.destination.slug}`,
      contentCategory: "manual_therapy",
    },
    branchData: {
      campaignCity: landing.destination.slug,
      offer: "private_session",
      landing: landing.slug,
      landingPageId: landing.id,
      destinationId: landing.destinationId,
      offerId: landing.offerId ?? "",
      durationMinutes: String(offer?.durationMinutes ?? 75),
    },
    hero: {
      eyebrow: String(heroExtra.eyebrow ?? `${landing.destination.displayNameEn} · Private session`),
      title: landing.heroTitle,
      subtitle: landing.heroSubtitle ?? "",
      microNote: landing.microNote ?? "",
      ctaPrimary: landing.primaryCta ?? "WhatsApp",
      ctaSecondary: landing.secondaryCta ?? "Book",
      proofLine: String(heroExtra.proofLine ?? ""),
      imageAlt: String(heroExtra.imageAlt ?? landing.heroTitle),
    },
    forYouIf: { title: forYouTitle, items: painItems },
    difference: {
      title: String(difference.title ?? ""),
      body: String(difference.body ?? ""),
      points: asStringArray(difference.points),
      imageAlt: String(difference.imageAlt ?? ""),
    },
    offerBlock: {
      title: String(offerBlock.title ?? offer?.publicNameEn ?? ""),
      bullets: asStringArray(offerBlock.bullets ?? content.offerBullets),
      launchRateLine: typeof offerBlock.launchRateLine === "string" ? offerBlock.launchRateLine : undefined,
      showPrice: offer?.showPrice ?? false,
      priceLabel: offer?.priceNoteEn ?? undefined,
      priceValue: offer?.priceAmount ? String(offer.priceAmount) : undefined,
    },
    proof: { badges: asBadgeArray(landing.proofBadges) },
    testimonial: {
      posterSrc: landing.heroImage?.url ?? String(testimonial.posterSrc ?? "/practice-01.webp"),
      videoSrc: typeof testimonial.videoSrc === "string" ? testimonial.videoSrc : undefined,
      cta: String(testimonial.cta ?? ""),
    },
    process: {
      title: String(content.processTitle ?? "How it works"),
      steps: asStringArray(landing.processSteps),
    },
    shortForm: {
      ...SHORT_FORM_COPY[lang],
      languageOptions: [
        { value: "EN", label: "English" },
        { value: "ES", label: "Español" },
        { value: "FR", label: "Français" },
      ],
      needOptions: NEED_OPTIONS[lang],
    },
    stickyCta: {
      whatsapp: String(stickyCta.whatsapp ?? "WhatsApp"),
      booking: String(stickyCta.booking ?? "Book"),
    },
    whatsapp: { messages },
    sections: {
      processEyebrow: String(sections.processEyebrow ?? "Process"),
      faqEyebrow: String(sections.faqEyebrow ?? "FAQ"),
      faqTitle: String(sections.faqTitle ?? "FAQ"),
    },
    faq: asFaq(landing.faq),
  };
}

export type DynamicCampaignConfig = CampaignLandingConfig & {
  landingPageId: string;
  destinationId: string;
  offerId?: string | null;
  trackingProfileId?: string | null;
  previewToken?: string | null;
};

export function landingPageToDynamicConfig(landing: LandingPageWithRelations): DynamicCampaignConfig {
  const base = landingPageToCampaignConfig(landing);
  return {
    ...base,
    landingPageId: landing.id,
    destinationId: landing.destinationId,
    offerId: landing.offerId,
    trackingProfileId: landing.trackingProfileId,
    previewToken: landing.previewToken,
  };
}

export { langToLocale };
