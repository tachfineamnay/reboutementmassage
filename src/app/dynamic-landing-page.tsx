"use client";

import { useEffect } from "react";
import CdmxPrivateSessionPage from "@/app/cdmx-private-session-page";
import { TrackingProvider } from "@/components/TrackingProvider";
import type { LandingPageWithRelations } from "@/lib/growth/types";
import { landingPageToDynamicConfig } from "@/lib/growth/landing-config";
import { trackGrowthEvent } from "@/lib/growth/tracking";

export default function DynamicLandingPage({
  landing,
  isPreview,
}: {
  landing: LandingPageWithRelations;
  isPreview?: boolean;
}) {
  const config = landingPageToDynamicConfig(landing);
  const lang = landing.locale === "EN" ? "en" : landing.locale === "ES" ? "es" : "fr";

  useEffect(() => {
    document.documentElement.lang = lang;
    if (!isPreview) {
      trackGrowthEvent("landing_viewed", {
        language: lang,
        landingPageId: landing.id,
        destinationId: landing.destinationId,
        offerId: landing.offerId ?? undefined,
        city: landing.destination.slug,
        offer: "private_session",
      });
    }
  }, [isPreview, lang, landing]);

  return (
    <TrackingProvider
      profile={landing.trackingProfile}
      landingPageId={landing.id}
      destinationId={landing.destinationId}
      offerId={landing.offerId ?? undefined}
      language={lang}
    >
      {isPreview && (
        <div className="campaign-preview-banner" role="status">
          Preview mode — landing not indexed
        </div>
      )}
      <CdmxPrivateSessionPage config={config} />
    </TrackingProvider>
  );
}
