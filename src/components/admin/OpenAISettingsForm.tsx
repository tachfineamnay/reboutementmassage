"use client";

import { useState, useTransition } from "react";

type OpenAISettingsStatus = {
  configured: boolean;
  source: "dashboard" | "env" | "none";
  dashboardKeyConfigured: boolean;
  envKeyConfigured: boolean;
  maskedKey: string | null;
  updatedAt: string | null;
  textModel: string;
  imageModel: string;
  encryption: {
    available: boolean;
    source: string | null;
    usingFallback: boolean;
  };
  decryptError: string | null;
};

function sourceLabel(source: OpenAISettingsStatus["source"]) {
  if (source === "dashboard") return "Dashboard";
  if (source === "env") return "Variables d'environnement";
  return "Non configuré";
}

function statusClass(status: OpenAISettingsStatus) {
  if (status.decryptError) return "settings-value--missing";
  return status.configured ? "settings-value--set" : "settings-value--missing";
}

export default function OpenAISettingsForm({
  initialStatus,
}: {
  initialStatus: OpenAISettingsStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [apiKey, setApiKey] = useState("");
  const [textModel, setTextModel] = useState(initialStatus.textModel);
  const [imageModel, setImageModel] = useState(initialStatus.imageModel);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function setFromStatus(next: OpenAISettingsStatus) {
    setStatus(next);
    setTextModel(next.textModel);
    setImageModel(next.imageModel);
    setApiKey("");
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setTestMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/settings/openai", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            textModel,
            imageModel,
          }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.error || "Sauvegarde impossible.");
        }
        setFromStatus(body as OpenAISettingsStatus);
        setMessage("Configuration OpenAI sauvegardée.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sauvegarde impossible.");
      }
    });
  }

  function deleteDashboardKey() {
    setMessage("");
    setError("");
    setTestMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/settings/openai/key", {
          method: "DELETE",
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.error || "Suppression impossible.");
        }
        setFromStatus(body as OpenAISettingsStatus);
        setMessage("Clé dashboard supprimée.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Suppression impossible.");
      }
    });
  }

  function testSettings() {
    setMessage("");
    setError("");
    setTestMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/settings/openai/test", {
          method: "POST",
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.error || "Test OpenAI impossible.");
        }
        setTestMessage(
          `Connexion OK via ${sourceLabel(body.source)} avec ${body.textModel}.`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Test OpenAI impossible.");
      }
    });
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section__title">OpenAI Article Studio</h2>
      <div className="admin-panel settings-panel openai-settings-panel">
        <dl className="settings-list">
          <div className="settings-row">
            <dt>
              <code>OPENAI</code>
              <span className="settings-label">Source active</span>
            </dt>
            <dd>
              <span className={`settings-value ${statusClass(status)}`}>
                {status.decryptError
                  ? "Erreur de déchiffrement"
                  : status.configured
                    ? sourceLabel(status.source)
                    : "IA non configurée"}
              </span>
            </dd>
          </div>
          <div className="settings-row">
            <dt>
              <code>API key</code>
              <span className="settings-label">Clé active</span>
            </dt>
            <dd>{status.maskedKey || "—"}</dd>
          </div>
          <div className="settings-row">
            <dt>
              <code>updatedAt</code>
              <span className="settings-label">Dernière modification dashboard</span>
            </dt>
            <dd>
              {status.updatedAt
                ? new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(status.updatedAt))
                : "—"}
            </dd>
          </div>
          <div className="settings-row">
            <dt>
              <code>encryption</code>
              <span className="settings-label">Chiffrement</span>
            </dt>
            <dd>
              <span
                className={`settings-value ${
                  status.encryption.available && !status.encryption.usingFallback
                    ? "settings-value--set"
                    : "settings-value--missing"
                }`}
              >
                {status.encryption.available
                  ? status.encryption.usingFallback
                    ? "SESSION_SECRET"
                    : status.encryption.source
                  : "Non disponible"}
              </span>
            </dd>
          </div>
        </dl>

        {status.decryptError && (
          <p className="admin-alert admin-alert--error" role="alert">
            {status.decryptError}
          </p>
        )}

        {status.encryption.usingFallback && (
          <p className="admin-alert admin-alert--error">
            Définissez ADMIN_SETTINGS_ENCRYPTION_KEY pour isoler le chiffrement des secrets
            dashboard.
          </p>
        )}

        <form className="openai-settings-form" onSubmit={saveSettings}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="openai-api-key">
              OpenAI API key
            </label>
            <input
              id="openai-api-key"
              className="admin-input"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={
                status.dashboardKeyConfigured || status.envKeyConfigured
                  ? "Laisser vide pour conserver la clé active"
                  : "sk-..."
              }
              autoComplete="off"
              disabled={isPending}
            />
          </div>

          <div className="openai-settings-form__grid">
            <div className="admin-field">
              <label className="admin-label" htmlFor="openai-text-model">
                Text model
              </label>
              <input
                id="openai-text-model"
                className="admin-input"
                value={textModel}
                onChange={(event) => setTextModel(event.target.value)}
                placeholder="gpt-5.5"
                disabled={isPending}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="openai-image-model">
                Image model
              </label>
              <input
                id="openai-image-model"
                className="admin-input"
                value={imageModel}
                onChange={(event) => setImageModel(event.target.value)}
                placeholder="gpt-image-1"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="openai-settings-form__actions">
            <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending}>
              {isPending ? "Traitement..." : "Sauvegarder"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={testSettings}
              disabled={isPending || !status.configured}
            >
              Tester
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={deleteDashboardKey}
              disabled={isPending || !status.dashboardKeyConfigured}
            >
              Supprimer la clé dashboard
            </button>
          </div>
        </form>

        <div aria-live="polite">
          {message && <p className="admin-alert admin-alert--success">{message}</p>}
          {testMessage && <p className="admin-alert admin-alert--success">{testMessage}</p>}
          {error && (
            <p className="admin-alert admin-alert--error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
