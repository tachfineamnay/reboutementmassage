import type { StaticLandingEntry } from "@/data/static-landings-registry";

type HealthTone = "ok" | "warning" | "neutral";

function getHealthTone(landing: StaticLandingEntry): HealthTone {
  if (landing.status === "PAUSED" || landing.status === "ARCHIVED") {
    return "neutral";
  }
  if (landing.status === "LIVE" && landing.indexable && landing.sitemap) {
    return "ok";
  }
  if (landing.status === "LIVE" && (!landing.indexable || !landing.sitemap)) {
    return "warning";
  }
  return "neutral";
}

const TONE_CONFIG: Record<HealthTone, { label: string; className: string }> = {
  ok: { label: "OK", className: "badge badge--published" },
  warning: { label: "Alerte", className: "badge badge--draft" },
  neutral: { label: "—", className: "badge" },
};

export default function StaticLandingHealthBadge({ landing }: { landing: StaticLandingEntry }) {
  const tone = getHealthTone(landing);
  const config = TONE_CONFIG[tone];
  return <span className={config.className}>{config.label}</span>;
}
