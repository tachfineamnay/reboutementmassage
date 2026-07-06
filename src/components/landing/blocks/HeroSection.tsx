"use client";

import CampaignHero from "@/components/campaign/CampaignHero";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { HeroSectionProps } from "@/lib/builder/puck-data-schema";

export default function HeroSection(props: HeroSectionProps) {
  const { config } = useLandingRenderContext();

  return (
    <CampaignHero
      config={{
        ...config,
        hero: {
          ...config.hero,
          eyebrow: props.eyebrow || config.hero.eyebrow,
          title: props.title || config.hero.title,
          subtitle: props.subtitle || config.hero.subtitle,
          body: props.body || undefined,
          microNote: props.microNote || config.hero.microNote,
          ctaPrimary: props.primaryCta || config.hero.ctaPrimary,
          ctaSecondary: props.secondaryCta || config.hero.ctaSecondary,
          ctaSecondaryHref: props.secondaryHref || config.hero.ctaSecondaryHref,
          proofLine: props.proofLine || config.hero.proofLine,
          imageSrc: props.imageSrc || config.hero.imageSrc,
          imageAlt: props.imageAlt || config.hero.imageAlt,
        },
      }}
    />
  );
}
