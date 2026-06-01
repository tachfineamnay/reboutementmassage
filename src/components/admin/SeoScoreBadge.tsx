type SeoScoreBadgeProps = {
  score: number; // 0-100
  showLabel?: boolean;
};

function getScoreConfig(score: number) {
  if (score >= 80) return { label: "Bon", className: "seo-score seo-score--good" };
  if (score >= 50) return { label: "Moyen", className: "seo-score seo-score--medium" };
  return { label: "Faible", className: "seo-score seo-score--low" };
}

export default function SeoScoreBadge({ score, showLabel = true }: SeoScoreBadgeProps) {
  const { label, className } = getScoreConfig(score);
  return (
    <span className={className} title={`Score SEO : ${score}/100`}>
      <span className="seo-score__value">{score}</span>
      {showLabel && <span className="seo-score__label">{label}</span>}
    </span>
  );
}
