"use client";

import { useEffect } from "react";
import MobileWhatsappFirstLanding from "@/app/mobile-whatsapp-first-landing";
import { TrackingProvider } from "@/components/TrackingProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MetaPixel } from "@/components/MetaPixel";
import { TikTokPixel } from "@/components/TikTokPixel";
import type { LandingPageWithRelations } from "@/lib/growth/types";
import { landingPageToDynamicConfig } from "@/lib/growth/landing-config";
import { trackGrowthEvent } from "@/lib/growth/tracking";

export default function DynamicLandingPage({
  landing,
  isPreview,
  variantId,
}: {
  landing: LandingPageWithRelations;
  isPreview?: boolean;
  variantId?: string;
}) {
  const config = landingPageToDynamicConfig(landing);
  const lang = landing.locale === "EN" ? "en" : landing.locale === "ES" ? "es" : "fr";

  useEffect(() => {
    document.documentElement.lang = lang;
    if (!isPreview) {
      trackGrowthEvent("landing_viewed", {
        language: lang,
        landingPageId: config.landingPageId,
        destinationId: config.destinationId,
        offerId: config.offerId ?? undefined,
        city: config.destinationSlug,
        offer: config.offerType,
        session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
        content_name: config.tracking.viewContentName,
        variantId,
      });
    }
  }, [isPreview, lang, config, variantId]);

  return (
    <TrackingProvider
      profile={landing.trackingProfile}
      landingPageId={landing.id}
      destinationId={landing.destinationId}
      offerId={landing.offerId ?? undefined}
      language={lang}
      variantId={variantId}
      city={config.destinationSlug}
      country={config.country}
      locale={config.htmlLang}
      offerType={config.offerType}
      session_duration={config.durationMinutes ? `${config.durationMinutes}_min` : undefined}
    >
      <GoogleAnalytics measurementId={landing.trackingProfile?.ga4MeasurementId} enabled={landing.trackingProfile?.enableGA4} />
      <MetaPixel pixelId={landing.trackingProfile?.metaPixelId} enabled={landing.trackingProfile?.enableMeta} />
      <TikTokPixel pixelId={landing.trackingProfile?.tiktokPixelId} enabled={landing.trackingProfile?.enableTikTok} />
      {isPreview && (
        <div className="campaign-preview-banner" role="status">
          Preview mode — landing not indexed
        </div>
      )}
      <MobileWhatsappFirstLanding config={config} />
    </TrackingProvider>
  );
}
