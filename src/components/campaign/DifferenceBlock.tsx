import Image from "next/image";
import type { CampaignLandingConfig } from "@/data/campaign-landings";

export default function DifferenceBlock({ config }: { config: CampaignLandingConfig }) {
  const paragraphs = config.difference.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="campaign-difference">
      <div className="campaign-difference__image">
        <Image
          src="/practice-01.webp"
          alt={config.difference.imageAlt}
          fill
          sizes="(max-width: 920px) 100vw, 42vw"
          style={{ objectFit: "cover", objectPosition: "center 35%" }}
        />
      </div>
      <div className="campaign-difference__copy">
        <h2 className="section-title section-title--cream">{config.difference.title}</h2>
        <div className="campaign-difference__body">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className="campaign-difference__list">
          {config.difference.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
