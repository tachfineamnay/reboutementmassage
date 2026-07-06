"use client";

import CampaignFinalCta from "@/components/campaign/CampaignFinalCta";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { FinalCtaSectionProps } from "@/lib/builder/puck-data-schema";

export default function FinalCtaSection(props: FinalCtaSectionProps) {
  const { config } = useLandingRenderContext();

  return (
    <CampaignFinalCta
      config={{
        ...config,
        finalCta: {
          title: props.title,
          body: props.body,
          primary: props.primary,
          secondary: props.secondary,
        },
      }}
    />
  );
}
