"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { TrackingProfile } from "@prisma/client";
import { trackGrowthEvent } from "@/lib/growth/tracking";
import type { CampaignEventName, CampaignTrackingParams } from "@/lib/campaign-tracking";

type TrackingContextValue = {
  profile: TrackingProfile | null;
  landingPageId?: string;
  destinationId?: string;
  offerId?: string;
  language?: string;
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
}: {
  children: ReactNode;
  profile?: TrackingProfile | null;
  landingPageId?: string;
  destinationId?: string;
  offerId?: string;
  language?: string;
}) {
  const value = useMemo<TrackingContextValue>(
    () => ({
      profile: profile ?? null,
      landingPageId,
      destinationId,
      offerId,
      language,
      track: (event, params = {}) => {
        trackGrowthEvent(event, {
          ...params,
          language: params.language ?? language,
          landingPageId,
          destinationId,
          offerId,
        });
      },
    }),
    [profile, landingPageId, destinationId, offerId, language]
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
