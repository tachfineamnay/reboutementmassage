"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

type Locale = "FR" | "EN" | "ES";

type FormState = {
  locale: Locale;
  topic: string;
  audience: string;
  location: string;
  businessGoal: string;
  editorialAngle: string;
  provisionalTitle: string;
  slug: string;
};

const DEFAULT: FormState = {
  locale: "FR",
  topic: "",
  audience: "",
  location: "",
  businessGoal: "",
  editorialAngle: "",
  provisionalTitle: "",
  slug: "",
};

type FieldError = Partial<Record<keyof FormState, string>>;

function normalizeLocale(value: FormDataEntryValue | null, fallback: Locale): Locale {
  return value === "FR" || value === "EN" || value === "ES" ? value : fallback;
}

function titleFromTopic(topic: string) {
  const cleaned = topic.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function buildExcerpt(data: FormState) {
  if (data.editorialAngle.trim()) return data.editorialAngle.trim();
  const parts = [
    data.topic.trim(),
    data.audience.trim() ? `pour ${data.audience.trim()}` : "",
    data.location.trim() ? `à ${data.location.trim()}` : "",
  ].filter(Boolean);
  return parts.join(" ").slice(0, 500);
}

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

  function syncSlug(nextTitle: string) {
    if (!slugEdited) {
      set("slug", slugify(nextTitle));
    }
  }

  function handleTopicChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const topic = event.target.value;
    set("topic", topic);
    if (!data.provisionalTitle.trim()) {
      syncSlug(titleFromTopic(topic));
    }
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const title = event.target.value;
    set("provisionalTitle", title);
    syncSlug(title || titleFromTopic(data.topic));
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    set(
      "slug",
      event.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }

  function getResolvedTitle() {
    return data.provisionalTitle.trim() || titleFromTopic(data.topic);
  }

  function validate(): boolean {
    const errors: FieldError = {};
    const title = getResolvedTitle();
    const slug = data.slug.trim() || slugify(title);

    if (!data.topic.trim() && !data.provisionalTitle.trim()) {
      errors.topic = "Renseignez un sujet ou un titre provisoire.";
    }
    if (!title) errors.provisionalTitle = "Un titre provisoire est requis.";
    if (!slug) errors.slug = "Le slug est requis.";
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Slug invalide : minuscules, chiffres et tirets uniquement.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedLocale = normalizeLocale(formData.get("locale"), data.locale);
    if (!validate()) return;

    const title = getResolvedTitle();
    const slug = data.slug.trim() || slugify(title);
    const excerpt = buildExcerpt(data);
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale: selectedLocale,
            title,
            slug,
            excerpt: excerpt || null,
            status: "DRAFT",
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 422 && body.details) {
            const flat = body.details.fieldErrors as Record<string, string[]>;
            setFieldErrors({
              provisionalTitle: flat.title?.[0],
              slug: flat.slug?.[0],
            });
            throw new Error("Veuillez corriger les erreurs ci-dessous.");
          }
          throw new Error(body.error ?? "Erreur lors de la création.");
        }

        const article = await res.json();

        await fetch(`/api/admin/articles/${article.id}/seo`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noindex: false,
            primaryQuestion: data.topic.trim() || null,
            targetAudience: data.audience.trim() || null,
            geoLocation: data.location.trim() || null,
            businessGoal: data.businessGoal.trim() || null,
            entityTargets: [],
            faqItems: [],
            evidenceNotes: { experience: "", precautions: "" },
          }),
        }).catch(() => undefined);

        router.push(`/admin/articles/${article.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="new-article-form new-studio-form" noValidate>
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}
        </div>
      )}

      <div className={`admin-field ${fieldErrors.topic ? "admin-field--error" : ""}`}>
        <label className="admin-label" htmlFor="studio-topic">
          Sujet brut <span className="admin-required">*</span>
        </label>
        <textarea
          id="studio-topic"
          className={`admin-input admin-input--lg ${fieldErrors.topic ? "admin-input--invalid" : ""}`}
          rows={4}
          autoFocus
          value={data.topic}
          onChange={handleTopicChange}
          placeholder="Ex. Soulager les tensions cervicales après un long voyage"
          disabled={isPending}
        />
        {fieldErrors.topic && <span className="admin-field-error">{fieldErrors.topic}</span>}
      </div>

      <div className="new-studio-form__grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="studio-locale">
            Langue de départ
          </label>
          <select
            id="studio-locale"
            name="locale"
            className="admin-input"
            value={data.locale}
            onChange={(event) => set("locale", event.target.value as Locale)}
            disabled={isPending}
          >
            <option value="FR">Français</option>
            <option value="EN">English</option>
            <option value="ES">Español</option>
          </select>
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="studio-audience">Audience cible</label>
          <input
            id="studio-audience"
            className="admin-input"
            value={data.audience}
            onChange={(event) => set("audience", event.target.value)}
            placeholder="Client privé, spa, hôtel, thérapeute..."
            disabled={isPending}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="studio-location">Localisation</label>
          <input
            id="studio-location"
            className="admin-input"
            value={data.location}
            onChange={(event) => set("location", event.target.value)}
            placeholder="France, Sayulita, Caraïbes..."
            disabled={isPending}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="studio-goal">Objectif business</label>
          <input
            id="studio-goal"
            className="admin-input"
            value={data.businessGoal}
            onChange={(event) => set("businessGoal", event.target.value)}
            placeholder="Qualifier une demande, rassurer, convertir..."
            disabled={isPending}
          />
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="studio-angle">Angle éditorial</label>
        <textarea
          id="studio-angle"
          className="admin-input"
          rows={3}
          maxLength={500}
          value={data.editorialAngle}
          onChange={(event) => set("editorialAngle", event.target.value)}
          placeholder="Point de vue, promesse éditoriale ou extrait de départ."
          disabled={isPending}
        />
        <span className="admin-hint">{data.editorialAngle.length}/500</span>
      </div>

      <div className="new-studio-form__grid">
        <div className={`admin-field ${fieldErrors.provisionalTitle ? "admin-field--error" : ""}`}>
          <label className="admin-label" htmlFor="studio-title">
            Titre provisoire
            <span className="admin-label__optional">optionnel si sujet renseigné</span>
          </label>
          <input
            id="studio-title"
            className={`admin-input ${fieldErrors.provisionalTitle ? "admin-input--invalid" : ""}`}
            value={data.provisionalTitle}
            onChange={handleTitleChange}
            maxLength={200}
            placeholder={titleFromTopic(data.topic) || "Titre de départ"}
            disabled={isPending}
          />
          {fieldErrors.provisionalTitle && (
            <span className="admin-field-error">{fieldErrors.provisionalTitle}</span>
          )}
        </div>

        <div className={`admin-field ${fieldErrors.slug ? "admin-field--error" : ""}`}>
          <label className="admin-label" htmlFor="studio-slug">
            Slug URL <span className="admin-required">*</span>
            {!slugEdited && data.slug && <span className="admin-label__hint">auto</span>}
          </label>
          <div className="admin-input-group">
            <span className="admin-input-prefix">/{data.locale.toLowerCase()}/stories/</span>
            <input
              id="studio-slug"
              className={`admin-input ${fieldErrors.slug ? "admin-input--invalid" : ""}`}
              value={data.slug}
              onChange={handleSlugChange}
              maxLength={200}
              disabled={isPending}
            />
          </div>
          {fieldErrors.slug && <span className="admin-field-error">{fieldErrors.slug}</span>}
        </div>
      </div>

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
          disabled={isPending || (!data.topic.trim() && !data.provisionalTitle.trim())}
        >
          {isPending ? "Création..." : "Lancer le Studio"}
        </button>
      </div>
    </form>
  );
}
