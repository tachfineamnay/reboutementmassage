import type { CampaignLandingConfig } from "@/data/campaign-landings";

export default function ProofBadges({ config }: { config: CampaignLandingConfig }) {
  return (
    <section className="campaign-proof-section">
      <div className="container">
        <div className="campaign-proof-section__grid">
          {config.proof.badges.map((badge) => (
            <div className="campaign-proof" key={`${badge.value}-${badge.label}`}>
              <span className="campaign-proof__value">{badge.value}</span>
              <span className="campaign-proof__label">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
