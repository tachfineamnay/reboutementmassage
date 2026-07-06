"use client";

import "@puckeditor/core/puck.css";

import { Puck, type Config, type Data } from "@puckeditor/core";
import { useMemo, useState, useTransition } from "react";
import {
  archiveLandingAction,
  publishLandingAction,
  savePuckDataAction,
  unpublishLandingAction,
} from "@/app/(admin)/admin/pages/[id]/studio/actions";
import { StudioEmptyState } from "@/components/admin/studio/StudioEmptyState";
import { StudioReadinessPanel } from "@/components/admin/studio/StudioReadinessPanel";
import { StudioTopbar } from "@/components/admin/studio/StudioTopbar";
import { puckConfig, tmsStudioViewports } from "@/lib/builder/puck-config";
import type { PuckReadinessResult } from "@/lib/builder/puck-readiness";
import type { TmsPuckData } from "@/lib/builder/puck-data-schema";

type StudioClientProps = {
  landing: {
    id: string;
    title: string;
    status: string;
  };
  initialData: TmsPuckData;
  initialized: boolean;
  readiness: PuckReadinessResult;
  liveUrl: string;
  previewUrl: string;
  expertUrl: string;
  settingsUrl: string;
};

export default function StudioClient({
  landing,
  initialData,
  initialized,
  readiness: initialReadiness,
  liveUrl,
  previewUrl,
  expertUrl,
  settingsUrl,
}: StudioClientProps) {
  const [data, setData] = useState<TmsPuckData>(initialData);
  const [isInitialized, setInitialized] = useState(initialized);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [publishing, setPublishing] = useState(false);
  const isLive = landing.status === "LIVE";

  const headerPath = useMemo(() => `/${landing.id}/studio`, [landing.id]);

  async function save(nextData = data) {
    const result = await savePuckDataAction(landing.id, nextData);
    if (result.ok) {
      setReadiness(result.readiness);
      setInitialized(true);
      setMessage("Sauvegardé.");
    } else {
      setMessage(result.message);
      if (result.readiness) setReadiness(result.readiness);
    }
  }

  function handleSave(nextData = data) {
    startTransition(() => {
      void save(nextData);
    });
  }

  function handleInitialize() {
    handleSave(data);
  }

  function handlePublish() {
    setPublishing(true);
    startTransition(async () => {
      await save(data);
      const result = await publishLandingAction(landing.id);
      if (result.ok) {
        setReadiness(result.readiness);
        setMessage("Page publiée.");
      } else {
        setMessage(result.message);
        if (result.readiness) setReadiness(result.readiness);
      }
      setPublishing(false);
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const result = await unpublishLandingAction(landing.id);
      if (result.ok) {
        setReadiness(result.readiness);
        setMessage("Page mise en pause.");
      } else {
        setMessage(result.message);
      }
    });
  }

  function handleArchive() {
    if (!window.confirm("Archiver cette landing ?")) return;
    startTransition(async () => {
      const result = await archiveLandingAction(landing.id);
      if (result.ok) {
        setReadiness(result.readiness);
        setMessage("Page archivée.");
      } else {
        setMessage(result.message);
      }
    });
  }

  if (!isInitialized) {
    return (
      <div className="landing-studio-shell">
        <StudioEmptyState onInitialize={handleInitialize} initializing={isPending} />
        <StudioReadinessPanel readiness={readiness} />
      </div>
    );
  }

  return (
    <div className="landing-studio">
      <StudioTopbar
        landingId={landing.id}
        liveUrl={liveUrl}
        previewUrl={previewUrl}
        isLive={isLive}
        expertUrl={expertUrl}
        settingsUrl={settingsUrl}
        readiness={readiness}
        saving={isPending}
        publishing={publishing}
        onSave={() => handleSave(data)}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onArchive={handleArchive}
      />
      {message ? (
        <p className="landing-studio__message" role="status">
          {message}
        </p>
      ) : null}
      <div className="landing-studio__grid">
        <div className="landing-studio__canvas">
          <Puck
            config={puckConfig as unknown as Config}
            data={data as unknown as Data}
            onChange={(nextData) => setData(nextData as TmsPuckData)}
            onPublish={(nextData) => handleSave(nextData as TmsPuckData)}
            headerTitle={landing.title}
            headerPath={headerPath}
            viewports={tmsStudioViewports}
            iframe={{ enabled: true, waitForStyles: true, syncHostStyles: true }}
            height="calc(100vh - 190px)"
          />
        </div>
        <StudioReadinessPanel readiness={readiness} />
      </div>
    </div>
  );
}
