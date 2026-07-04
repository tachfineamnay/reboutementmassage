/**
 * Seed Growth CMS — CDMX destination, offer, channels, landings, redirects.
 */
import type { PrismaClient } from "@prisma/client";
import { CDMX_PRIVATE_SESSION_CAMPAIGNS } from "@/data/campaign-landings";
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

const esBodyResetCopy = {
  heroTitle: "Body Reset — CDMX",
  heroSubtitle: "Una sesión privada para soltar tensiones y recuperar un cuerpo más libre.",
  microNote: "Atención privada con cita previa en Ciudad de México. Cupos limitados por semana.",
  primaryCta: "Reservar una sesión",
  secondaryCta: "Escribir por WhatsApp",
  painChips: [
    "Espalda cargada",
    "Cuello rígido",
    "Hombros tensos",
    "Caderas bloqueadas",
    "Piernas pesadas",
    "Estrés",
    "Fatiga acumulada",
    "Cuerpo trabado",
  ],
  processSteps: [
    "Reserva o escribe por WhatsApp",
    "Completa un formulario corto para entender tu prioridad",
    "Recibes una sesión privada adaptada a tu cuerpo",
    "Te vas con recomendaciones claras para integrar el reset",
  ],
  faq: [
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
      question: "¿Qué opción debo elegir?",
      answer:
        "Si tienes una prioridad clara, empieza con Body Reset Fix. Si quieres un acompañamiento más completo, elige French Body Reset Full o escribe por WhatsApp para recibir orientación.",
    },
    {
      question: "¿Cómo reservo?",
      answer:
        "Envía una solicitud o escribe por WhatsApp. Te responderemos para elegir el formato adecuado y confirmar disponibilidad en CDMX.",
    },
  ],
  content: {
    difference: {
      title: "No es un masaje clásico. Es un reset corporal preciso.",
      body: "Un masaje tradicional suele buscar relajación general. Body Reset empieza con una lectura del cuerpo: cómo respiras, cómo te mueves, dónde cargas tensión y qué zona necesita prioridad. A partir de esa lectura, el trabajo manual se adapta a tu cuerpo ese día.",
      points: [
        "Lectura corporal antes de empezar",
        "Trabajo manual profundo, pero calibrado",
        "Enfoque en tensión, movilidad y relajación corporal",
        "Experiencia francesa aplicada de forma personalizada",
        "Recomendaciones claras después de la sesión",
      ],
      imageAlt: "Body Reset manual en CDMX",
    },
    offerBlock: {
      title: "Elige el formato que mejor corresponde a tu cuerpo.",
      bullets: [
        "Body Reset Fix — 1 sesión privada puntual para una zona prioritaria, una tensión clara o una sensación de cuerpo cargado.",
        "Ideal si quieres una primera experiencia simple, recuperar movilidad y sentir más ligereza.",
        "French Body Reset Full — protocolo completo en 3 sesiones para un trabajo más profundo y progresivo.",
        "Ideal si quieres lectura corporal, trabajo manual preciso, integración, seguimiento post-reset y orientación personalizada.",
      ],
      launchRateLine: "Escribe por WhatsApp para saber qué formato corresponde mejor a tu cuerpo.",
      showPrice: false,
    },
    testimonial: {
      posterSrc: "/practice-01.webp",
      cta: "Preguntar a Grégory qué formato elegir",
    },
    stickyCta: {
      whatsapp: "WhatsApp Grégory",
      booking: "Reservar sesión",
    },
    sections: {
      processEyebrow: "Proceso",
      faqEyebrow: "FAQ",
      faqTitle: "Preguntas frecuentes",
    },
    forYouIfTitle: "Para ti si tu cuerpo te pide una pausa real.",
    processTitle: "Simple, privado y personalizado.",
    hero: {
      eyebrow: "Sesiones privadas en CDMX",
      proofLine: "Experiencia francesa · Atención privada · Orientación personalizada",
      imageAlt: "Body Reset — CDMX",
    },
    whatsappMessages: {
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
    },
  },
};

export async function seedGrowthCdmx(prisma: PrismaClient) {
  const phone =
    process.env.NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    "33665517735";
  const phoneE164 = phone.startsWith("+") ? phone : `+${phone}`;

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
      ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? null,
      status: "ACTIVE",
    },
    create: {
      id: "cdmx-track-seed",
      destinationId: destination.id,
      label: "CDMX Default Tracking",
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null,
      ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? null,
      enableMeta: true,
      enableGA4: Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
      enableTikTok: Boolean(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
      status: "ACTIVE",
    },
  });

  const offer = await prisma.offer.upsert({
    where: { id: destination.defaultOfferId ?? "cdmx-offer-seed" },
    update: {
      publicNameEs: "Body Reset — CDMX",
      shortDescriptionEs: "Body Reset Fix o French Body Reset Full en CDMX",
      primaryCtaEs: "Reservar una sesión",
      secondaryCtaEs: "Escribir por WhatsApp",
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
      primaryCtaEs: "Reservar una sesión",
      secondaryCtaFr: "Réserver une séance de 75 min",
      secondaryCtaEn: "Book a 75-min session",
      secondaryCtaEs: "Escribir por WhatsApp",
      status: "LIVE",
    },
  });

  const crmRule = await prisma.crmRoutingRule.upsert({
    where: { id: "cdmx-crm-seed" },
    update: {
      status: "ACTIVE",
      tags: ["city-cdmx", "offer-body-reset", "landing-cdmx"],
      customFields: { campaignCity: "cdmx", offerFamily: "body_reset" },
    },
    create: {
      id: "cdmx-crm-seed",
      destinationId: destination.id,
      locale: null,
      offerType: "FOUNDER_SESSION",
      intent: "private_session",
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
    const locale = loc === "en" ? "EN" : loc === "es" ? "ES" : "FR";
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
      proofBadges: cfg.proof.badges,
      processSteps: isSpanish ? esBodyResetCopy.processSteps : cfg.process.steps,
      faq: isSpanish ? esBodyResetCopy.faq : cfg.faq,
      complianceText: COMPLIANCE_DEFAULT_FR,
      whatsappChannelId: whatsapp.id,
      trackingProfileId: tracking.id,
      crmRoutingRuleId: crmRule.id,
      seoTitle: isSpanish
        ? "Body Reset CDMX | Reset Corporal Francés | Grégory Tordjman"
        : cfg.meta.title,
      metaDescription: isSpanish
        ? "Body Reset en CDMX: una experiencia manual precisa para soltar tensiones y elegir entre Body Reset Fix o French Body Reset Full. Reserva por WhatsApp."
        : cfg.meta.description,
      canonical: `/${loc}/${SLUGS[loc]}`,
      noindex: false,
      hreflangGroupId: HREFLANG_GROUP,
      xDefault: loc === "es",
      areaServed: "Ciudad de México",
      publishedAt: new Date(),
      content: isSpanish
        ? esBodyResetCopy.content
        : {
            difference: cfg.difference,
            offerBlock: cfg.offerBlock,
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
          },
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
      update: {},
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
      update: { targetPath: `/${loc}/${SLUGS[loc]}`, active: true },
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
