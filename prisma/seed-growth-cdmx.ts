/**
 * Seed Growth CMS — CDMX destination, offer, channels, landings, redirects.
 */
import type { PrismaClient, Locale } from "@prisma/client";
import { CDMX_PRIVATE_SESSION_CAMPAIGNS, getCdmxWhatsappNumber } from "@/data/campaign-landings";
import { COMPLIANCE_DEFAULT_FR } from "@/lib/growth/types";
import { computeLandingReadiness } from "@/lib/growth/landing-readiness";
import { growthLandingInclude } from "@/lib/growth/types";

const HREFLANG_GROUP = "cdmx-founder-session-2026";

const SLUGS = {
  en: "mexico-city-french-body-reset",
  es: "reset-corporal-frances-cdmx",
  fr: "french-body-reset-mexico-city",
} as const;

const LEGACY_PATHS = {
  en: "/en/mexico-city-private-session",
  es: "/es/sesion-privada-cdmx",
  fr: "/fr/seance-privee-mexico-city",
} as const;

const ES_WHATSAPP_MESSAGES = {
  default:
    "Hola Grégory, estoy en CDMX y quiero reservar una sesión de Body Reset. Me interesa saber si me conviene Body Reset Fix o French Body Reset Full.",
  book_intent:
    "Hola Grégory, estoy en CDMX y quiero reservar Body Reset Fix para una zona prioritaria.",
  more_info_intent:
    "Hola Grégory, estoy en CDMX y quiero información sobre French Body Reset Full, el protocolo de 3 sesiones.",
  testimonial_cta:
    "Hola Grégory, vi la información de Body Reset en CDMX y quiero saber qué formato me conviene.",
  sticky_cta:
    "Hola Grégory, estoy en CDMX y quiero reservar una sesión de Body Reset.",
};

const ES_OFFER_CARDS = [
  {
    title: "Body Reset Fix",
    subtitle: "Una sesión privada puntual para trabajar una prioridad clara.",
    description:
      "Ideal si sientes una zona cargada, una tensión específica o una sensación de cuerpo bloqueado. Es la forma más simple de vivir una primera experiencia Body Reset en CDMX.",
    includes: [
      "Sesión privada personalizada",
      "Lectura rápida de tu prioridad corporal",
      "Trabajo manual preciso en la zona principal",
      "Recomendaciones simples después de la sesión",
    ],
    ctaLabel: "Reservar Body Reset Fix",
    whatsappIntent: "book_intent",
  },
  {
    title: "French Body Reset Full",
    subtitle: "Un protocolo completo en 3 sesiones para un trabajo más profundo y progresivo.",
    description:
      "Ideal si quieres ir más allá de una sola zona y acompañar tu cuerpo con un proceso completo: lectura corporal, trabajo manual preciso, integración y orientación personalizada.",
    includes: [
      "3 sesiones privadas",
      "Lectura corporal progresiva",
      "Trabajo manual preciso y adaptado",
      "Integración entre sesiones",
      "Recomendaciones post-reset",
      "Orientación personalizada",
    ],
    ctaLabel: "Consultar el protocolo Full",
    whatsappIntent: "more_info_intent",
  },
];

