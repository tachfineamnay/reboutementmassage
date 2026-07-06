"use client";

import { createContext, useContext } from "react";
import type { DynamicCampaignConfig } from "@/lib/growth/landing-config";

type LandingRenderContextValue = {
  config: DynamicCampaignConfig;
  previewMode: boolean;
};

const LandingRenderContext = createContext<LandingRenderContextValue | null>(null);

export function LandingRenderContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: LandingRenderContextValue;
}) {
  return <LandingRenderContext.Provider value={value}>{children}</LandingRenderContext.Provider>;
}

export function useLandingRenderContext() {
  const ctx = useContext(LandingRenderContext);
  if (!ctx) {
    throw new Error("useLandingRenderContext must be used inside LandingRenderer.");
  }
  return ctx;
}
