"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { TrackingProfile } from "@prisma/client";
import { trackGrowthEvent } from "@/lib/growth/tracking";
import type { CampaignEventName, CampaignTrackingParams } from "@/lib/campaign-tracking";

type TrackingContextValue = {
  profile: TrackingProfile | null;
  landingPageId?: string;
  destinationId?: string;
  offerId?: string | null;
  language?: string;
  metaPixelId?: string | null;
  tiktokPixelId?: string | null;
  ga4MeasurementId?: string | null;
  googleAdsId?: string | null;
  gtmContainerId?: string | null;
  enableMeta?: boolean;
  enableTikTok?: boolean;
  enableGA4?: boolean;
  enableGTM?: boolean;
  enableGoogleAds?: boolean;
  city?: string;
  country?: string;
  locale?: string;
  offerType?: string;
  session_duration?: string;
  track: (event: CampaignEventName, params?: CampaignTrackingParams) => void;
};

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function TrackingProvider({
  children,
  profile,
  landingPageId,
  destinationId,
  offerId,
  language,
  city,
  country,
  locale,
  offerType,
  session_duration,
}: {
  children: ReactNode;
  profile?: TrackingProfile | null;
  landingPageId?: string;
  destinationId?: string;
  offerId?: string | null;
  language?: string;
  city?: string;
  country?: string;
  locale?: string;
  offerType?: string;
  session_duration?: string;
}) {
  const value = useMemo<TrackingContextValue>(
    () => ({
      profile: profile ?? null,
      landingPageId,
      destinationId,
      offerId,
      language,
      metaPixelId: profile?.metaPixelId ?? null,
      tiktokPixelId: profile?.tiktokPixelId ?? null,
      ga4MeasurementId: profile?.ga4MeasurementId ?? null,
      googleAdsId: profile?.googleAdsId ?? null,
      gtmContainerId: profile?.gtmContainerId ?? null,
      enableMeta: profile?.enableMeta ?? false,
      enableTikTok: profile?.enableTikTok ?? false,
      enableGA4: profile?.enableGA4 ?? false,
      enableGTM: profile?.enableGTM ?? false,
      enableGoogleAds: profile?.enableGoogleAds ?? false,
      city,
      country,
      locale,
      offerType,
      session_duration,
      track: (event, params = {}) => {
        trackGrowthEvent(event, {
          landingPageId,
          destinationId,
          offerId,
          city,
          country,
          locale,
          offerType,
          session_duration,
          ...params,
          language: params.language ?? language,
        });
      },
    }),
    [profile, landingPageId, destinationId, offerId, language, city, country, locale, offerType, session_duration]
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useGrowthTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) {
    return {
      profile: null,
      track: (event: CampaignEventName, params?: CampaignTrackingParams) =>
        trackGrowthEvent(event, params),
    };
  }
  return ctx;
}