const ES_SHORT_FORM = {
  label: "Solicitud rápida",
  headline: "Cuéntame qué necesita tu cuerpo.",
  sub: "Completa este formulario corto y te orientamos hacia Body Reset Fix o French Body Reset Full.",
  tensionLabel: "¿Qué quieres trabajar primero?",
  tensionPlaceholder: "Selecciona una opción",
  whatsappLabel: "WhatsApp",
  whatsappPlaceholder: "+52...",
  languageLabel: "Idioma preferido",
  languageOptions: [
    { value: "ES", label: "Español" },
    { value: "EN", label: "English" },
    { value: "FR", label: "Français" },
  ],
  needOptions: [
    { value: "back", label: "Espalda" },
    { value: "neck", label: "Cuello / nuca" },
    { value: "shoulders", label: "Hombros" },
    { value: "hips", label: "Caderas" },
    { value: "legs", label: "Piernas" },
    { value: "stress_loaded_body", label: "Estrés / cuerpo cargado" },
    { value: "fatigue", label: "Fatiga" },
    { value: "not_sure", label: "No estoy seguro/a" },
  ],
  submit: "Enviar solicitud",
  submitting: "Enviando...",
  contactError: "Indica un WhatsApp válido.",
  requiredError: "Este campo es necesario.",
  submitError: "No se pudo enviar. Revisa el contacto e inténtalo de nuevo.",
  successTitle: "Gracias.",
  successBody:
    "Recibimos tu solicitud. Te responderemos por WhatsApp para orientarte hacia el formato más adecuado.",
  successNote: "Tu solicitud queda registrada de forma confidencial.",
  newRequest: "Enviar otra solicitud",
  whatsappAfterLabel: "Añadir contexto por WhatsApp",
  nameLabel: "Nombre",
  namePlaceholder: "Tu nombre",
  offerLabel: "¿Qué formato te interesa más?",
  offerPlaceholder: "Selecciona una opción",
  offerOptions: [
    { value: "body_reset_fix", label: "Body Reset Fix — 1 sesión puntual" },
    { value: "french_body_reset_full", label: "French Body Reset Full — protocolo de 3 sesiones" },
    { value: "orientation", label: "No sé todavía, quiero orientación" },
  ],
  urgencyLabel: "¿Qué tan pronto quieres venir?",
  urgencyPlaceholder: "Selecciona una opción",
  urgencyOptions: [
    { value: "this_week", label: "Esta semana" },
    { value: "next_week", label: "La próxima semana" },
    { value: "comparing_options", label: "Estoy comparando opciones" },
    { value: "question_first", label: "Quiero hacer una pregunta primero" },
  ],
  contextLabel: "Mensaje opcional",
  contextPlaceholder: "Cuéntame en pocas palabras qué sientes o qué estás buscando.",
};

const ES_FAQ = [
  {
    question: "¿Es un masaje?",
    answer:
      "No es un masaje clásico de relajación. Es una sesión manual personalizada que empieza con una lectura del cuerpo y se adapta a lo que necesitas ese día.",
  },
  {
    question: "¿Es una consulta médica?",
    answer:
      "No. Body Reset es un acompañamiento manual de bienestar corporal. No reemplaza un diagnóstico, tratamiento médico ni seguimiento con un profesional de salud.",
  },
  {
    question: "¿Cuál es la diferencia entre Fix y Full?",
    answer:
      "Body Reset Fix es una sesión puntual para una prioridad clara. French Body Reset Full es un protocolo de 3 sesiones para un trabajo más profundo, progresivo y acompañado.",
  },
  {
    question: "¿Cuánto dura una sesión?",
    answer:
      "La duración depende del formato elegido. Body Reset Fix es una sesión puntual. French Body Reset Full se realiza en 3 sesiones privadas.",
  },
  {
    question: "¿Cómo sé qué opción elegir?",
    answer:
      "Si tienes una prioridad clara, empieza con Body Reset Fix. Si quieres un acompañamiento más completo, elige French Body Reset Full o escribe por WhatsApp para recibir orientación.",
  },
  {
    question: "¿Cómo reservo?",
    answer:
      "Puedes escribir por WhatsApp o completar el formulario. Te responderemos para confirmar disponibilidad y elegir el formato adecuado.",
  },
];

const ES_PAIN_CHIPS = [
  "Espalda cargada",
  "Cuello rígido",
  "Hombros tensos",
  "Caderas bloqueadas",
  "Piernas pesadas",
  "Estrés",
  "Fatiga acumulada",
  "Cuerpo trabado",
  "Después de viaje",
  "Mucha computadora",
];

