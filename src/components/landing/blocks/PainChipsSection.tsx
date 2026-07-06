import ForYouIfBlock from "@/components/campaign/ForYouIfBlock";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { PainChipsSectionProps } from "@/lib/builder/puck-data-schema";

export default function PainChipsSection(props: PainChipsSectionProps) {
  const { config } = useLandingRenderContext();

  return (
    <ForYouIfBlock
      config={{
        ...config,
        forYouIf: {
          title: props.title || config.forYouIf.title,
          body: props.body || undefined,
          items: props.items.length ? props.items : config.forYouIf.items,
        },
      }}
    />
  );
}
