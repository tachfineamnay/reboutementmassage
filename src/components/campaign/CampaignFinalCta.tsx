"use client";

import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { useGrowthTracking } from "@/components/TrackingProvider";

export default function CampaignFinalCta({ config }: { config: CampaignLandingConfig }) {
  const { track } = useGrowthTracking();

  if (!config.finalCta) return null;

  function handleWhatsappClick() {
    track("hero_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "final_cta",
      city: config.destinationSlug,
      offer: config.offerType,
      session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
    });
  }

  function handleFormClick() {
    track("booking_clicked", {
      language: config.htmlLang,
      cta_location: "final_cta",
      city: config.destinationSlug,
      offer: config.offerType,
      session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
    });
  }

  return (
    <section className="campaign-final-cta">
      <div className="container container--narrow">
        <h2 className="campaign-final-cta__title">{config.finalCta.title}</h2>
        <p className="campaign-final-cta__body">{config.finalCta.body}</p>
        <div className="campaign-final-cta__actions">
          <a
            href={config.whatsappUrls.default}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            onClick={handleWhatsappClick}
          >
            {config.finalCta.primary}
          </a>
          <a href="#solicitud" className="btn-secondary" onClick={handleFormClick}>
            {config.finalCta.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