const ES_PROCESS_STEPS = [
  "Escribes por WhatsApp o completas el formulario.",
  "Indicas tu prioridad corporal y el formato que te interesa.",
  "Recibes una sesión privada adaptada a tu cuerpo.",
  "Sales con recomendaciones claras para integrar el trabajo.",
];

const ES_PROOF_BADGES = [
  { value: "Experiencia francesa", label: "enfoque manual" },
  { value: "Atención privada", label: "con cita previa" },
  { value: "CDMX", label: "sesiones limitadas" },
];

const ES_COMPLIANCE =
  "Body Reset es un acompañamiento manual de bienestar corporal. No reemplaza un diagnóstico, tratamiento médico ni seguimiento con un profesional de salud.";

const esBodyResetCopy = {
  heroTitle: "Body Reset — CDMX",
  heroSubtitle:
    "Una sesión privada para soltar tensiones, recuperar movilidad y sentir un cuerpo más libre.",
  microNote: "Atención privada con cita previa en CDMX. Cupos limitados por semana.",
  primaryCta: "Reservar por WhatsApp",
  secondaryCta: "Ver las opciones",
  painChips: ES_PAIN_CHIPS,
  proofBadges: ES_PROOF_BADGES,
  processSteps: ES_PROCESS_STEPS,
  faq: ES_FAQ,
  content: {
    difference: {
      title: "No es un masaje clásico. Es un reset corporal preciso.",
      body:
        "Un masaje tradicional suele buscar relajación general. Body Reset empieza con una lectura del cuerpo: cómo respiras, cómo te mueves, dónde cargas tensión y qué zona necesita prioridad.\n\nA partir de esa lectura, el trabajo manual se adapta a tu cuerpo ese día. La intención no es forzar, sino crear espacio, soltar carga y ayudarte a recuperar una sensación de movilidad, ligereza y presencia corporal.",
      points: [
        "Lectura corporal antes de empezar",
        "Trabajo manual profundo, pero calibrado",
        "Enfoque en tensión, movilidad y descanso corporal",
        "Experiencia francesa aplicada de forma personalizada",
        "Recomendaciones claras después de la sesión",
      ],
      imageAlt: "Body Reset manual en CDMX",
    },
    offerBlock: {
      title: "Elige el formato que mejor corresponde a tu cuerpo.",
      bullets: [],
      showPrice: false,
      cards: ES_OFFER_CARDS,
    },
    shortForm: ES_SHORT_FORM,
    testimonial: {
      posterSrc: "/practice-01.webp",
      cta: "Preguntar qué formato me conviene",
    },
    stickyCta: {
      whatsapp: "WhatsApp Grégory",
      booking: "Formulario",
    },
    sections: {
      processEyebrow: "Proceso",
      faqEyebrow: "FAQ",
      faqTitle: "Preguntas frecuentes",
    },
    forYouIfTitle: "Para ti si tu cuerpo te pide una pausa real.",
    forYouIfBody:
      "Body Reset puede ser una buena opción si sientes el cuerpo cargado, rígido o menos libre de lo habitual.",
    processTitle: "Simple, privado y personalizado.",
    hero: {
      eyebrow: "Sesiones privadas en Ciudad de México",
      body:
        "No es un masaje clásico. Es un trabajo manual preciso, personalizado y de inspiración francesa para escuchar tu cuerpo, liberar carga acumulada y elegir el formato adecuado para ti.",
      secondaryHref: "#opciones",
      proofLine: "Experiencia francesa · Atención privada · Enfoque personalizado",
      imageAlt: "Body Reset — CDMX",
    },
    finalCta: {
      title: "Tu cuerpo no necesita más presión. Necesita ser escuchado con precisión.",
      body:
        "Reserva tu sesión privada en CDMX o escribe por WhatsApp para elegir el formato más adecuado.",
      primary: "Hablar por WhatsApp",
      secondary: "Completar formulario",
    },
    branchData: {
      campaignCity: "cdmx",
      offerFamily: "body_reset",
      landing: "reset-corporal-frances-cdmx",
    },
    whatsappMessages: ES_WHATSAPP_MESSAGES,
  },
};

