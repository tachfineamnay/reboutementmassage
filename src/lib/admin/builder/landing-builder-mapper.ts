import type { Prisma } from "@prisma/client";
import type { LandingBuilderInput } from "./landing-builder-schema";

export function mapBuilderToLandingDraft(input: LandingBuilderInput) {
  const content: Prisma.InputJsonValue = {
    hero: {
      imageAlt: input.hero.imageAlt,
    },
    shortForm: {
      headline: input.conversion.formHeadline,
      urgencyOptions: input.conversion.urgencyOptions,
    },
  };

  return {
    destinationId: input.market.destinationId,
    offerId: input.offer.offerId,
    whatsappChannelId: input.offer.whatsappChannelId,
    locale: input.market.locale,
    slug: input.market.slug,
    heroTitle: input.hero.title,
    heroSubtitle: input.hero.subtitle,
    primaryCta: input.hero.primaryCta,
    secondaryCta: input.hero.secondaryCta,
    heroImageId: input.hero.heroImageId,
    proofBadges: input.proof.badges as Prisma.InputJsonValue,
    testimonialIds: input.proof.testimonialIds as Prisma.InputJsonValue,
    content,
    seoTitle: input.seo.seoTitle || input.hero.title,
    metaDescription: input.seo.metaDescription || input.hero.subtitle,
    noindex: input.seo.noindex,
  };
}
