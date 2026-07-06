"use client";

import CampaignFaq from "@/components/campaign/CampaignFaq";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { FAQSectionProps } from "@/lib/builder/puck-data-schema";

export default function FAQSection(props: FAQSectionProps) {
  const { config } = useLandingRenderContext();
  const faq = props.items.length ? props.items : config.faq;

  if (!faq.length) return null;

  return (
    <CampaignFaq
      config={{
        ...config,
        sections: {
          ...config.sections,
          faqEyebrow: props.eyebrow || config.sections.faqEyebrow,
          faqTitle: props.title || config.sections.faqTitle,
        },
        faq,
      }}
    />
  );
}
