"use client";

import { useState } from "react";
import { generatePreviewTokenAction } from "@/app/(admin)/admin/pages/[id]/studio/actions";

export function StudioPreviewActions({
  landingId,
  previewUrl,
  liveUrl,
  isLive,
}: {
  landingId: string;
  previewUrl: string;
  liveUrl: string;
  isLive: boolean;
}) {
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(previewUrl);
  const [loading, setLoading] = useState(false);

  async function openPreview() {
    if (currentPreviewUrl.includes("preview=")) {
      window.open(currentPreviewUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setLoading(true);
    try {
      const result = await generatePreviewTokenAction(landingId);
      if (result.ok && result.previewToken) {
        const url = `${liveUrl}?preview=${encodeURIComponent(result.previewToken)}`;
        setCurrentPreviewUrl(url);
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn--ghost" onClick={openPreview} disabled={loading}>
        {loading ? "Preview…" : "Preview"}
      </button>
      {isLive ? (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--ghost">
          Voir live
        </a>
      ) : null}
    </>
  );
}
