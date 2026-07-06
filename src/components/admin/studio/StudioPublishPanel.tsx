"use client";

import type { PuckReadinessResult } from "@/lib/builder/puck-readiness";

export function StudioPublishPanel({
  readiness,
  onPublish,
  publishing,
}: {
  readiness: PuckReadinessResult;
  onPublish: () => void;
  publishing: boolean;
}) {
  return (
    <div className="landing-studio-publish">
      <button
        type="button"
        className="admin-btn admin-btn--success"
        onClick={onPublish}
        disabled={publishing || !readiness.canPublish}
        title={readiness.canPublish ? "Publier" : "Readiness insuffisante"}
      >
        {publishing ? "Publication…" : "Publier"}
      </button>
    </div>
  );
}
