"use client";

import { useMemo } from "react";
import { auditGeoContent } from "@/lib/geo";

type SeoPanelProps = {
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  noindex: boolean;
  slug: string;
  locale: string;
  title?: string;
  plainText?: string;
  html?: string;
  editorJson?: unknown;
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
  title,
  plainText,
  html,
  editorJson,
  onChange,
}: SeoPanelProps) {
  const titleLen = seoTitle.length;
  const descLen = seoDescription.length;
  const geoAudit = useMemo(
    () =>
      auditGeoContent({
        title,
        seoTitle,
        metaDescription: seoDescription,
        focusKeyword,
        plainText,
        html,
        editorJson,
      }),
    [title, seoTitle, seoDescription, focusKeyword, plainText, html, editorJson]
  );

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
            {SITE_DOMAIN}/{locale.toLowerCase()}/stories/{slug || "votre-slug"}
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

      <div
        className="seo-preview"
        style={{
          borderTop: "1px solid var(--admin-border)",
          paddingTop: "18px",
          marginTop: "18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
          <div>
            <p className="seo-preview__label">Checklist AEO/GEO</p>
            <p style={{ margin: "4px 0 0", color: "var(--admin-muted)", fontSize: "12px" }}>
              Optimisation pour réponses directes et lecture par IA générative.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span
              className={`seo-score ${
                geoAudit.llmReadabilityScore >= 80
                  ? "seo-score--good"
                  : geoAudit.llmReadabilityScore >= 50
                  ? "seo-score--medium"
                  : "seo-score--low"
              }`}
              title={`Score GEO : ${geoAudit.llmReadabilityScore}/100`}
            >
              <span className="seo-score__value">{geoAudit.llmReadabilityScore}</span>
              <span className="seo-score__label">GEO</span>
            </span>
            <span
              className={`seo-score ${
                geoAudit.answerCoverageScore >= 80
                  ? "seo-score--good"
                  : geoAudit.answerCoverageScore >= 50
                  ? "seo-score--medium"
                  : "seo-score--low"
              }`}
              title={`Couverture réponses : ${geoAudit.answerCoverageScore}/100`}
            >
              <span className="seo-score__value">{geoAudit.answerCoverageScore}</span>
              <span className="seo-score__label">AEO</span>
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
          {geoAudit.checklist.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: "10px",
                alignItems: "start",
                padding: "10px 0",
                borderBottom: "1px solid var(--admin-border)",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>
                  {item.label}
                </p>
                <p style={{ margin: "4px 0 0", color: "var(--admin-muted)", fontSize: "12px", lineHeight: 1.5 }}>
                  {item.detail}
                </p>
              </div>
              <span
                style={{
                  borderRadius: "999px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: item.passed ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.14)",
                  color: item.passed ? "var(--admin-green)" : "#d97706",
                  whiteSpace: "nowrap",
                }}
              >
                {item.passed ? "OK" : "À corriger"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
