import type { CampaignLandingConfig, CampaignOfferBlock, WhatsappIntent } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

export default function OfferBlock({ config }: { config: CampaignLandingConfig }) {
  const blocks: CampaignOfferBlock[] = config.offerBlocks?.length
    ? config.offerBlocks
    : [{ ...config.offerBlock, whatsappIntent: "book_intent" as WhatsappIntent }];

  function handleWhatsappClick(whatsappIntent: WhatsappIntent = "book_intent", offerTitle?: string) {
    trackCampaignEvent("hero_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "offer",
      city: config.destinationSlug,
      offer: offerTitle ?? config.offerType,
      session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
    });
  }

  function getWhatsappUrl(intent: WhatsappIntent = "book_intent") {
    return config.whatsappUrls[intent] ?? config.whatsappUrls.book_intent;
  }

  return (
    <section className="campaign-offer">
      <div className="container container--narrow">
        {config.offerBlocks?.length ? (
          <h2 className="campaign-offer__section-title">{config.offerBlock.title}</h2>
        ) : null}
        <div className={config.offerBlocks?.length ? "campaign-offer__grid" : undefined}>
          {blocks.map((offer) => {
            const intent = offer.whatsappIntent ?? "book_intent";
            const whatsappUrl = getWhatsappUrl(intent);

            return (
              <div key={offer.title} className="campaign-offer__card">
                <h2 className="campaign-offer__title">{offer.title}</h2>
                <ul className="campaign-offer__list">
                  {offer.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                {offer.showPrice && offer.priceLabel && offer.priceValue && (
                  <p className="campaign-offer__price">
                    <span>{offer.priceLabel}</span>
                    <strong>{offer.priceValue}</strong>
                  </p>
                )}
                {offer.launchRateLine && (
                  <p className="campaign-offer__launch">{offer.launchRateLine}</p>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary campaign-offer__cta"
                  onClick={() => handleWhatsappClick(intent, offer.title)}
                >
                  {offer.ctaLabel ?? config.hero.ctaPrimary}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
