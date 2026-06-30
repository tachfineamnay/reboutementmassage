import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

export default function OfferBlock({ config }: { config: CampaignLandingConfig }) {
  const whatsappUrl = config.whatsappUrls.book_intent;
  const offer = config.offerBlock;

  function handleWhatsappClick() {
    trackCampaignEvent("hero_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "offer",
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
            onClick={handleWhatsappClick}
          >
            {config.hero.ctaPrimary}
          </a>
        </div>
      </div>
    </section>
  );
}
