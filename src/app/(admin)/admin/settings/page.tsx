import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getOpenAISettingsStatus } from "@/lib/openai";
import OpenAISettingsForm from "@/components/admin/OpenAISettingsForm";

export const metadata: Metadata = {
  title: "Settings — GT Dash",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ENV_KEYS = [
  { key: "DATABASE_URL", label: "Base de données", sensitive: true },
  { key: "SESSION_SECRET", label: "Clé de session JWT", sensitive: true },
  { key: "ADMIN_EMAIL", label: "Email admin", sensitive: false },
  { key: "ADMIN_PASSWORD", label: "Mot de passe admin", sensitive: true },
  { key: "NEXT_PUBLIC_SITE_URL", label: "URL publique du site", sensitive: false },
  { key: "UPLOADS_DIR", label: "Dossier uploads", sensitive: false },
  { key: "OPENAI_API_KEY", label: "Clé OpenAI", sensitive: true },
  { key: "OPENAI_TEXT_MODEL", label: "Modèle texte OpenAI", sensitive: false },
  { key: "OPENAI_IMAGE_MODEL", label: "Modèle image OpenAI", sensitive: false },
  { key: "ADMIN_SETTINGS_ENCRYPTION_KEY", label: "Chiffrement settings", sensitive: true },
  { key: "NODE_ENV", label: "Environnement", sensitive: false },
];

function envStatus(key: string, sensitive: boolean) {
  const val = process.env[key];
  if (!val) return { set: false, display: "Non défini" };
  if (sensitive) return { set: true, display: "••••••••" };
  return { set: true, display: val };
}

export default async function SettingsPage() {
  const [session, openAIStatus] = await Promise.all([
    getSession(),
    getOpenAISettingsStatus(),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Settings</h1>
      </div>

      {/* Infos de session */}
      <section className="admin-section">
        <h2 className="admin-section__title">Session active</h2>
        <div className="admin-panel settings-panel">
          <dl className="settings-list">
            <div className="settings-row">
              <dt>Email</dt>
              <dd>{session?.email ?? "—"}</dd>
            </div>
            <div className="settings-row">
              <dt>Expire le</dt>
              <dd>
                {session?.expiresAt
                  ? new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "long",
                      timeStyle: "short",
                    }).format(new Date(session.expiresAt))
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <OpenAISettingsForm initialStatus={openAIStatus} />

      {/* Variables d'environnement */}
      <section className="admin-section">
        <h2 className="admin-section__title">Variables d&apos;environnement</h2>
        <p className="admin-section__desc">
          Ces variables sont lues côté serveur uniquement. Les valeurs sensibles ne sont jamais
          exposées.
        </p>
        <div className="admin-panel settings-panel">
          <dl className="settings-list">
            {ENV_KEYS.map(({ key, label, sensitive }) => {
              const { set, display } = envStatus(key, sensitive);
              return (
                <div className="settings-row" key={key}>
                  <dt>
                    <code>{key}</code>
                    <span className="settings-label">{label}</span>
                  </dt>
                  <dd>
                    <span
                      className={`settings-value ${
                        set ? "settings-value--set" : "settings-value--missing"
                      }`}
                    >
                      {set ? display : "⚠ Non défini"}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* Aide */}
      <section className="admin-section">
        <h2 className="admin-section__title">Configuration Coolify</h2>
        <div className="admin-panel settings-panel settings-panel--code">
          <p className="admin-section__desc">
            Ajoutez ces variables dans l&apos;onglet <strong>Environment</strong> de votre service
            Coolify :
          </p>
          <pre className="settings-code">{`ADMIN_EMAIL=admin@votre-domaine.fr
ADMIN_PASSWORD=mot-de-passe-fort-32-chars
SESSION_SECRET=cle-aleatoire-256-bits
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXT_PUBLIC_SITE_URL=https://votre-domaine.fr
UPLOADS_DIR=/app/storage/uploads
ADMIN_SETTINGS_ENCRYPTION_KEY=cle-aleatoire-256-bits
OPENAI_TEXT_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-1`}</pre>
          <p className="settings-hint">
            💡 Générez SESSION_SECRET et ADMIN_SETTINGS_ENCRYPTION_KEY avec :{" "}
            <code>openssl rand -base64 32</code>
          </p>
        </div>
      </section>
    </div>
  );
}
