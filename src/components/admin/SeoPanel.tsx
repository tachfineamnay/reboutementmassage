"use client";

type SeoPanelProps = {
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  noindex: boolean;
  slug: string;
  locale: string;
  onChange: (field: string, value: string | boolean) => void;
};

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://votre-domaine.fr";

export default function SeoPanel({
  seoTitle,
  seoDescription,
  focusKeyword,
  noindex,
  slug,
  locale,
  onChange,
}: SeoPanelProps) {
  const titleLen = seoTitle.length;
  const descLen = seoDescription.length;

  const titleColor =
    titleLen === 0 ? "seo-field__count--empty"
    : titleLen <= 60 ? "seo-field__count--good"
    : "seo-field__count--over";

  const descColor =
    descLen === 0 ? "seo-field__count--empty"
    : descLen <= 160 ? "seo-field__count--good"
    : "seo-field__count--over";

  return (
    <div className="seo-panel">
      <h3 className="seo-panel__title">SEO &amp; Partage</h3>

      {/* Prévisualisation Google */}
      <div className="seo-preview">
        <p className="seo-preview__label">Aperçu Google</p>
        <div className="seo-preview__card">
          <span className="seo-preview__url">
            {SITE_DOMAIN}/stories/{locale.toLowerCase()}/{slug || "votre-slug"}
          </span>
          <p className="seo-preview__title">
            {seoTitle || "Titre SEO (60 caractères max)"}
          </p>
          <p className="seo-preview__desc">
            {seoDescription || "Description SEO (160 caractères max)…"}
          </p>
        </div>
      </div>

      {/* Focus keyword */}
      <div className="seo-field">
        <label className="seo-field__label" htmlFor="seo-focus-keyword">
          Mot-clé principal
        </label>
        <input
          id="seo-focus-keyword"
          type="text"
          className="admin-input seo-field__input"
          value={focusKeyword}
          maxLength={100}
          placeholder="Mot-clé cible principal"
          onChange={(e) => onChange("focusKeyword", e.target.value)}
        />
      </div>

      {/* Meta title */}
      <div className="seo-field">
        <label className="seo-field__label" htmlFor="seo-title">
          Titre SEO
        </label>
        <div className="seo-field__row">
          <input
            id="seo-title"
            type="text"
            className="admin-input seo-field__input"
            value={seoTitle}
            maxLength={80}
            placeholder="Titre pour les moteurs de recherche (60 car. max)"
            onChange={(e) => onChange("seoTitle", e.target.value)}
          />
          <span className={`seo-field__count ${titleColor}`}>
            {titleLen}/60
          </span>
        </div>
      </div>

      {/* Meta description */}
      <div className="seo-field">
        <label className="seo-field__label" htmlFor="seo-description">
          Description SEO
        </label>
        <div className="seo-field__row seo-field__row--col">
          <textarea
            id="seo-description"
            className="admin-input seo-field__textarea"
            value={seoDescription}
            maxLength={200}
            rows={3}
            placeholder="Description pour les moteurs de recherche (160 car. max)"
            onChange={(e) => onChange("seoDescription", e.target.value)}
          />
          <span className={`seo-field__count ${descColor}`}>
            {descLen}/160
          </span>
        </div>
      </div>

      {/* Noindex */}
      <div className="seo-field seo-field--checkbox">
        <label className="seo-field__label--inline" htmlFor="seo-noindex">
          <input
            id="seo-noindex"
            type="checkbox"
            checked={noindex}
            onChange={(e) => onChange("noindex", e.target.checked)}
          />
          <span>Noindex (exclure de Google)</span>
        </label>
      </div>
    </div>
  );
}
