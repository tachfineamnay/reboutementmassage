import type { LandingBuilderInput } from "./landing-builder-schema";

export function createLandingBuilderDefaults(
  patch: Partial<LandingBuilderInput> = {}
): LandingBuilderInput {
  return {
    market: {
      destinationId: "",
      locale: "FR",
      slug: "",
      ...patch.market,
    },
    offer: {
      offerId: null,
      whatsappChannelId: null,
      ...patch.offer,
    },
    hero: {
      title: "",
      subtitle: "",
      primaryCta: "WhatsApp",
      secondaryCta: "Réserver",
      heroImageId: null,
      imageAlt: "",
      ...patch.hero,
    },
    proof: {
      badges: [],
      testimonialIds: [],
      ...patch.proof,
    },
    conversion: {
      leadSegment: "b2c_premium",
      formHeadline: "Demande rapide",
      urgencyOptions: [],
      ...patch.conversion,
    },
    seo: {
      seoTitle: "",
      metaDescription: "",
      noindex: true,
      ...patch.seo,
    },
  };
}
