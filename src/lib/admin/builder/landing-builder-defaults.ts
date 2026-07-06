import type { LandingBuilderInput } from "./landing-builder-schema";

export function createLandingBuilderDefaults(
  patch: Partial<LandingBuilderInput> = {}
): LandingBuilderInput {
  return {
    market: {
      destinationId: "",
      locale: "FR",
      slug: "",
      template: "MOBILE_WHATSAPP_FIRST",
      ...patch.market,
    },
    offer: {
      offerId: null,
      whatsappChannelId: null,
      trackingProfileId: null,
      crmRoutingRuleId: null,
      ...patch.offer,
    },
    hero: {
      heroTitle: "",
      heroSubtitle: "",
      microNote: "",
      primaryCta: "WhatsApp",
      secondaryCta: "Réserver",
      heroImageId: null,
      imageAlt: "",
      ...patch.hero,
    },
    proof: {
      badges: [],
      painChips: [],
      processSteps: [],
      testimonialIds: [],
      ...patch.proof,
    },
    conversion: {
      leadSegment: "b2c_premium",
      formHeadline: "Demande rapide",
      urgencyOptions: [],
      complianceText: null,
      ...patch.conversion,
    },
    seo: {
      seoTitle: "",
      metaDescription: "",
      canonical: null,
      noindex: true,
      xDefault: false,
      hreflangGroupId: null,
      ...patch.seo,
    },
  };
}
