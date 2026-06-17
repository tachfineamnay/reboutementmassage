"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Locale = "FR" | "EN" | "ES";
type ArticleStatus = "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";

type Props = {
  articleId: string;
  initialLocale: Locale;
  slug: string;
  status: ArticleStatus;
  embedded?: boolean;
};

const LOCALE_LABELS: Record<Locale, string> = {
  FR: "🇫🇷 Français",
  EN: "🇬🇧 English",
  ES: "🇪🇸 Español",
};

export default function ArticleLocaleSwitcher({
  articleId,
  initialLocale,
  slug,
  status,
  embedded = false,
}: Props) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [savedLocale, setSavedLocale] = useState<Locale>(initialLocale);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicPath = `/${locale.toLowerCase()}/stories/${slug}`;
  const hasChanges = locale !== savedLocale;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? "Erreur lors de la modification de la langue.");
      }

      setSavedLocale(locale);
      setSuccess(`Langue enregistrée. Nouvelle URL : ${publicPath}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la modification de la langue."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className={`${embedded ? "article-locale-switcher article-locale-switcher--embedded" : "admin-panel article-locale-switcher"}`}
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="admin-panel__title">Langue et URL publique</h2>
        <p className="article-locale-switcher__warning">
          Changer la langue déplace l&apos;article vers cette version de Stories.
        </p>
        {status === "PUBLISHED" && (
          <p className="admin-hint admin-hint--warn">
            Article publié : la modification sera visible immédiatement.
          </p>
        )}
      </div>

      <div className="article-locale-switcher__controls">
        <div className="admin-field">
          <label className="admin-label" htmlFor="article-locale-switcher">
            Langue
          </label>
          <select
            id="article-locale-switcher"
            className="admin-input"
            value={locale}
            onChange={(e) => {
              setLocale(e.target.value as Locale);
              setSuccess(null);
              setError(null);
            }}
            disabled={isSaving}
          >
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((value) => (
              <option key={value} value={value}>
                {LOCALE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-field article-locale-switcher__url">
          <span className="admin-label">URL publique obtenue</span>
          <code>{publicPath}</code>
        </div>

        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? "Enregistrement…" : "Enregistrer la langue"}
        </button>
      </div>

      <div aria-live="polite">
        {success && <p className="admin-alert admin-alert--success">{success}</p>}
        {error && (
          <p className="admin-alert admin-alert--error" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
