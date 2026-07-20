"use client";

import { useEffect } from "react";
import CampaignFaq from "@/components/campaign/CampaignFaq";
import CampaignFinalCta from "@/components/campaign/CampaignFinalCta";
import CampaignHero from "@/components/campaign/CampaignHero";
import CampaignProcess from "@/components/campaign/CampaignProcess";
import DifferenceBlock from "@/components/campaign/DifferenceBlock";
import ForYouIfBlock from "@/components/campaign/ForYouIfBlock";
import MobileStickyCta from "@/components/campaign/MobileStickyCta";
import OfferBlock from "@/components/campaign/OfferBlock";
import ProofBadges from "@/components/campaign/ProofBadges";
import ShortLeadForm from "@/components/campaign/ShortLeadForm";
import TestimonialVideoBlock from "@/components/campaign/TestimonialVideoBlock";
import SharedFooter from "@/components/SharedFooter";
import SharedHeader from "@/components/SharedHeader";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { trackGrowthEvent } from "@/lib/growth/tracking";

type MobileLandingConfig = CampaignLandingConfig & {
  landingPageId?: string | null;
  destinationId?: string;
  offerId?: string | null;
  variantId?: string;
};

export default function MobileWhatsappFirstLanding({ config }: { config: MobileLandingConfig }) {
  const headerWhatsappUrl = config.whatsappUrls.default;

  useEffect(() => {
    document.documentElement.setAttribute("data-density", "compact");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "editorial");
    document.documentElement.lang = config.htmlLang;
    document.body.classList.add("has-campaign-sticky");

    if (!config.landingPageId) {
      trackGrowthEvent("landing_viewed", {
        language: config.htmlLang,
        city: config.destinationSlug,
        country: config.country,
        locale: config.htmlLang,
        offer: config.offerType,
        offerType: config.offerType,
        session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
        content_name: config.tracking.viewContentName,
      });
    }

    return () => {
      document.body.classList.remove("has-campaign-sticky");
    };
  }, [config]);

  return (
    <>
      <SharedHeader
        lang={config.language}
        activePage="seances"
        heroStyle="dark"
        ctaHrefOverride={headerWhatsappUrl}
        ctaLabelOverride={config.hero.ctaPrimary}
        ctaExternal
      />
      <main className="campaign-page">
        <CampaignHero config={config} />
        <DifferenceBlock config={config} />
        <OfferBlock config={config} />
        <ForYouIfBlock config={config} />
        <ProofBadges config={config} />
        <TestimonialVideoBlock config={config} />
        <CampaignProcess config={config} />
        <ShortLeadForm config={config} id="solicitud" />
        <CampaignFaq config={config} />
        <CampaignFinalCta config={config} />
      </main>
      <SharedFooter
        lang={config.language}
        market={config.destinationSlug === "cdmx" ? "cdmx" : "default"}
      />
      <MobileStickyCta config={config} />
    </>
  );
}
