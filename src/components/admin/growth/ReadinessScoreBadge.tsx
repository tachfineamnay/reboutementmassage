type ReadinessScoreBadgeProps = {
  score: number;
  showLabel?: boolean;
};

function getConfig(score: number) {
  if (score >= 80) return { label: "Prêt", className: "seo-score seo-score--good" };
  if (score >= 50) return { label: "Partiel", className: "seo-score seo-score--medium" };
  return { label: "Incomplet", className: "seo-score seo-score--low" };
}

export default function ReadinessScoreBadge({
  score,
  showLabel = true,
}: ReadinessScoreBadgeProps) {
  const { label, className } = getConfig(score);
  return (
    <span className={className} title={`Readiness : ${score}/100`}>
      <span className="seo-score__value">{score}</span>
      {showLabel ? <span className="seo-score__label">{label}</span> : null}
    </span>
  );
}
