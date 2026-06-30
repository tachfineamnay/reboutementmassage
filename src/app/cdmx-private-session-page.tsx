"use client";

import { useEffect } from "react";
import CampaignFaq from "@/components/campaign/CampaignFaq";
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
import { getCdmxLocaleFromLanguage, getCdmxWhatsappUrl } from "@/data/campaign-landings";
import { trackLandingViewed } from "@/lib/campaign-tracking";

export default function CdmxPrivateSessionPage({ config }: { config: CampaignLandingConfig }) {
  const locale = getCdmxLocaleFromLanguage(config.language);
  const headerWhatsappUrl = getCdmxWhatsappUrl(locale, "default");

  useEffect(() => {
    document.documentElement.setAttribute("data-density", "compact");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "editorial");
    document.documentElement.lang = config.htmlLang;
    document.body.classList.add("has-campaign-sticky");
    trackLandingViewed(config.htmlLang);

    return () => {
      document.body.classList.remove("has-campaign-sticky");
    };
  }, [config.htmlLang]);

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
        <ForYouIfBlock config={config} />
        <DifferenceBlock config={config} />
        <OfferBlock config={config} />
        <ProofBadges config={config} />
        <TestimonialVideoBlock config={config} />
        <CampaignProcess config={config} />
        <ShortLeadForm config={config} id="solicitud" />
        <CampaignFaq config={config} />
      </main>
      <SharedFooter lang={config.language} />
      <MobileStickyCta config={config} />
    </>
  );
}
