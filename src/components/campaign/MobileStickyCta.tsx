"use client";

import { useEffect, useState } from "react";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { getCdmxLocaleFromLanguage, getCdmxWhatsappUrl } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

export default function MobileStickyCta({ config }: { config: CampaignLandingConfig }) {
  const locale = getCdmxLocaleFromLanguage(config.language);
  const whatsappUrl = getCdmxWhatsappUrl(locale, "sticky_cta");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 80);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleWhatsappClick() {
    trackCampaignEvent("sticky_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "sticky",
    });
  }

  function handleBookingClick() {
    trackCampaignEvent("booking_clicked", {
      language: config.htmlLang,
      cta_location: "sticky",
    });
  }

  return (
    <div className={`campaign-sticky ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="campaign-sticky__wa"
        onClick={handleWhatsappClick}
      >
        {config.stickyCta.whatsapp}
      </a>
      <a href="#solicitud" className="campaign-sticky__book" onClick={handleBookingClick}>
        {config.stickyCta.booking}
      </a>
    </div>
  );
}
