"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

type Locale = "FR" | "EN" | "ES";
type WizardStep = "idea" | "context" | "details";

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

const LOCALE_FLAGS: Record<Locale, string> = {
  FR: "🇫🇷",
  EN: "🇬🇧",
  ES: "🇪🇸",
};

const AUDIENCE_SUGGESTIONS = [
  "Clients privés",
  "Hôtels de luxe",
  "Spas & centres de bien-être",
  "Thérapeutes",
  "Entreprises",
];

const GOAL_SUGGESTIONS = [
  "Générer des leads",
  "Éduquer & rassurer",
  "Positionner l'expertise",
  "Convertir les prospects",
];

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

function WizardProgress({ step, onStepClick }: { step: WizardStep; onStepClick: (s: WizardStep) => void }) {
  const steps: { id: WizardStep; label: string; num: number }[] = [
    { id: "idea", label: "Idée", num: 1 },
    { id: "context", label: "Contexte", num: 2 },
    { id: "details", label: "Finaliser", num: 3 },
  ];
  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="wizard-progress">
      {steps.map((s, idx) => {
        const isDone = idx < currentIndex;
        const isActive = s.id === step;
        const isClickable = idx <= currentIndex;
        return (
          <button
            key={s.id}
            type="button"
            className={`wizard-progress__step ${isDone ? "wizard-progress__step--done" : ""} ${isActive ? "wizard-progress__step--active" : ""}`}
            onClick={() => isClickable && onStepClick(s.id)}
            disabled={!isClickable}
          >
            <span className="wizard-progress__dot">
              {isDone ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                s.num
              )}
            </span>
            <span className="wizard-progress__label">{s.label}</span>
          </button>
        );
      })}
      <div className="wizard-progress__line" style={{ "--progress": `${(currentIndex / (steps.length - 1)) * 100}%` } as React.CSSProperties} />
    </div>
  );
}

