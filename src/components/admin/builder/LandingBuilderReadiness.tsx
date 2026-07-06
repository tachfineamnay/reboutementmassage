import type { LandingBuilderReadinessIssue } from "@/lib/admin/builder/landing-builder-readiness";
import styles from "./LandingBuilder.module.css";

export function LandingBuilderReadiness({
  score,
  issues,
}: {
  score: number;
  issues: LandingBuilderReadinessIssue[];
}) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">Readiness</h2>
      <div className="kpi-card">
        <span className="kpi-card__value">{score}/100</span>
        <span className="kpi-card__label">Score publication</span>
      </div>
      {issues.length > 0 ? (
        <ul className={styles.readinessList}>
          {issues.map((issue) => (
            <li key={`${issue.step}-${issue.message}`}>
              <strong>{issue.step}</strong> — {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-page__meta">Prêt pour publication.</p>
      )}
    </section>
  );
}
