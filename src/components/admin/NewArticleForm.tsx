"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

type Locale = "FR" | "EN" | "ES";

type FormState = {
  locale: Locale;
  title: string;
  slug: string;
  excerpt: string;
};

const DEFAULT: FormState = {
  locale: "FR",
  title: "",
  slug: "",
  excerpt: "",
};

type FieldError = Partial<Record<keyof FormState, string>>;

/**
 * Formulaire de création d'article — léger, focusé sur l'essentiel.
 * Crée l'article + ArticleContent vide + ArticleSeo vide en une seule requête.
 * Redirige vers la page d'édition complète après création.
 */
export default function NewArticleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<FormState>(DEFAULT);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    set("title", title);
    // Auto-génère le slug seulement si l'utilisateur n'a pas édité manuellement
    if (!slugEdited) {
      set("slug", slugify(title));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  }

  function validate(): boolean {
    const errors: FieldError = {};
    if (!data.title.trim()) errors.title = "Le titre est requis.";
    if (!data.slug.trim()) errors.slug = "Le slug est requis.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      errors.slug = "Slug invalide : minuscules, chiffres et tirets uniquement.";
    }
    if (data.excerpt.length > 500) errors.excerpt = "Maximum 500 caractères.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale: data.locale,
            title: data.title.trim(),
            slug: data.slug.trim(),
            excerpt: data.excerpt.trim() || null,
            status: "DRAFT",
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          // Erreur de validation Zod
          if (res.status === 422 && body.details) {
            const flat = body.details.fieldErrors as Record<string, string[]>;
            setFieldErrors({
              title: flat.title?.[0],
              slug: flat.slug?.[0],
              excerpt: flat.excerpt?.[0],
            });
            throw new Error("Veuillez corriger les erreurs ci-dessous.");
          }
          throw new Error(body.error ?? "Erreur lors de la création.");
        }

        const article = await res.json();
        // Redirige vers la page d'édition complète
        router.push(`/admin/articles/${article.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="new-article-form" noValidate>
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}
        </div>
      )}

      {/* Langue */}
      <div className="admin-field">
        <label className="admin-label" htmlFor="na-locale">
          Langue <span className="admin-required">*</span>
        </label>
        <div className="locale-select-group">
          {(["FR", "EN", "ES"] as Locale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              className={`locale-btn ${data.locale === loc ? "locale-btn--active" : ""}`}
              onClick={() => set("locale", loc)}
            >
              {loc === "FR" ? "🇫🇷 Français" : loc === "EN" ? "🇬🇧 English" : "🇪🇸 Español"}
            </button>
          ))}
        </div>
      </div>

      {/* Titre */}
      <div className={`admin-field ${fieldErrors.title ? "admin-field--error" : ""}`}>
        <label className="admin-label" htmlFor="na-title">
          Titre <span className="admin-required">*</span>
        </label>
        <input
          id="na-title"
          type="text"
          autoFocus
          className={`admin-input admin-input--lg ${fieldErrors.title ? "admin-input--invalid" : ""}`}
          placeholder="Titre de l'article"
          value={data.title}
          onChange={handleTitleChange}
          maxLength={200}
          disabled={isPending}
        />
        {fieldErrors.title && (
          <span className="admin-field-error">{fieldErrors.title}</span>
        )}
      </div>

      {/* Slug */}
      <div className={`admin-field ${fieldErrors.slug ? "admin-field--error" : ""}`}>
        <label className="admin-label" htmlFor="na-slug">
          Slug URL <span className="admin-required">*</span>
          {!slugEdited && data.slug && (
            <span className="admin-label__hint">généré automatiquement</span>
          )}
        </label>
        <div className="admin-input-group">
          <span className="admin-input-prefix">
            /{data.locale.toLowerCase()}/stories/
          </span>
          <input
            id="na-slug"
            type="text"
            className={`admin-input ${fieldErrors.slug ? "admin-input--invalid" : ""}`}
            placeholder="mon-article"
            value={data.slug}
            onChange={handleSlugChange}
            maxLength={200}
            disabled={isPending}
          />
        </div>
        {fieldErrors.slug ? (
          <span className="admin-field-error">{fieldErrors.slug}</span>
        ) : (
          <span className="admin-hint">
            Minuscules, chiffres, tirets — modifiable après création
          </span>
        )}
      </div>

      {/* Extrait */}
      <div className={`admin-field ${fieldErrors.excerpt ? "admin-field--error" : ""}`}>
        <label className="admin-label" htmlFor="na-excerpt">
          Extrait
          <span className="admin-label__optional">optionnel</span>
        </label>
        <textarea
          id="na-excerpt"
          className={`admin-input ${fieldErrors.excerpt ? "admin-input--invalid" : ""}`}
          rows={3}
          placeholder="Bref résumé visible dans la liste des articles et sur les réseaux sociaux…"
          value={data.excerpt}
          maxLength={500}
          onChange={(e) => set("excerpt", e.target.value)}
          disabled={isPending}
        />
        <span className={`admin-hint ${data.excerpt.length > 480 ? "admin-hint--warn" : ""}`}>
          {data.excerpt.length}/500
        </span>
        {fieldErrors.excerpt && (
          <span className="admin-field-error">{fieldErrors.excerpt}</span>
        )}
      </div>

      {/* Actions */}
      <div className="new-article-form__actions">
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => router.push("/admin/articles")}
          disabled={isPending}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={isPending || !data.title || !data.slug}
        >
          {isPending ? (
            <span className="login-btn-inner">
              <span className="login-spinner" aria-hidden="true" />
              Création…
            </span>
          ) : (
            "Créer et éditer →"
          )}
        </button>
      </div>
    </form>
  );
}
