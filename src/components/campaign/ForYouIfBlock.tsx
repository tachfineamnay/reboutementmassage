import type { CampaignLandingConfig } from "@/data/campaign-landings";

export default function ForYouIfBlock({ config }: { config: CampaignLandingConfig }) {
  return (
    <section className="campaign-for-you">
      <div className="container">
        <h2 className="campaign-for-you__title">{config.forYouIf.title}</h2>
        <ul className="campaign-for-you__grid">
          {config.forYouIf.items.map((item) => (
            <li className="campaign-for-you__chip" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
