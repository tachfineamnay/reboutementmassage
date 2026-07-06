"use client";

import type {
  CampaignLandingConfig,
  CampaignOfferBlock,
  CampaignOfferCard,
  WhatsappIntent,
} from "@/data/campaign-landings";
import { useGrowthTracking } from "@/components/TrackingProvider";

export default function OfferBlock({ config }: { config: CampaignLandingConfig }) {
  const { track } = useGrowthTracking();
  const cards: CampaignOfferCard[] = config.offerBlock.cards?.length
    ? config.offerBlock.cards
    : toOfferCards(
        config.offerBlocks?.length
          ? config.offerBlocks
          : [{ ...config.offerBlock, whatsappIntent: "book_intent" as WhatsappIntent }]
      );

  function handleWhatsappClick(whatsappIntent: WhatsappIntent = "book_intent", offerTitle?: string) {
    track("hero_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "offer",
      city: config.destinationSlug,
      offer: offerTitle ?? config.offerType,
      offer_intent: whatsappIntent,
      session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
    });
  }

  function getWhatsappUrl(intent: WhatsappIntent = "book_intent") {
    return config.whatsappUrls[intent] ?? config.whatsappUrls.book_intent;
  }

  return (
    <section className="campaign-offer" id="opciones">
      <div className="container">
        <h2 className="campaign-offer__section-title">{config.offerBlock.title}</h2>
        <div className="campaign-offer__grid">
          {cards.map((offer) => {
            const intent = offer.whatsappIntent ?? "book_intent";
            const whatsappUrl = getWhatsappUrl(intent);

            return (
              <div key={offer.title} className="campaign-offer__card">
                <div className="campaign-offer__card-head">
                  <h3 className="campaign-offer__title">{offer.title}</h3>
                  {offer.subtitle && <p className="campaign-offer__subtitle">{offer.subtitle}</p>}
                </div>
                {offer.description && <p className="campaign-offer__description">{offer.description}</p>}
                <ul className="campaign-offer__list">
                  {offer.includes.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary campaign-offer__cta"
                  onClick={() => handleWhatsappClick(intent, offer.title)}
                >
                  {offer.ctaLabel}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function toOfferCards(blocks: CampaignOfferBlock[]): CampaignOfferCard[] {
  return blocks.map((block) => ({
    title: block.title,
    subtitle: "",
    description: block.launchRateLine ?? "",
    includes: block.bullets,
    ctaLabel: block.ctaLabel ?? "WhatsApp",
    whatsappIntent: block.whatsappIntent ?? "book_intent",
  }));
}
