import type { CampaignLandingConfig } from "@/data/campaign-landings";

export default function CampaignProcess({ config }: { config: CampaignLandingConfig }) {
  return (
    <section className="campaign-process">
      <div className="container">
        <div className="campaign-section-head">
          <span className="eyebrow eyebrow--gold">{config.sections.processEyebrow}</span>
          <h2 className="section-title">{config.process.title}</h2>
        </div>
        <ol className="campaign-process__steps">
          {config.process.steps.map((step, index) => (
            <li className="campaign-process-step" key={step}>
              <span className="campaign-process-step__num">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
