import DifferenceBlock from "@/components/campaign/DifferenceBlock";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { DifferenceSectionProps } from "@/lib/builder/puck-data-schema";

export default function DifferenceSection(props: DifferenceSectionProps) {
  const { config } = useLandingRenderContext();

  return (
    <DifferenceBlock
      config={{
        ...config,
        difference: {
          title: props.title || config.difference.title,
          body: props.body || config.difference.body,
          points: props.points.length ? props.points : config.difference.points,
          imageAlt: props.imageAlt || config.difference.imageAlt,
        },
      }}
    />
  );
}
