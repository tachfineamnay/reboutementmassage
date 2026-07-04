import type { CampaignLandingConfig, WhatsappIntent } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

type OfferCard = {
  title: string;
  subtitle?: string;
  description?: string;
  bullets?: string[];
  cta?: string;
  whatsappIntent?: WhatsappIntent;
};

type ExtendedOfferBlock = CampaignLandingConfig["offerBlock"] & {
  intro?: string;
  cards?: OfferCard[];
};

export default function OfferBlock({ config }: { config: CampaignLandingConfig }) {
  const offer = config.offerBlock as ExtendedOfferBlock;
  const cards = Array.isArray(offer.cards) ? offer.cards : [];

  function handleWhatsappClick(ctaLocation: string) {
    trackCampaignEvent("hero_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: ctaLocation,
      city: config.destinationSlug,
      offer: config.offerType,
      session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
    });
  }

  return (
    <section className="campaign-offer">
      <div className="container container--narrow">
        <div className="campaign-offer__card">
          <h2 className="campaign-offer__title">{offer.title}</h2>
          {offer.intro && <p className="campaign-offer__launch">{offer.intro}</p>}

          {cards.length > 0 ? (
            <div className="campaign-offer__cards">
              {cards.map((card) => {
                const whatsappIntent = card.whatsappIntent ?? "book_intent";
                const whatsappUrl = config.whatsappUrls[whatsappIntent] ?? config.whatsappUrls.book_intent;
                return (
                  <article className="campaign-offer__option" key={card.title}>
                    <h3 className="campaign-offer__option-title">{card.title}</h3>
                    {card.subtitle && <p className="campaign-offer__option-subtitle">{card.subtitle}</p>}
                    {card.description && <p className="campaign-offer__option-description">{card.description}</p>}
                    {card.bullets && card.bullets.length > 0 && (
                      <ul className="campaign-offer__list">
                        {card.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary campaign-offer__cta"
                      onClick={() => handleWhatsappClick(`offer_${whatsappIntent}`)}
                    >
                      {card.cta ?? config.hero.ctaPrimary}
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <>
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
              {offer.launchRateLine && <p className="campaign-offer__launch">{offer.launchRateLine}</p>}
              <a
                href={config.whatsappUrls.book_intent}
                target="_blank"
                rel="noreferrer"
                className="btn-primary campaign-offer__cta"
                onClick={() => handleWhatsappClick("offer")}
              >
                {config.hero.ctaPrimary}
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
