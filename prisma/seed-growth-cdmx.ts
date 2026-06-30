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
      prefilledMessageEs: CDMX_PRIVATE_SESSION_CAMPAIGNS.es.whatsapp.messages.default,
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
      prefilledMessageEs: CDMX_PRIVATE_SESSION_CAMPAIGNS.es.whatsapp.messages.default,
      ownerName: "Grégory Tordjman",
    },
  });

  const tracking = await prisma.trackingProfile.upsert({
    where: { id: destination.defaultTrackingProfileId ?? "cdmx-track-seed" },
    update: {
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null,
      ga4MeasurementId:
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-L07EKM18MY",
      status: "ACTIVE",
    },
    create: {
      id: "cdmx-track-seed",
      destinationId: destination.id,
      label: "CDMX Default Tracking",
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null,
      ga4MeasurementId:
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-L07EKM18MY",
      enableMeta: true,
      enableGA4: true,
      enableTikTok: Boolean(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
      status: "ACTIVE",
    },
  });

  const offer = await prisma.offer.upsert({
    where: { id: destination.defaultOfferId ?? "cdmx-offer-seed" },
    update: {
      durationMinutes: 75,
      showPrice: false,
      status: "LIVE",
    },
    create: {
      id: "cdmx-offer-seed",
      destinationId: destination.id,
      type: "FOUNDER_SESSION",
      internalName: "CDMX Founder Session 75min",
      publicNameFr: "Session de lancement CDMX",
      publicNameEn: "CDMX Founder Session",
      publicNameEs: "Sesión de lanzamiento CDMX",
      shortDescriptionFr: "French Body Reset privé — 75 minutes",
      shortDescriptionEn: "Private French Body Reset — 75 minutes",
      shortDescriptionEs: "Reset Corporal Francés privado — 75 minutos",
      durationMinutes: 75,
      currency: "MXN",
      showPrice: false,
      primaryCtaFr: "Vérifier une disponibilité sur WhatsApp",
      primaryCtaEn: "Check availability on WhatsApp",
      primaryCtaEs: "Consultar disponibilidad por WhatsApp",
      secondaryCtaFr: "Réserver une séance de 75 min",
      secondaryCtaEn: "Book a 75-min session",
      secondaryCtaEs: "Reservar una sesión de 75 min",
      status: "LIVE",
    },
  });

  const crmRule = await prisma.crmRoutingRule.upsert({
    where: { id: "cdmx-crm-seed" },
    update: { status: "ACTIVE" },
    create: {
      id: "cdmx-crm-seed",
      destinationId: destination.id,
      locale: null,
      offerType: "FOUNDER_SESSION",
      intent: "private_session",
      leadSegment: "b2c_premium",
      tags: ["city-cdmx", "offer-private-session", "landing-cdmx"],
      customFields: { campaignCity: "cdmx" },
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

    const landing = await prisma.landingPage.upsert({
      where: {
        locale_slug: { locale, slug: SLUGS[loc] },
      },
      update: {},
      create: {
        destinationId: destination.id,
        offerId: offer.id,
        locale,
        template: "MOBILE_WHATSAPP_FIRST",
        slug: SLUGS[loc],
        status: "LIVE",
        heroTitle: cfg.hero.title,
        heroSubtitle: cfg.hero.subtitle,
        microNote: cfg.hero.microNote,
        primaryCta: cfg.hero.ctaPrimary,
        secondaryCta: cfg.hero.ctaSecondary,
        painChips: cfg.forYouIf.items,
        proofBadges: cfg.proof.badges,
        processSteps: cfg.process.steps,
        faq: cfg.faq,
        complianceText: COMPLIANCE_DEFAULT_FR,
        whatsappChannelId: whatsapp.id,
        trackingProfileId: tracking.id,
        crmRoutingRuleId: crmRule.id,
        seoTitle: cfg.meta.title,
        metaDescription: cfg.meta.description,
        canonical: `/${loc}/${SLUGS[loc]}`,
        noindex: false,
        hreflangGroupId: HREFLANG_GROUP,
        xDefault: loc === "es",
        areaServed: "Ciudad de México",
        publishedAt: new Date(),
        content: {
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
      },
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
        quoteShort: cfg.testimonial.cta,
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
