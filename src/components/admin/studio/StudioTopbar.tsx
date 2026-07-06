"use client";

import Link from "next/link";
import { StudioPreviewActions } from "@/components/admin/studio/StudioPreviewActions";
import { StudioPublishPanel } from "@/components/admin/studio/StudioPublishPanel";
import type { PuckReadinessResult } from "@/lib/builder/puck-readiness";

export function StudioTopbar({
  landingId,
  liveUrl,
  previewUrl,
  isLive,
  expertUrl,
  settingsUrl,
  readiness,
  saving,
  publishing,
  onSave,
  onPublish,
  onUnpublish,
  onArchive,
}: {
  landingId: string;
  liveUrl: string;
  previewUrl: string;
  isLive: boolean;
  expertUrl: string;
  settingsUrl: string;
  readiness: PuckReadinessResult;
  saving: boolean;
  publishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="landing-studio-topbar">
      <div className="landing-studio-topbar__left">
        <button type="button" className="admin-btn admin-btn--primary" onClick={onSave} disabled={saving}>
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        <StudioPublishPanel readiness={readiness} onPublish={onPublish} publishing={publishing} />
        {isLive ? (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onUnpublish}>
            Mettre en pause
          </button>
        ) : null}
      </div>
      <div className="landing-studio-topbar__right">
        <StudioPreviewActions landingId={landingId} liveUrl={liveUrl} previewUrl={previewUrl} isLive={isLive} />
        <Link href={settingsUrl} className="admin-btn admin-btn--ghost">
          Réglages
        </Link>
        <Link href={expertUrl} className="admin-btn admin-btn--ghost">
          Expert
        </Link>
        <button type="button" className="admin-btn admin-btn--danger" onClick={onArchive}>
          Archiver
        </button>
      </div>
    </div>
  );
}