function ga4MeasurementId() {
  return process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? null;
}

function buildLandingContent(loc: "en" | "es" | "fr") {
  const cfg = CDMX_PRIVATE_SESSION_CAMPAIGNS[loc];
  if (loc === "es") return esBodyResetCopy.content;

  return {
    difference: cfg.difference,
    offerBlock: cfg.offerBlock,
    offerBlocks: cfg.offerBlocks,
    shortForm: cfg.shortForm,
    testimonial: cfg.testimonial,
    stickyCta: cfg.stickyCta,
    sections: cfg.sections,
    forYouIfTitle: cfg.forYouIf.title,
    processTitle: cfg.process.title,
    hero: {
      eyebrow: cfg.hero.eyebrow,
      proofLine: cfg.hero.proofLine,
      imageAlt: cfg.hero.imageAlt,
    },
    whatsappMessages: cfg.whatsapp.messages,
  };
}

export async function seedGrowthCdmx(prisma: PrismaClient) {
  const phone = getCdmxWhatsappNumber();
  const phoneE164 = `+${phone}`;

  const destination = await prisma.destination.upsert({
    where: { slug: "cdmx" },
    update: {
      cityName: "Ciudad de México",
      displayNameFr: "Mexico City",
      displayNameEn: "Mexico City",
      displayNameEs: "Ciudad de México",
      country: "MX",
      region: "CDMX",
      timezone: "America/Mexico_City",
      currency: "MXN",
      locales: ["ES", "EN", "FR"],
      status: "LIVE",
      maturity: "ACTIVE",
    },
    create: {
      slug: "cdmx",
      cityName: "Ciudad de México",
      displayNameFr: "Mexico City",
      displayNameEn: "Mexico City",
      displayNameEs: "Ciudad de México",
      country: "MX",
      region: "CDMX",
      timezone: "America/Mexico_City",
      currency: "MXN",
      locales: ["ES", "EN", "FR"],
      status: "LIVE",
      maturity: "ACTIVE",
      neighborhoods: ["Polanco", "Roma Norte", "Condesa", "Reforma"],
      targetSegments: ["travelers", "executives", "athletes"],
    },
  });

  const whatsapp = await prisma.whatsappChannel.upsert({
    where: { id: destination.defaultWhatsappChannelId ?? "cdmx-wa-seed" },
    update: {
      phoneE164,
      status: "ACTIVE",
      prefilledMessageFr: CDMX_PRIVATE_SESSION_CAMPAIGNS.fr.whatsapp.messages.default,
      prefilledMessageEn: CDMX_PRIVATE_SESSION_CAMPAIGNS.en.whatsapp.messages.default,
      prefilledMessageEs: esBodyResetCopy.content.whatsappMessages.default,
    },
    create: {
      id: "cdmx-wa-seed",
      destinationId: destination.id,
      label: "CDMX WhatsApp Grégory",
      phoneE164,
      provider: "WHATSAPP_APP",
      status: "ACTIVE",
      defaultLocale: "ES",
      prefilledMessageFr: CDMX_PRIVATE_SESSION_CAMPAIGNS.fr.whatsapp.messages.default,
      prefilledMessageEn: CDMX_PRIVATE_SESSION_CAMPAIGNS.en.whatsapp.messages.default,
      prefilledMessageEs: esBodyResetCopy.content.whatsappMessages.default,
      ownerName: "Grégory Tordjman",
    },
  });

  const tracking = await prisma.trackingProfile.upsert({
    where: { id: destination.defaultTrackingProfileId ?? "cdmx-track-seed" },
    update: {
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null,
      ga4MeasurementId: ga4MeasurementId(),
      status: "ACTIVE",
    },
    create: {
      id: "cdmx-track-seed",
      destinationId: destination.id,
      label: "CDMX Default Tracking",
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null,
      ga4MeasurementId: ga4MeasurementId(),
      enableMeta: true,
      enableGA4: Boolean(ga4MeasurementId()),
      enableTikTok: Boolean(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
      status: "ACTIVE",
    },
  });

  const offer = await prisma.offer.upsert({
    where: { id: destination.defaultOfferId ?? "cdmx-offer-seed" },
    update: {
      publicNameEs: "Body Reset — CDMX",
      shortDescriptionEs: "Body Reset Fix o French Body Reset Full en CDMX",
      primaryCtaEs: "Reservar por WhatsApp",
      secondaryCtaEs: "Ver las opciones",
      durationMinutes: 75,
      showPrice: false,
      status: "LIVE",
    },
    create: {
      id: "cdmx-offer-seed",
      destinationId: destination.id,
      type: "FOUNDER_SESSION",
      internalName: "CDMX Body Reset",
      publicNameFr: "Session de lancement CDMX",
      publicNameEn: "CDMX Founder Session",
      publicNameEs: "Body Reset — CDMX",
      shortDescriptionFr: "French Body Reset privé — 75 minutes",
      shortDescriptionEn: "Private French Body Reset — 75 minutes",
      shortDescriptionEs: "Body Reset Fix o French Body Reset Full en CDMX",
      durationMinutes: 75,
      currency: "MXN",
      showPrice: false,
      primaryCtaFr: "Vérifier une disponibilité sur WhatsApp",
      primaryCtaEn: "Check availability on WhatsApp",
      primaryCtaEs: "Reservar por WhatsApp",
      secondaryCtaFr: "Réserver une séance de 75 min",
      secondaryCtaEn: "Book a 75-min session",
      secondaryCtaEs: "Ver las opciones",
      status: "LIVE",
    },
  });

  const crmRule = await prisma.crmRoutingRule.upsert({
    where: { id: "cdmx-crm-seed" },
    update: {
      status: "ACTIVE",
      tags: ["city-cdmx", "offer-body-reset", "landing-cdmx"],
      customFields: { campaignCity: "cdmx", offerFamily: "body_reset" },
      intent: null,
      ghlWorkflowId: process.env.GHL_WORKFLOW_ID ?? null,
      ghlPipelineId: process.env.GHL_PIPELINE_ID ?? null,
      ghlPipelineStageId: process.env.GHL_PIPELINE_STAGE_ID ?? null,
    },
    create: {
      id: "cdmx-crm-seed",
      destinationId: destination.id,
      locale: null,
      offerType: "FOUNDER_SESSION",
      intent: null,
      leadSegment: "b2c_premium",
      tags: ["city-cdmx", "offer-body-reset", "landing-cdmx"],
      customFields: { campaignCity: "cdmx", offerFamily: "body_reset" },
      priority: 10,
      status: "ACTIVE",
      ghlWorkflowId: process.env.GHL_WORKFLOW_ID ?? null,
      ghlPipelineId: process.env.GHL_PIPELINE_ID ?? null,
      ghlPipelineStageId: process.env.GHL_PIPELINE_STAGE_ID ?? null,
    },
  });

  await prisma.destination.update({
    where: { id: destination.id },
    data: {
      defaultWhatsappChannelId: whatsapp.id,
      defaultTrackingProfileId: tracking.id,
      defaultOfferId: offer.id,
    },
  });

  const locales = ["en", "es", "fr"] as const;

  for (const loc of locales) {
    const cfg = CDMX_PRIVATE_SESSION_CAMPAIGNS[loc];
    const locale: Locale = loc === "en" ? "EN" : loc === "es" ? "ES" : "FR";
    const isSpanish = loc === "es";
    const landingData = {
      destinationId: destination.id,
      offerId: offer.id,
      locale,
      template: "MOBILE_WHATSAPP_FIRST" as const,
      slug: SLUGS[loc],
      status: "LIVE" as const,
      heroTitle: isSpanish ? esBodyResetCopy.heroTitle : cfg.hero.title,
      heroSubtitle: isSpanish ? esBodyResetCopy.heroSubtitle : cfg.hero.subtitle,
      microNote: isSpanish ? esBodyResetCopy.microNote : cfg.hero.microNote,
      primaryCta: isSpanish ? esBodyResetCopy.primaryCta : cfg.hero.ctaPrimary,
      secondaryCta: isSpanish ? esBodyResetCopy.secondaryCta : cfg.hero.ctaSecondary,
      painChips: isSpanish ? esBodyResetCopy.painChips : cfg.forYouIf.items,
      proofBadges: isSpanish ? esBodyResetCopy.proofBadges : cfg.proof.badges,
      processSteps: isSpanish ? esBodyResetCopy.processSteps : cfg.process.steps,
      faq: isSpanish ? esBodyResetCopy.faq : cfg.faq,
      complianceText: isSpanish ? ES_COMPLIANCE : COMPLIANCE_DEFAULT_FR,
      whatsappChannelId: whatsapp.id,
      trackingProfileId: tracking.id,
      crmRoutingRuleId: crmRule.id,
      seoTitle: isSpanish
        ? "Body Reset CDMX | Reset Corporal Francés en Ciudad de México"
        : cfg.meta.title,
      metaDescription: isSpanish
        ? "Sesión privada de Body Reset en CDMX con Grégory Tordjman. Una experiencia manual precisa para soltar tensiones, recuperar movilidad y elegir entre Body Reset Fix o French Body Reset Full."
        : cfg.meta.description,
      canonical: `/${loc}/${SLUGS[loc]}`,
      noindex: false,
      hreflangGroupId: HREFLANG_GROUP,
      xDefault: loc === "es",
      areaServed: "Ciudad de México",
      publishedAt: new Date(),
      content: buildLandingContent(loc),
    };

    const landing = await prisma.landingPage.upsert({
      where: {
        locale_slug: { locale, slug: SLUGS[loc] },
      },
      update: landingData,
      create: landingData,
    });

    const full = await prisma.landingPage.findUniqueOrThrow({
      where: { id: landing.id },
      include: growthLandingInclude,
    });
    const readiness = computeLandingReadiness(full);
    await prisma.landingPage.update({
      where: { id: landing.id },
      data: {
        readinessScore: readiness.score,
        readinessIssues: readiness.issues,
      },
    });

    await prisma.testimonial.upsert({
      where: { id: `cdmx-testimonial-${loc}` },
      update: {
        quoteShort: isSpanish ? esBodyResetCopy.content.testimonial.cta : cfg.testimonial.cta,
        status: "LIVE",
      },
      create: {
        id: `cdmx-testimonial-${loc}`,
        displayName: loc === "es" ? "Cliente CDMX" : loc === "en" ? "US Client" : "Cliente FR",
        locale,
        destinationId: destination.id,
        offerId: offer.id,
        quoteShort: isSpanish ? esBodyResetCopy.content.testimonial.cta : cfg.testimonial.cta,
        consentWebsite: true,
        consentOrganic: true,
        status: "LIVE",
        priority: loc === "en" ? 10 : loc === "es" ? 9 : 8,
        emotionalScore: 8,
        credibilityScore: 8,
      },
    });

    await prisma.redirectRule.upsert({
      where: { sourcePath: LEGACY_PATHS[loc] },
      update: { targetPath: `/${loc}/${SLUGS[loc]}`, active: true, statusCode: 301 },
      create: {
        sourcePath: LEGACY_PATHS[loc],
        targetPath: `/${loc}/${SLUGS[loc]}`,
        statusCode: 301,
        active: true,
        reason: "CDMX landing slug migration",
      },
    });
  }

  console.log("✅ Growth CDMX seed complete");
}
