"use client";

import { useEffect, useState } from "react";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { useGrowthTracking } from "@/components/TrackingProvider";

export default function MobileStickyCta({
  config,
  singleCta = false,
}: {
  config: CampaignLandingConfig;
  singleCta?: boolean;
}) {
  const whatsappUrl = config.whatsappUrls.sticky_cta;
  const [visible, setVisible] = useState(false);
  const { track } = useGrowthTracking();

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 80);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleWhatsappClick() {
    track("sticky_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "sticky",
      city: config.destinationSlug,
      offer: config.offerType,
      session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
    });
  }

  function handleBookingClick() {
    track("booking_clicked", {
      language: config.htmlLang,
      cta_location: "sticky",
      city: config.destinationSlug,
      offer: config.offerType,
      session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
    });
  }

  return (
    <div
      className={`campaign-sticky ${singleCta ? "campaign-sticky--single" : ""} ${visible ? "is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="campaign-sticky__wa"
        onClick={handleWhatsappClick}
      >
        {config.stickyCta.whatsapp}
      </a>
      {!singleCta && (
        <a href="#solicitud" className="campaign-sticky__book" onClick={handleBookingClick}>
          {config.stickyCta.booking}
        </a>
      )}
    </div>
  );
}
