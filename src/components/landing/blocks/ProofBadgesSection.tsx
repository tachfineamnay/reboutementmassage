import ProofBadges from "@/components/campaign/ProofBadges";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { ProofBadgesSectionProps } from "@/lib/builder/puck-data-schema";

export default function ProofBadgesSection(props: ProofBadgesSectionProps) {
  const { config } = useLandingRenderContext();
  const badges = props.badges.length ? props.badges : config.proof.badges;

  if (!badges.length) return null;

  return (
    <ProofBadges
      config={{
        ...config,
        proof: { badges },
      }}
    />
  );
}
