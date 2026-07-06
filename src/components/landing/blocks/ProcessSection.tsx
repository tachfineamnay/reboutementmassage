import CampaignProcess from "@/components/campaign/CampaignProcess";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { ProcessSectionProps } from "@/lib/builder/puck-data-schema";

export default function ProcessSection(props: ProcessSectionProps) {
  const { config } = useLandingRenderContext();

  return (
    <CampaignProcess
      config={{
        ...config,
        process: {
          title: props.title || config.process.title,
          steps: props.steps.length ? props.steps : config.process.steps,
        },
        sections: {
          ...config.sections,
          processEyebrow: props.eyebrow || config.sections.processEyebrow,
        },
      }}
    />
  );
}
