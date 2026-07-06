import type { Prisma } from "@prisma/client";
import type { LandingBuilderInput } from "./landing-builder-schema";

export function mapBuilderToLandingDraft(input: LandingBuilderInput): Prisma.LandingPageUncheckedCreateInput {
  const content: Prisma.InputJsonValue = {
    hero: {
      imageAlt: input.hero.imageAlt,
    },
    shortForm: {
      leadSegment: input.conversion.leadSegment,
      headline: input.conversion.formHeadline,
      urgencyOptions: input.conversion.urgencyOptions,
    },
    builder: {
      source: "guided_builder_v1",
    },
  };

  return {
    destinationId: input.market.destinationId,
    offerId: input.offer.offerId,
    whatsappChannelId: input.offer.whatsappChannelId,
    trackingProfileId: input.offer.trackingProfileId,
    crmRoutingRuleId: input.offer.crmRoutingRuleId,
    locale: input.market.locale,
    template: input.market.template,
    slug: input.market.slug,
    status: "DRAFT",
    heroTitle: input.hero.heroTitle,
    heroSubtitle: input.hero.heroSubtitle || null,
    microNote: input.hero.microNote || null,
    primaryCta: input.hero.primaryCta,
    secondaryCta: input.hero.secondaryCta,
    heroImageId: input.hero.heroImageId,
    painChips: input.proof.painChips as Prisma.InputJsonValue,
    proofBadges: input.proof.badges as Prisma.InputJsonValue,
    processSteps: input.proof.processSteps as Prisma.InputJsonValue,
    testimonialIds: input.proof.testimonialIds as Prisma.InputJsonValue,
    content,
    complianceText: input.conversion.complianceText,
    seoTitle: input.seo.seoTitle || input.hero.heroTitle,
    metaDescription: input.seo.metaDescription || input.hero.heroSubtitle,
    canonical: input.seo.canonical,
    noindex: true,
    xDefault: input.seo.xDefault,
    hreflangGroupId: input.seo.hreflangGroupId,
  };
}