function ChipSelector({ 
  options, 
  selected, 
  onSelect, 
  placeholder 
}: { 
  options: string[]; 
  selected: string; 
  onSelect: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="chip-selector">
      <input
        type="text"
        className="admin-input chip-selector__input"
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        placeholder={placeholder}
      />
      <div className="chip-selector__chips">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`chip-selector__chip ${selected === opt ? "chip-selector__chip--active" : ""}`}
            onClick={() => onSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NewArticleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<WizardStep>("idea");
  const [data, setData] = useState<FormState>(DEFAULT);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }, [fieldErrors]);

  function syncSlug(nextTitle: string) {
    if (!slugEdited) {
      setData((prev) => ({ ...prev, slug: slugify(nextTitle) }));
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

  function validateStep(): boolean {
    const errors: FieldError = {};
    
    if (step === "idea") {
      if (!data.topic.trim()) {
        errors.topic = "Décrivez votre idée d'article";
      }
    }
    
    if (step === "details") {
      const title = getResolvedTitle();
      const slug = data.slug.trim() || slugify(title);
      if (!title) errors.provisionalTitle = "Un titre est requis.";
      if (!slug) errors.slug = "Le slug est requis.";
      if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        errors.slug = "Slug invalide : minuscules, chiffres et tirets uniquement.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    if (!validateStep()) return;
    if (step === "idea") setStep("context");
    else if (step === "context") setStep("details");
  }

  function prevStep() {
    if (step === "context") setStep("idea");
    else if (step === "details") setStep("context");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep()) return;

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
            locale: data.locale,
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
            throw new Error("Veuillez corriger les erreurs.");
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

  const canProceed = step === "idea" ? data.topic.trim().length > 0 : true;
  const resolvedTitle = getResolvedTitle();
  const resolvedSlug = data.slug.trim() || slugify(resolvedTitle);

  return (
    <form onSubmit={handleSubmit} className="new-article-wizard" noValidate>
      <WizardProgress step={step} onStepClick={setStep} />

      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}
        </div>
      )}

      {step === "idea" && (
        <div className="wizard-step wizard-step--idea">
          <div className="wizard-step__header">
            <h2 className="wizard-step__title">Quelle est votre idée ?</h2>
            <p className="wizard-step__desc">Décrivez le sujet que vous souhaitez aborder. Soyez aussi précis que possible.</p>
          </div>

          <div className={`admin-field ${fieldErrors.topic ? "admin-field--error" : ""}`}>
            <textarea
              id="studio-topic"
              className={`admin-input admin-input--xl ${fieldErrors.topic ? "admin-input--invalid" : ""}`}
              rows={4}
              autoFocus
              value={data.topic}
              onChange={handleTopicChange}
              placeholder="Ex: Comment soulager les tensions cervicales après un long vol ?"
              disabled={isPending}
            />
            {fieldErrors.topic && <span className="admin-field-error">{fieldErrors.topic}</span>}
          </div>

          <div className="wizard-step__locale">
            <span className="admin-label">Langue de rédaction</span>
            <div className="locale-selector">
              {(["FR", "EN", "ES"] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className={`locale-selector__btn ${data.locale === loc ? "locale-selector__btn--active" : ""}`}
                  onClick={() => set("locale", loc)}
                >
                  <span className="locale-selector__flag">{LOCALE_FLAGS[loc]}</span>
                  <span>{loc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "context" && (
        <div className="wizard-step wizard-step--context">
          <div className="wizard-step__header">
            <h2 className="wizard-step__title">Contexte de l&apos;article</h2>
            <p className="wizard-step__desc">Ces informations aident l&apos;IA à générer un contenu plus pertinent.</p>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="studio-audience">Pour qui écrivez-vous ?</label>
            <ChipSelector
              options={AUDIENCE_SUGGESTIONS}
              selected={data.audience}
              onSelect={(v) => set("audience", v)}
              placeholder="Décrivez votre audience cible..."
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="studio-goal">Quel est l&apos;objectif ?</label>
            <ChipSelector
              options={GOAL_SUGGESTIONS}
              selected={data.businessGoal}
              onSelect={(v) => set("businessGoal", v)}
              placeholder="Objectif principal de l'article..."
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="studio-location">Localisation géographique</label>
            <input
              id="studio-location"
              className="admin-input"
              value={data.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="France, Sayulita, Caraïbes... (optionnel)"
              disabled={isPending}
            />
            <span className="admin-hint">Laissez vide pour un article sans ciblage géographique</span>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="wizard-step wizard-step--details">
          <div className="wizard-step__header">
            <h2 className="wizard-step__title">Derniers détails</h2>
            <p className="wizard-step__desc">Finalisez le titre et l&apos;URL avant de lancer le studio.</p>
          </div>

          <div className="wizard-preview">
            <div className="wizard-preview__card">
              <span className="wizard-preview__badge">{LOCALE_FLAGS[data.locale]} {data.locale}</span>
              <p className="wizard-preview__topic">{data.topic}</p>
              {data.audience && <span className="wizard-preview__meta">Audience: {data.audience}</span>}
              {data.businessGoal && <span className="wizard-preview__meta">Objectif: {data.businessGoal}</span>}
            </div>
          </div>

          <div className={`admin-field ${fieldErrors.provisionalTitle ? "admin-field--error" : ""}`}>
            <label className="admin-label" htmlFor="studio-title">Titre de l&apos;article</label>
            <input
              id="studio-title"
              className={`admin-input admin-input--lg ${fieldErrors.provisionalTitle ? "admin-input--invalid" : ""}`}
              value={data.provisionalTitle}
              onChange={handleTitleChange}
              maxLength={200}
              placeholder={titleFromTopic(data.topic) || "Titre accrocheur..."}
              disabled={isPending}
            />
            {!data.provisionalTitle && data.topic && (
              <span className="admin-hint">Suggestion: {titleFromTopic(data.topic)}</span>
            )}
            {fieldErrors.provisionalTitle && (
              <span className="admin-field-error">{fieldErrors.provisionalTitle}</span>
            )}
          </div>

          <button
            type="button"
            className="wizard-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: showAdvanced ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Options avancées
          </button>

          {showAdvanced && (
            <div className="wizard-advanced">
              <div className={`admin-field ${fieldErrors.slug ? "admin-field--error" : ""}`}>
                <label className="admin-label" htmlFor="studio-slug">
                  URL personnalisée
                  {!slugEdited && resolvedSlug && <span className="admin-label__hint">auto</span>}
                </label>
                <div className="admin-input-group">
                  <span className="admin-input-prefix">/{data.locale.toLowerCase()}/stories/</span>
                  <input
                    id="studio-slug"
                    className={`admin-input ${fieldErrors.slug ? "admin-input--invalid" : ""}`}
                    value={data.slug || resolvedSlug}
                    onChange={handleSlugChange}
                    maxLength={200}
                    disabled={isPending}
                  />
                </div>
                {fieldErrors.slug && <span className="admin-field-error">{fieldErrors.slug}</span>}
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="studio-angle">Angle éditorial</label>
                <textarea
                  id="studio-angle"
                  className="admin-input"
                  rows={2}
                  maxLength={500}
                  value={data.editorialAngle}
                  onChange={(e) => set("editorialAngle", e.target.value)}
                  placeholder="Point de vue unique ou promesse éditoriale (optionnel)"
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="wizard-actions">
        {step !== "idea" && (
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={prevStep}
            disabled={isPending}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour
          </button>
        )}
        
        <button
          type="button"
          className="admin-btn admin-btn--ghost wizard-actions__cancel"
          onClick={() => router.push("/admin/articles")}
          disabled={isPending}
        >
          Annuler
        </button>

        {step !== "details" ? (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={nextStep}
            disabled={!canProceed || isPending}
          >
            Continuer
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="admin-btn__spinner" />
                Création...
              </>
            ) : (
              <>
                Lancer le Studio
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
