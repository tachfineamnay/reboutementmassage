"use client";

import { useEffect } from "react";
import { Render, type Config, type Data } from "@puckeditor/core";
import MobileWhatsappFirstLanding from "@/app/mobile-whatsapp-first-landing";
import MobileStickyCta from "@/components/campaign/MobileStickyCta";
import SharedFooter from "@/components/SharedFooter";
import SharedHeader from "@/components/SharedHeader";
import { LandingRenderContextProvider } from "@/components/landing/LandingRenderContext";
import { getPuckDataFromLanding, isPuckLanding } from "@/lib/builder/default-puck-data";
import { puckConfig } from "@/lib/builder/puck-config";
import type { LandingPageWithRelations } from "@/lib/growth/types";
import { landingPageToDynamicConfig } from "@/lib/growth/landing-config";

export default function LandingRenderer({
  landing,
  isPreview = false,
}: {
  landing: LandingPageWithRelations;
  isPreview?: boolean;
}) {
  const config = landingPageToDynamicConfig(landing);
  const puckData = isPuckLanding(landing.content) ? getPuckDataFromLanding(landing) : null;
  const rootProps = puckData?.root.props ?? {
    pageStyle: "premium-reset" as const,
    density: "conversion" as const,
    locale: landing.locale,
  };

  useEffect(() => {
    if (!puckData) return;

    document.documentElement.setAttribute("data-density", rootProps.density);
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", rootProps.pageStyle);
    document.documentElement.lang = config.htmlLang;
    document.body.classList.add("has-campaign-sticky");

    return () => {
      document.body.classList.remove("has-campaign-sticky");
    };
  }, [config.htmlLang, puckData, rootProps.density, rootProps.pageStyle]);

  if (!puckData) {
    return <MobileWhatsappFirstLanding config={config} />;
  }

  return (
    <LandingRenderContextProvider value={{ config, previewMode: isPreview }}>
      <SharedHeader
        lang={config.language}
        activePage="seances"
        heroStyle="dark"
        ctaHrefOverride={config.whatsappUrls.default}
        ctaLabelOverride={config.hero.ctaPrimary}
        ctaExternal
      />
      <main
        className="campaign-page"
        data-page-style={rootProps.pageStyle}
        data-density={rootProps.density}
        data-locale={rootProps.locale}
      >
        <Render config={puckConfig as unknown as Config} data={puckData as unknown as Data} />
      </main>
      <SharedFooter
        lang={config.language}
        market={config.destinationSlug === "cdmx" ? "cdmx" : "default"}
      />
      <MobileStickyCta config={config} />
    </LandingRenderContextProvider>
  );
}
