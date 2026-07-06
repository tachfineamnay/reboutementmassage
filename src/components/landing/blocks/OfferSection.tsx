"use client";

import OfferBlock from "@/components/campaign/OfferBlock";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { OfferSectionProps } from "@/lib/builder/puck-data-schema";

export default function OfferSection(props: OfferSectionProps) {
  const { config } = useLandingRenderContext();
  const cards = props.cards.length
    ? props.cards.map((card) => ({
        title: card.title,
        subtitle: card.subtitle,
        description: card.description,
        includes: card.includes,
        ctaLabel: card.ctaLabel,
        whatsappIntent: card.whatsappIntent,
      }))
    : undefined;

  return (
    <OfferBlock
      config={{
        ...config,
        offerBlock: {
          ...config.offerBlock,
          title: props.title || config.offerBlock.title,
          bullets: props.bullets.length ? props.bullets : config.offerBlock.bullets,
          launchRateLine: props.launchRateLine || config.offerBlock.launchRateLine,
          showPrice: props.showPrice,
          priceLabel: props.priceLabel || config.offerBlock.priceLabel,
          priceValue: props.priceValue || config.offerBlock.priceValue,
          cards,
        },
        offerBlocks: cards
          ? undefined
          : [
              {
                title: props.title || config.offerBlock.title,
                bullets: props.bullets.length ? props.bullets : config.offerBlock.bullets,
                launchRateLine: props.launchRateLine || config.offerBlock.launchRateLine,
                showPrice: props.showPrice,
                priceLabel: props.priceLabel || config.offerBlock.priceLabel,
                priceValue: props.priceValue || config.offerBlock.priceValue,
                ctaLabel: props.ctaLabel,
                whatsappIntent: props.whatsappIntent,
              },
            ],
      }}
    />
  );
}
