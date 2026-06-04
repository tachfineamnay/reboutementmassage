type SeoScoreBadgeProps = {
  score: number; // 0-100
  geoScore?: number;
  atomicAnswerPresent?: boolean;
  showLabel?: boolean;
};

function getScoreConfig(score: number) {
  if (score >= 80) return { label: "Bon", className: "seo-score seo-score--good" };
  if (score >= 50) return { label: "Moyen", className: "seo-score seo-score--medium" };
  return { label: "Faible", className: "seo-score seo-score--low" };
}

export default function SeoScoreBadge({
  score,
  geoScore,
  atomicAnswerPresent,
  showLabel = true,
}: SeoScoreBadgeProps) {
  const { label, className } = getScoreConfig(score);
  const geoConfig = typeof geoScore === "number" ? getScoreConfig(geoScore) : null;

  if (geoConfig) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span className={className} title={`Score SEO : ${score}/100`}>
          <span className="seo-score__value">{score}</span>
          {showLabel && <span className="seo-score__label">SEO</span>}
        </span>
        <span
          className={geoConfig.className}
          title={`Score GEO : ${geoScore}/100${atomicAnswerPresent ? " - réponse atomique présente" : ""}`}
        >
          <span className="seo-score__value">{geoScore}</span>
          {showLabel && <span className="seo-score__label">GEO</span>}
        </span>
      </span>
    );
  }

  return (
    <span className={className} title={`Score SEO : ${score}/100`}>
      <span className="seo-score__value">{score}</span>
      {showLabel && <span className="seo-score__label">{label}</span>}
    </span>
  );
}
