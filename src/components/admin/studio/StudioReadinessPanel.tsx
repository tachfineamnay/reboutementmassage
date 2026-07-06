"use client";

import type { PuckReadinessResult } from "@/lib/builder/puck-readiness";

export function StudioReadinessPanel({ readiness }: { readiness: PuckReadinessResult }) {
  return (
    <aside className="landing-studio-readiness admin-panel" aria-label="Readiness Studio">
      <div className="landing-studio-readiness__score">
        <span>{readiness.score}</span>
        <small>/100</small>
      </div>
      <p className="admin-page__meta">
        {readiness.criticalCount} critique{readiness.criticalCount !== 1 ? "s" : ""}, {readiness.warningCount} warning
        {readiness.warningCount !== 1 ? "s" : ""}
      </p>
      {readiness.issues.length ? (
        <ul className="landing-studio-readiness__issues">
          {readiness.issues.map((issue) => (
            <li key={issue.code} data-severity={issue.severity}>
              <strong>{issue.location ?? issue.code}</strong>
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-page__meta">Aucune issue bloquante.</p>
      )}
    </aside>
  );
}
