"use client";

import { useMemo, useState } from "react";
import {
  auditGeoContent,
  type EvidenceNotes,
  type FaqItem,
  type GeoChecklistItem,
} from "@/lib/geo";

type SeoPanelValue = string | boolean | string[] | FaqItem[] | EvidenceNotes;

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
  seoScore?: number;
  primaryQuestion: string;
  answerIntent: string;
  targetAudience: string;
  geoLocation: string;
  businessGoal: string;
  entityTargets: string[];
  faqItems: FaqItem[];
  evidenceNotes: EvidenceNotes;
  onChange: (field: string, value: SeoPanelValue) => void;
};

type PanelTab = "seo" | "aeo" | "credibility";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://votre-domaine.fr";

function scoreClass(score: number) {
  if (score >= 80) return "seo-score--good";
  if (score >= 50) return "seo-score--medium";
  return "seo-score--low";
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <span className={`seo-score ${scoreClass(score)}`} title={`${label} : ${score}/100`}>
      <span className="seo-score__value">{score}</span>
      <span className="seo-score__label">{label}</span>
    </span>
  );
}

function Checklist({ items }: { items: GeoChecklistItem[] }) {
  return (
    <div className="aeo-checklist">
      {items.map((item) => (
        <div className="aeo-checklist__item" key={item.id}>
          <div>
            <p className="aeo-checklist__label">{item.label}</p>
            <p className="aeo-checklist__detail">{item.detail}</p>
          </div>
          <span className={`aeo-status ${item.passed ? "aeo-status--ok" : "aeo-status--todo"}`}>
            {item.passed ? "OK" : "À corriger"}
          </span>
        </div>
      ))}
    </div>
  );
}

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
  seoScore = 0,
  primaryQuestion,
  answerIntent,
  targetAudience,
  geoLocation,
  businessGoal,
  entityTargets,
  faqItems,
  evidenceNotes,
  onChange,
}: SeoPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("seo");
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
        primaryQuestion,
        answerIntent,
        targetAudience,
        geoLocation,
        businessGoal,
        entityTargets,
        faqItems,
        evidenceNotes,
        authorName: "Grégory Tordjman",
      }),
    [
      title,
      seoTitle,
      seoDescription,
      focusKeyword,
      plainText,
      html,
      editorJson,
      primaryQuestion,
      answerIntent,
      targetAudience,
      geoLocation,
      businessGoal,
      entityTargets,
      faqItems,
      evidenceNotes,
    ]
  );

  const titleColor =
    titleLen === 0
      ? "seo-field__count--empty"
      : titleLen <= 60
        ? "seo-field__count--good"
        : "seo-field__count--over";
  const descColor =
    descLen === 0
      ? "seo-field__count--empty"
      : descLen <= 160
        ? "seo-field__count--good"
        : "seo-field__count--over";
  const activeChecklist = geoAudit.checklist.filter((item) =>
    activeTab === "credibility"
      ? item.area === "eeat"
      : activeTab === "aeo"
        ? item.area === "aeo" || item.area === "geo"
        : false
  );

  function updateFaq(index: number, field: keyof FaqItem, value: string) {
    onChange(
      "faqItems",
      faqItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  return (
    <div className="seo-panel">
      <div className="seo-panel__heading">
        <div>
          <p className="seo-panel__eyebrow">Assistant éditorial</p>
          <h3 className="seo-panel__title">SEO, AEO &amp; GEO</h3>
        </div>
        <p className="seo-panel__note">
          Structure les réponses sans promettre de featured snippet.
        </p>
      </div>

      <div className="seo-score-grid" aria-label="Scores éditoriaux">
        <ScoreCard label="SEO" score={seoScore} />
        <ScoreCard label="AEO" score={geoAudit.aeoScore} />
        <ScoreCard label="GEO" score={geoAudit.geoScore} />
        <ScoreCard label="E-E-A-T" score={geoAudit.eeatScore} />
      </div>

      <div className="seo-tabs" role="tablist" aria-label="Sections de l'assistant">
        {([
          ["seo", "SEO"],
          ["aeo", "AEO/GEO"],
          ["credibility", "Crédibilité"],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`seo-tab ${activeTab === tab ? "seo-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "seo" && (
        <div className="seo-tab-panel">
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
              placeholder="Expression réellement traitée dans l'article"
              onChange={(event) => onChange("focusKeyword", event.target.value)}
            />
          </div>

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
                placeholder="Titre pour les moteurs de recherche"
                onChange={(event) => onChange("seoTitle", event.target.value)}
              />
              <span className={`seo-field__count ${titleColor}`}>{titleLen}/60</span>
            </div>
          </div>

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
                placeholder="Résumé précis et utile de la page"
                onChange={(event) => onChange("seoDescription", event.target.value)}
              />
              <span className={`seo-field__count ${descColor}`}>{descLen}/160</span>
            </div>
          </div>

          <div className="seo-field seo-field--checkbox">
            <label className="seo-field__label--inline" htmlFor="seo-noindex">
              <input
                id="seo-noindex"
                type="checkbox"
                checked={noindex}
                onChange={(event) => onChange("noindex", event.target.checked)}
              />
              <span>Noindex (exclure de Google)</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === "aeo" && (
        <div className="seo-tab-panel">
          <div className="seo-field">
            <label className="seo-field__label" htmlFor="aeo-primary-question">
              Question principale
            </label>
            <input
              id="aeo-primary-question"
              className="admin-input"
              value={primaryQuestion}
              maxLength={300}
              placeholder="Ex. Comment soulager une tension musculaire persistante ?"
              onChange={(event) => onChange("primaryQuestion", event.target.value)}
            />
          </div>

          <div className="seo-field">
            <label className="seo-field__label" htmlFor="aeo-answer-intent">
              Type de réponse
            </label>
            <select
              id="aeo-answer-intent"
              className="admin-input"
              value={answerIntent}
              onChange={(event) => onChange("answerIntent", event.target.value)}
            >
              <option value="">Sélectionner une intention</option>
              <option value="definition">Définition claire</option>
              <option value="how-to">Méthode / étapes</option>
              <option value="comparison">Comparaison</option>
              <option value="recommendation">Recommandation contextualisée</option>
              <option value="local">Réponse locale</option>
              <option value="expert-analysis">Analyse experte</option>
            </select>
          </div>

          <div className="seo-field">
            <label className="seo-field__label" htmlFor="aeo-target-audience">
              Audience cible
            </label>
            <input
              id="aeo-target-audience"
              className="admin-input"
              value={targetAudience}
              maxLength={300}
              placeholder="Client privé, thérapeute, spa, hôtel, équipe..."
              onChange={(event) => onChange("targetAudience", event.target.value)}
            />
          </div>

          <div className="seo-field">
            <label className="seo-field__label" htmlFor="aeo-geo-location">
              Zone géographique
            </label>
            <input
              id="aeo-geo-location"
              className="admin-input"
              value={geoLocation}
              maxLength={200}
              placeholder="France, Caraïbes, Mexique, international..."
              onChange={(event) => onChange("geoLocation", event.target.value)}
            />
          </div>

          <div className="seo-field">
            <label className="seo-field__label" htmlFor="aeo-business-goal">
              Objectif business
            </label>
            <input
              id="aeo-business-goal"
              className="admin-input"
              value={businessGoal}
              maxLength={300}
              placeholder="Informer, qualifier une demande, présenter une expertise..."
              onChange={(event) => onChange("businessGoal", event.target.value)}
            />
          </div>

          <div className="seo-field">
            <label className="seo-field__label" htmlFor="aeo-entities">
              Entités à renforcer
            </label>
            <textarea
              id="aeo-entities"
              className="admin-input"
              rows={4}
              value={entityTargets.join("\n")}
              placeholder={"Une entité par ligne\nMéthode TMS®\nGrégory Tordjman"}
              onChange={(event) =>
                onChange(
                  "entityTargets",
                  event.target.value
                    .split("\n")
                    .map((value) => value.trim())
                    .filter(Boolean)
                )
              }
            />
            <span className="admin-hint">
              Seules les entités réellement visibles seront reprises dans le JSON-LD.
            </span>
          </div>

          <div className="seo-field">
            <div className="seo-field__header">
              <div>
                <p className="seo-field__label">FAQ visible</p>
                <p className="admin-hint">Affichée sur la page et utilisée pour FAQPage.</p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() =>
                  onChange("faqItems", [...faqItems, { question: "", answer: "" }])
                }
              >
                + Ajouter
              </button>
            </div>

            <div className="faq-editor-list">
              {faqItems.length === 0 && (
                <p className="seo-empty-state">Aucune FAQ. N&apos;ajoutez que des réponses utiles et visibles.</p>
              )}
              {faqItems.map((item, index) => (
                <div className="faq-editor-item" key={`faq-${index}`}>
                  <input
                    className="admin-input"
                    value={item.question}
                    maxLength={300}
                    placeholder={`Question ${index + 1}`}
                    onChange={(event) => updateFaq(index, "question", event.target.value)}
                  />
                  <textarea
                    className="admin-input"
                    value={item.answer}
                    maxLength={2000}
                    rows={3}
                    placeholder="Réponse visible, précise et autonome"
                    onChange={(event) => updateFaq(index, "answer", event.target.value)}
                  />
                  <button
                    type="button"
                    className="seo-remove-button"
                    onClick={() =>
                      onChange(
                        "faqItems",
                        faqItems.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "credibility" && (
        <div className="seo-tab-panel">
          <div className="credibility-intro">
            <p>Who / How / Why</p>
            <strong>Grégory Tordjman est affiché comme auteur de l&apos;article.</strong>
            <span>
              Documentez ce qui vient de la pratique et les limites à respecter. Ces textes
              seront visibles sur la page.
            </span>
          </div>

          <div className="seo-field">
            <label className="seo-field__label" htmlFor="eeat-experience">
              Notes d&apos;expérience
            </label>
            <textarea
              id="eeat-experience"
              className="admin-input"
              rows={6}
              value={evidenceNotes.experience}
              maxLength={4000}
              placeholder="Contexte réel, observations de terrain, méthode appliquée, résultat raisonnablement observable..."
              onChange={(event) =>
                onChange("evidenceNotes", {
                  ...evidenceNotes,
                  experience: event.target.value,
                })
              }
            />
          </div>

          <div className="seo-field">
            <label className="seo-field__label" htmlFor="eeat-precautions">
              Limites / précautions
            </label>
            <textarea
              id="eeat-precautions"
              className="admin-input"
              rows={6}
              value={evidenceNotes.precautions}
              maxLength={4000}
              placeholder="Limites de l'approche, situations nécessitant un avis médical ou une prise en charge spécifique..."
              onChange={(event) =>
                onChange("evidenceNotes", {
                  ...evidenceNotes,
                  precautions: event.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      {activeChecklist.length > 0 && (
        <div className="seo-audit">
          <div className="seo-audit__heading">
            <p className="seo-preview__label">Contrôles sur le contenu visible</p>
            <span>{activeChecklist.filter((item) => item.passed).length}/{activeChecklist.length}</span>
          </div>
          <Checklist items={activeChecklist} />
        </div>
      )}
    </div>
  );
}
