"use client";

import React, { useState } from "react";
import { upsertLandingAction, publishLandingAction, archiveLandingAction } from "@/lib/growth/actions";
import Link from "next/link";

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
}

interface DestinationOption {
  id: string;
  cityName: string;
  displayNameFr: string;
  country?: string;
  [key: string]: unknown;
}

interface OfferOption {
  id: string;
  destinationId: string;
  internalName: string;
  type: string;
  durationMinutes?: number | null;
  priceAmount?: unknown;
  currency?: string | null;
  [key: string]: unknown;
}

interface ChannelOption {
  id: string;
  destinationId: string;
  label: string;
  phoneE164: string;
  [key: string]: unknown;
}

interface TrackingOption {
  id: string;
  destinationId: string;
  label: string;
  metaPixelId?: string | null;
  [key: string]: unknown;
}

interface CrmRuleOption {
  id: string;
  destinationId: string;
  priority?: number;
  leadSegment?: string | null;
  [key: string]: unknown;
}

interface ReadinessIssue {
  severity: string;
  message: string;
  actionUrl?: string;
}

interface LandingContent {
  hero?: { eyebrow?: string; proofLine?: string; imageAlt?: string; [key: string]: unknown };
  difference?: { title?: string; body?: string; points?: string[]; imageAlt?: string; [key: string]: unknown };
  offerBlock?: { title?: string; bullets?: string[]; launchRateLine?: string; [key: string]: unknown };
  testimonial?: { posterSrc?: string; videoSrc?: string; cta?: string; testimonialId?: string; [key: string]: unknown };
  stickyCta?: { whatsapp?: string; booking?: string; [key: string]: unknown };
  sections?: { processEyebrow?: string; faqEyebrow?: string; faqTitle?: string; [key: string]: unknown };
  whatsappMessages?: { default?: string; book_intent?: string; more_info_intent?: string; testimonial_cta?: string; sticky_cta?: string; [key: string]: unknown };
  processTitle?: string;
  forYouIfTitle?: string;
  [key: string]: unknown;
}

interface LandingInput {
  id?: string;
  destinationId?: string;
  offerId?: string | null;
  locale?: string;
  template?: string;
  slug?: string;
  status?: string;
  areaServed?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  microNote?: string | null;
  primaryCta?: string | null;
  secondaryCta?: string | null;
  heroImageId?: string | null;
  ogImageId?: string | null;
  whatsappChannelId?: string | null;
  trackingProfileId?: string | null;
  crmRoutingRuleId?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  noindex?: boolean;
  publishOverride?: boolean;
  hreflangGroupId?: string | null;
  xDefault?: boolean;
  complianceText?: string | null;
  painChips?: unknown;
  proofBadges?: unknown;
  processSteps?: unknown;
  faq?: unknown;
  content?: LandingContent | Record<string, unknown> | null;
  testimonialIds?: unknown;
  [key: string]: unknown;
}

interface LandingEditorProps {
  landing?: LandingInput;
  destinations: DestinationOption[];
  offers: OfferOption[];
  channels: ChannelOption[];
  tracking: TrackingOption[];
  crmRules: CrmRuleOption[];
  mediaAssets: MediaAsset[];
  readiness?: { score: number; issues: ReadinessIssue[] };
}


const TABS = [
  { id: "identity", label: "Identité & Modèle" },
  { id: "hero", label: "Hero Section" },
  { id: "cta", label: "WhatsApp & Suivi" },
  { id: "offer", label: "Offre & Pain Chips" },
  { id: "difference", label: "Différence & Badges" },
  { id: "process", label: "Process & FAQ" },
  { id: "testimonial", label: "Témoignage" },
  { id: "seo", label: "SEO & Publication" },
  { id: "json", label: "Advanced JSON" },
];

export default function LandingEditor({
  landing,
  destinations,
  offers,
  channels,
  tracking,
  crmRules,
  mediaAssets,
  readiness: initialReadiness,
}: LandingEditorProps) {
  const isEdit = !!landing?.id;

  const [activeTab, setActiveTab] = useState("identity");

  // Initialisation de l'état
  const [state, setState] = useState(() => {
    const l = landing || {};
    const content = typeof l.content === "object" && l.content !== null ? l.content : {};
    return {
      id: l.id || "",
      destinationId: l.destinationId || destinations[0]?.id || "",
      offerId: l.offerId || "",
      locale: l.locale || "FR",
      template: l.template || "MOBILE_WHATSAPP_FIRST",
      slug: l.slug || "",
      status: l.status || "DRAFT",
      areaServed: l.areaServed || "",
      heroTitle: l.heroTitle || "",
      heroSubtitle: l.heroSubtitle || "",
      microNote: l.microNote || "",
      primaryCta: l.primaryCta || "",
      secondaryCta: l.secondaryCta || "",
      heroImageId: l.heroImageId || "",
      ogImageId: l.ogImageId || "",
      whatsappChannelId: l.whatsappChannelId || "",
      trackingProfileId: l.trackingProfileId || "",
      crmRoutingRuleId: l.crmRoutingRuleId || "",
      seoTitle: l.seoTitle || "",
      metaDescription: l.metaDescription || "",
      canonical: l.canonical || "",
      noindex: typeof l.noindex === "boolean" ? l.noindex : true,
      publishOverride: typeof l.publishOverride === "boolean" ? l.publishOverride : false,
      hreflangGroupId: l.hreflangGroupId || "",
      xDefault: typeof l.xDefault === "boolean" ? l.xDefault : false,
      complianceText: l.complianceText || "",

      // Listes complexes
      painChips: Array.isArray(l.painChips) ? (l.painChips as string[]) : [],
      proofBadges: Array.isArray(l.proofBadges) ? (l.proofBadges as Array<{ value: string; label: string }>) : [],
      processSteps: Array.isArray(l.processSteps) ? (l.processSteps as string[]) : [],
      faq: Array.isArray(l.faq) ? (l.faq as Array<{ question: string; answer: string }>) : [],

      // Objet Content imbriqué
      content: {
        hero: {
          eyebrow: "",
          proofLine: "",
          imageAlt: "",
          ...(content.hero || {}),
        },
        difference: {
          title: "",
          body: "",
          points: [] as string[],
          imageAlt: "",
          ...(content.difference || {}),
        },
        offerBlock: {
          title: "",
          bullets: [] as string[],
          launchRateLine: "",
          ...(content.offerBlock || {}),
        },
        testimonial: {
          posterSrc: "",
          videoSrc: "",
          cta: "",
          testimonialId: "",
          ...(content.testimonial || {}),
        },
        stickyCta: {
          whatsapp: "",
          booking: "",
          ...(content.stickyCta || {}),
        },
        sections: {
          processEyebrow: "",
          faqEyebrow: "",
          faqTitle: "",
          ...(content.sections || {}),
        },
        whatsappMessages: {
          default: "",
          book_intent: "",
          more_info_intent: "",
          testimonial_cta: "",
          sticky_cta: "",
          ...(content.whatsappMessages || {}),
        },
        processTitle: typeof content.processTitle === "string" ? content.processTitle : "",
        forYouIfTitle: typeof content.forYouIfTitle === "string" ? content.forYouIfTitle : "",
      },
    };
  });

  // Debug JSON
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const syncToRawJson = () => {
    const debugObj = {
      painChips: state.painChips,
      proofBadges: state.proofBadges,
      processSteps: state.processSteps,
      faq: state.faq,
      content: state.content,
    };
    setRawJson(JSON.stringify(debugObj, null, 2));
    setJsonError("");
  };

  const handleRawJsonChange = (val: string) => {
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed) {
        setState((prev) => ({
          ...prev,
          painChips: Array.isArray(parsed.painChips) ? parsed.painChips : prev.painChips,
          proofBadges: Array.isArray(parsed.proofBadges) ? parsed.proofBadges : prev.proofBadges,
          processSteps: Array.isArray(parsed.processSteps) ? parsed.processSteps : prev.processSteps,
          faq: Array.isArray(parsed.faq) ? parsed.faq : prev.faq,
          content: parsed.content && typeof parsed.content === "object" ? parsed.content : prev.content,
        }));
        setJsonError("");
      }
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : String(err));
    }
  };

  // Filtrage des relations en fonction de la destination choisie
  const filteredOffers = offers.filter((o) => o.destinationId === state.destinationId);
  const filteredChannels = channels.filter((c) => c.destinationId === state.destinationId);
  const filteredTracking = tracking.filter((t) => t.destinationId === state.destinationId);
  const filteredCrmRules = crmRules.filter((r) => r.destinationId === state.destinationId);

  // Helper pour mettre à jour l'objet content
  const updateContentSubfield = (section: string, field: string, value: unknown) => {
    setState((prev) => {
      const existing = (prev.content as LandingContent)[section as keyof LandingContent];
      const sectionObj =
        typeof existing === "object" && existing !== null && !Array.isArray(existing)
          ? (existing as Record<string, unknown>)
          : {};
      return {
        ...prev,
        content: {
          ...prev.content,
          [section]: {
            ...sectionObj,
            [field]: value,
          },
        },
      };
    });
  };

  const updateContentDirect = (field: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  // Gestion des images
  const selectedHeroImage = mediaAssets.find((m) => m.id === state.heroImageId);
  const selectedOgImage = mediaAssets.find((m) => m.id === state.ogImageId);

  // Validation de la publication
  const score = initialReadiness?.score ?? 0;
  const isPublishBlocked = (score < 80 && !state.publishOverride) || (state.noindex && !state.publishOverride);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* En-tête de l'éditeur */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--admin-border)", paddingBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="admin-page__title" style={{ margin: 0 }}>
            {isEdit ? `Édition: ${state.heroTitle || "Sans titre"}` : "Nouvelle landing page"}
          </h1>
          {isEdit && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px" }}>
              <code style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                /{state.locale.toLowerCase()}/{state.slug || "sans-slug"}
              </code>
              <span className={`badge ${state.status === "LIVE" ? "badge--published" : "badge--draft"}`}>
                {state.status}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isEdit && (
            <>
              {/* Bouton de preview */}
              <a
                href={`/${state.locale.toLowerCase()}/${state.slug}?preview=${landing?.previewToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--secondary"
                style={{ textDecoration: "none" }}
              >
                Aperçu mobile 📱
              </a>

              {/* Bouton Publier */}
              <form action={publishLandingAction} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={state.id} />
                <input type="hidden" name="override" value={state.publishOverride ? "true" : "false"} />
                <button
                  type="submit"
                  disabled={isPublishBlocked}
                  className={`admin-btn ${isPublishBlocked ? "admin-btn--disabled" : "admin-btn--primary"}`}
                  title={isPublishBlocked ? "Publication bloquée (Readiness < 80 ou noindex actif)" : "Publier immédiatement"}
                >
                  Publier
                </button>
              </form>

              {/* Action d'archivage */}
              {state.status !== "ARCHIVED" && (
                <form action={archiveLandingAction} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={state.id} />
                  <button type="submit" className="admin-btn admin-btn--danger">
                    Archiver
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Panel Readiness */}
      {isEdit && initialReadiness && (
        <div
          style={{
            border: "1px solid var(--admin-border)",
            borderRadius: "8px",
            padding: "16px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontWeight: "bold" }}>Score de préparation (Readiness Score) :</span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: score >= 80 ? "var(--admin-green)" : "var(--admin-amber)",
              }}
            >
              {score} / 100
            </span>
          </div>
          {initialReadiness.issues.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--admin-text-muted)" }}>
                Ajustements requis :
              </span>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {initialReadiness.issues.map((iss: ReadinessIssue, idx: number) => (
                  <li key={idx} style={{ color: iss.severity === "critical" ? "red" : "orange" }}>
                    <strong>[{iss.severity.toUpperCase()}]</strong> {iss.message}
                    {iss.actionUrl && (
                      <Link href={iss.actionUrl} style={{ marginLeft: "8px", textDecoration: "underline", color: "lightblue" }}>
                        Corriger
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Onglets de navigation de l'éditeur */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--admin-border)",
          paddingBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === "json") syncToRawJson();
              setActiveTab(tab.id);
            }}
            className={`admin-btn ${activeTab === tab.id ? "admin-btn--primary" : "admin-btn--ghost"}`}
            style={{ padding: "6px 12px", fontSize: "13px", fontWeight: activeTab === tab.id ? "600" : "400" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Formulaire principal */}
      <form action={upsertLandingAction} className="admin-form">
        <input type="hidden" name="id" value={state.id} />
        <input type="hidden" name="painChips" value={JSON.stringify(state.painChips)} />
        <input type="hidden" name="proofBadges" value={JSON.stringify(state.proofBadges)} />
        <input type="hidden" name="processSteps" value={JSON.stringify(state.processSteps)} />
        <input type="hidden" name="faq" value={JSON.stringify(state.faq)} />
        <input type="hidden" name="content" value={JSON.stringify(state.content)} />

        {/* ── 1. IDENTITE ─────────────────────────────────────────────────── */}
        {activeTab === "identity" && (
          <div className="admin-form__grid">
            <label className="admin-field">
              <span className="admin-field__label">Destination *</span>
              <select
                name="destinationId"
                required
                value={state.destinationId}
                onChange={(e) => setState({ ...state, destinationId: e.target.value })}
                className="admin-input"
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.cityName} ({d.country})
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Offre liée</span>
              <select
                name="offerId"
                value={state.offerId}
                onChange={(e) => setState({ ...state, offerId: e.target.value })}
                className="admin-input"
              >
                <option value="">— Aucune offre —</option>
                {filteredOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.internalName} ({o.durationMinutes ?? "—"} min - {String(o.priceAmount ?? "—")} {o.currency ?? ""})
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Langue *</span>
              <select
                name="locale"
                required
                value={state.locale}
                onChange={(e) => setState({ ...state, locale: e.target.value })}
                className="admin-input"
              >
                <option value="FR">FR (Français)</option>
                <option value="EN">EN (Anglais)</option>
                <option value="ES">ES (Espagnol)</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Modèle graphique / Template</span>
              <select
                name="template"
                value={state.template}
                onChange={(e) => setState({ ...state, template: e.target.value })}
                className="admin-input"
              >
                <option value="MOBILE_WHATSAPP_FIRST">MOBILE_WHATSAPP_FIRST</option>
                <option value="PREMIUM_PRIVATE_SESSION">PREMIUM_PRIVATE_SESSION</option>
                <option value="B2B_HOSPITALITY">B2B_HOSPITALITY</option>
                <option value="FORMATION_LEADGEN">FORMATION_LEADGEN</option>
                <option value="SEO_LOCAL_SERVICE">SEO_LOCAL_SERVICE</option>
                <option value="EVENT_WORKSHOP">EVENT_WORKSHOP</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Slug *</span>
              <input
                name="slug"
                required
                value={state.slug}
                onChange={(e) => setState({ ...state, slug: e.target.value })}
                className="admin-input"
                placeholder="french-body-reset-st-barth"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Statut global</span>
              <select
                name="status"
                value={state.status}
                onChange={(e) => setState({ ...state, status: e.target.value })}
                className="admin-input"
              >
                <option value="DRAFT">Brouillon (DRAFT)</option>
                <option value="READY">Prêt pour relecture (READY)</option>
                <option value="LIVE">En ligne (LIVE)</option>
                <option value="PAUSED">En pause (PAUSED)</option>
                <option value="ARCHIVED">Archivé (ARCHIVED)</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Zone desservie (areaServed)</span>
              <input
                name="areaServed"
                value={state.areaServed}
                onChange={(e) => setState({ ...state, areaServed: e.target.value })}
                className="admin-input"
                placeholder="ex: Saint-Barthélemy, Caraïbes"
              />
            </label>
          </div>
        )}

        {/* ── 2. HERO SECTION ────────────────────────────────────────────── */}
        {activeTab === "hero" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label className="admin-field">
              <span className="admin-field__label">Sur-titre (eyebrow)</span>
              <input
                type="text"
                value={state.content.hero.eyebrow}
                onChange={(e) => updateContentSubfield("hero", "eyebrow", e.target.value)}
                className="admin-input"
                placeholder="ex: Saint-Barthélemy · Séance privée"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Titre principal (Hero Title) *</span>
              <input
                name="heroTitle"
                required
                value={state.heroTitle}
                onChange={(e) => setState({ ...state, heroTitle: e.target.value })}
                className="admin-input"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Sous-titre (Hero Subtitle)</span>
              <textarea
                name="heroSubtitle"
                rows={3}
                value={state.heroSubtitle}
                onChange={(e) => setState({ ...state, heroSubtitle: e.target.value })}
                className="admin-input"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Ligne d&apos;accroche preuve (proofLine)</span>
              <input
                type="text"
                value={state.content.hero.proofLine}
                onChange={(e) => updateContentSubfield("hero", "proofLine", e.target.value)}
                className="admin-input"
                placeholder="ex: +250 séances réalisées cette saison à St Barth"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Note sous CTA (microNote)</span>
              <input
                name="microNote"
                value={state.microNote}
                onChange={(e) => setState({ ...state, microNote: e.target.value })}
                className="admin-input"
                placeholder="ex: Grégory vous répond personnellement sous 2h"
              />
            </label>

            <div className="admin-form__grid">
              <label className="admin-field">
                <span className="admin-field__label">Texte CTA Principal</span>
                <input
                  name="primaryCta"
                  value={state.primaryCta}
                  onChange={(e) => setState({ ...state, primaryCta: e.target.value })}
                  className="admin-input"
                  placeholder="Écrire sur WhatsApp"
                />
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Texte CTA Secondaire</span>
                <input
                  name="secondaryCta"
                  value={state.secondaryCta}
                  onChange={(e) => setState({ ...state, secondaryCta: e.target.value })}
                  className="admin-input"
                  placeholder="Réserver ma séance"
                />
              </label>
            </div>

            <div className="admin-form__grid" style={{ marginTop: "16px" }}>
              <div className="admin-field">
                <span className="admin-field__label">Image Hero</span>
                <select
                  name="heroImageId"
                  value={state.heroImageId}
                  onChange={(e) => setState({ ...state, heroImageId: e.target.value })}
                  className="admin-input"
                >
                  <option value="">— Aucune image —</option>
                  {mediaAssets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.originalName} ({m.filename})
                    </option>
                  ))}
                </select>
                {selectedHeroImage && (
                  <div style={{ marginTop: "8px" }}>
                    <img
                      src={selectedHeroImage.url}
                      alt="Aperçu Hero"
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--admin-border)" }}
                    />
                  </div>
                )}
              </div>

              <div className="admin-field">
                <span className="admin-field__label">Image OpenGraph</span>
                <select
                  name="ogImageId"
                  value={state.ogImageId}
                  onChange={(e) => setState({ ...state, ogImageId: e.target.value })}
                  className="admin-input"
                >
                  <option value="">— Par défaut du site —</option>
                  {mediaAssets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.originalName} ({m.filename})
                    </option>
                  ))}
                </select>
                {selectedOgImage && (
                  <div style={{ marginTop: "8px" }}>
                    <img
                      src={selectedOgImage.url}
                      alt="Aperçu OG"
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--admin-border)" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <label className="admin-field">
              <span className="admin-field__label">Description textuelle alternative de l&apos;image (imageAlt)</span>
              <input
                type="text"
                value={state.content.hero.imageAlt}
                onChange={(e) => updateContentSubfield("hero", "imageAlt", e.target.value)}
                className="admin-input"
                placeholder="ex: Séance de reboutement à Saint-Barthélemy"
              />
            </label>
          </div>
        )}

        {/* ── 3. WHATSAPP & CRM ────────────────────────────────────────────── */}
        {activeTab === "cta" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="admin-form__grid">
              <label className="admin-field">
                <span className="admin-field__label">Canal WhatsApp lié *</span>
                <select
                  name="whatsappChannelId"
                  required
                  value={state.whatsappChannelId}
                  onChange={(e) => setState({ ...state, whatsappChannelId: e.target.value })}
                  className="admin-input"
                >
                  <option value="">— Sélectionner —</option>
                  {filteredChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.phoneE164})
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Profil Tracking</span>
                <select
                  name="trackingProfileId"
                  value={state.trackingProfileId}
                  onChange={(e) => setState({ ...state, trackingProfileId: e.target.value })}
                  className="admin-input"
                >
                  <option value="">— Aucun tracking custom —</option>
                  {filteredTracking.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} (Meta ID: {t.metaPixelId || "non"})
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Règle de routage CRM</span>
                <select
                  name="crmRoutingRuleId"
                  value={state.crmRoutingRuleId}
                  onChange={(e) => setState({ ...state, crmRoutingRuleId: e.target.value })}
                  className="admin-input"
                >
                  <option value="">— Pas de routage custom —</option>
                  {filteredCrmRules.map((r) => (
                    <option key={r.id} value={r.id}>
                      Priority #{r.priority ?? "—"} ({r.leadSegment || "tous"})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <h3 style={{ margin: "10px 0 5px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "4px" }}>
              Sticky CTA (Mobile)
            </h3>
            <div className="admin-form__grid">
              <label className="admin-field">
                <span className="admin-field__label">Bouton WhatsApp</span>
                <input
                  type="text"
                  value={state.content.stickyCta.whatsapp}
                  onChange={(e) => updateContentSubfield("stickyCta", "whatsapp", e.target.value)}
                  className="admin-input"
                  placeholder="WhatsApp"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Bouton Réservation</span>
                <input
                  type="text"
                  value={state.content.stickyCta.booking}
                  onChange={(e) => updateContentSubfield("stickyCta", "booking", e.target.value)}
                  className="admin-input"
                  placeholder="Réserver"
                />
              </label>
            </div>

            <h3 style={{ margin: "10px 0 5px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "4px" }}>
              Libellés des sections
            </h3>
            <div className="admin-form__grid">
              <label className="admin-field">
                <span className="admin-field__label">Sourcil Process</span>
                <input
                  type="text"
                  value={state.content.sections.processEyebrow}
                  onChange={(e) => updateContentSubfield("sections", "processEyebrow", e.target.value)}
                  className="admin-input"
                  placeholder="Processus"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Sourcil FAQ</span>
                <input
                  type="text"
                  value={state.content.sections.faqEyebrow}
                  onChange={(e) => updateContentSubfield("sections", "faqEyebrow", e.target.value)}
                  className="admin-input"
                  placeholder="FAQ"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Titre FAQ</span>
                <input
                  type="text"
                  value={state.content.sections.faqTitle}
                  onChange={(e) => updateContentSubfield("sections", "faqTitle", e.target.value)}
                  className="admin-input"
                  placeholder="Questions fréquentes"
                />
              </label>
            </div>

            <h3 style={{ margin: "10px 0 5px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "4px" }}>
              Textes préremplis WhatsApp (Overrides)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label className="admin-field">
                <span className="admin-field__label">Message par défaut</span>
                <input
                  type="text"
                  value={state.content.whatsappMessages.default}
                  onChange={(e) => updateContentSubfield("whatsappMessages", "default", e.target.value)}
                  className="admin-input"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Intention Réservation (book_intent)</span>
                <input
                  type="text"
                  value={state.content.whatsappMessages.book_intent}
                  onChange={(e) => updateContentSubfield("whatsappMessages", "book_intent", e.target.value)}
                  className="admin-input"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Intention Plus d&apos;infos (more_info_intent)</span>
                <input
                  type="text"
                  value={state.content.whatsappMessages.more_info_intent}
                  onChange={(e) => updateContentSubfield("whatsappMessages", "more_info_intent", e.target.value)}
                  className="admin-input"
                />
              </label>
            </div>
          </div>
        )}

        {/* ── 4. OFFER & CHIPS ────────────────────────────────────────────── */}
        {activeTab === "offer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Pain Chips */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
                Boutons de tension (Pain Chips)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                {state.painChips.map((chip, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={chip}
                      onChange={(e) => {
                        const next = [...state.painChips];
                        next[idx] = e.target.value;
                        setState({ ...state, painChips: next });
                      }}
                      className="admin-input"
                      placeholder="ex: Dos bloqué ou tensions lombaires"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (idx === 0) return;
                        const next = [...state.painChips];
                        const tmp = next[idx];
                        next[idx] = next[idx - 1];
                        next[idx - 1] = tmp;
                        setState({ ...state, painChips: next });
                      }}
                      className="admin-btn admin-btn--secondary"
                      style={{ padding: "4px 8px" }}
                      disabled={idx === 0}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (idx === state.painChips.length - 1) return;
                        const next = [...state.painChips];
                        const tmp = next[idx];
                        next[idx] = next[idx + 1];
                        next[idx + 1] = tmp;
                        setState({ ...state, painChips: next });
                      }}
                      className="admin-btn admin-btn--secondary"
                      style={{ padding: "4px 8px" }}
                      disabled={idx === state.painChips.length - 1}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = state.painChips.filter((_, i) => i !== idx);
                        setState({ ...state, painChips: next });
                      }}
                      className="admin-btn admin-btn--danger"
                      style={{ padding: "4px 8px" }}
                    >
                      Suppr.
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setState({ ...state, painChips: [...state.painChips, ""] })}
                className="admin-btn admin-btn--secondary"
              >
                + Ajouter une tension
              </button>
            </div>

            {/* Offer Block */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
                Bloc d&apos;offre de session
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label className="admin-field">
                  <span className="admin-field__label">Titre alternatif du bloc</span>
                  <input
                    type="text"
                    value={state.content.offerBlock.title}
                    onChange={(e) => updateContentSubfield("offerBlock", "title", e.target.value)}
                    className="admin-input"
                    placeholder="ex: Votre session de reboutement sur-mesure"
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Ligne promotionnelle (launchRateLine)</span>
                  <input
                    type="text"
                    value={state.content.offerBlock.launchRateLine}
                    onChange={(e) => updateContentSubfield("offerBlock", "launchRateLine", e.target.value)}
                    className="admin-input"
                    placeholder="ex: Tarif spécial de lancement"
                  />
                </label>

                {/* Bullets de l'offre */}
                <div>
                  <span className="admin-field__label" style={{ marginBottom: "6px", display: "block" }}>
                    Points forts de l&apos;offre (bullets)
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {(state.content.offerBlock.bullets || []).map((bullet: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const next = [...(state.content.offerBlock.bullets || [])];
                            next[idx] = e.target.value;
                            updateContentSubfield("offerBlock", "bullets", next);
                          }}
                          className="admin-input"
                          placeholder="ex: Relâchement en profondeur"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            const next = [...(state.content.offerBlock.bullets || [])];
                            const tmp = next[idx];
                            next[idx] = next[idx - 1];
                            next[idx - 1] = tmp;
                            updateContentSubfield("offerBlock", "bullets", next);
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === 0}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const bullets = state.content.offerBlock.bullets || [];
                            if (idx === bullets.length - 1) return;
                            const next = [...bullets];
                            const tmp = next[idx];
                            next[idx] = next[idx + 1];
                            next[idx + 1] = tmp;
                            updateContentSubfield("offerBlock", "bullets", next);
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === (state.content.offerBlock.bullets || []).length - 1}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (state.content.offerBlock.bullets || []).filter((_: unknown, i: number) => i !== idx);
                            updateContentSubfield("offerBlock", "bullets", next);
                          }}
                          className="admin-btn admin-btn--danger"
                          style={{ padding: "4px 8px" }}
                        >
                          Suppr.
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(state.content.offerBlock.bullets || []), ""];
                      updateContentSubfield("offerBlock", "bullets", next);
                    }}
                    className="admin-btn admin-btn--secondary"
                  >
                    + Ajouter un point fort
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. DIFFERENCE & BADGES ──────────────────────────────────────── */}
        {activeTab === "difference" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Différence */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
                Bloc Différence (Méthode vs Classique)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label className="admin-field">
                  <span className="admin-field__label">Titre du bloc</span>
                  <input
                    type="text"
                    value={state.content.difference.title}
                    onChange={(e) => updateContentSubfield("difference", "title", e.target.value)}
                    className="admin-input"
                    placeholder="La différence avec un massage classique"
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Corps de texte</span>
                  <textarea
                    rows={4}
                    value={state.content.difference.body}
                    onChange={(e) => updateContentSubfield("difference", "body", e.target.value)}
                    className="admin-input"
                  />
                </label>

                {/* Points clés de différence */}
                <div>
                  <span className="admin-field__label" style={{ marginBottom: "6px", display: "block" }}>
                    Points clés de différence
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {(state.content.difference.points || []).map((point: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const next = [...(state.content.difference.points || [])];
                            next[idx] = e.target.value;
                            updateContentSubfield("difference", "points", next);
                          }}
                          className="admin-input"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            const next = [...(state.content.difference.points || [])];
                            const tmp = next[idx];
                            next[idx] = next[idx - 1];
                            next[idx - 1] = tmp;
                            updateContentSubfield("difference", "points", next);
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === 0}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const pts = state.content.difference.points || [];
                            if (idx === pts.length - 1) return;
                            const next = [...pts];
                            const tmp = next[idx];
                            next[idx] = next[idx + 1];
                            next[idx + 1] = tmp;
                            updateContentSubfield("difference", "points", next);
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === (state.content.difference.points || []).length - 1}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (state.content.difference.points || []).filter((_: unknown, i: number) => i !== idx);
                            updateContentSubfield("difference", "points", next);
                          }}
                          className="admin-btn admin-btn--danger"
                          style={{ padding: "4px 8px" }}
                        >
                          Suppr.
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(state.content.difference.points || []), ""];
                      updateContentSubfield("difference", "points", next);
                    }}
                    className="admin-btn admin-btn--secondary"
                  >
                    + Ajouter un point clé
                  </button>
                </div>

                <label className="admin-field">
                  <span className="admin-field__label">Alt de l&apos;image de différence</span>
                  <input
                    type="text"
                    value={state.content.difference.imageAlt}
                    onChange={(e) => updateContentSubfield("difference", "imageAlt", e.target.value)}
                    className="admin-input"
                  />
                </label>
              </div>
            </div>

            {/* Proof Badges */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
                Badges de preuve (Proof Badges)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "12px" }}>
                {state.proofBadges.map((badge, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={badge.value}
                      onChange={(e) => {
                        const next = [...state.proofBadges];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setState({ ...state, proofBadges: next });
                      }}
                      className="admin-input"
                      placeholder="Valeur: ex: 15 ans"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={badge.label}
                      onChange={(e) => {
                        const next = [...state.proofBadges];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setState({ ...state, proofBadges: next });
                      }}
                      className="admin-input"
                      placeholder="Libellé: ex: d'expérience"
                      style={{ flex: 2 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (idx === 0) return;
                        const next = [...state.proofBadges];
                        const tmp = next[idx];
                        next[idx] = next[idx - 1];
                        next[idx - 1] = tmp;
                        setState({ ...state, proofBadges: next });
                      }}
                      className="admin-btn admin-btn--secondary"
                      style={{ padding: "4px 8px" }}
                      disabled={idx === 0}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (idx === state.proofBadges.length - 1) return;
                        const next = [...state.proofBadges];
                        const tmp = next[idx];
                        next[idx] = next[idx + 1];
                        next[idx + 1] = tmp;
                        setState({ ...state, proofBadges: next });
                      }}
                      className="admin-btn admin-btn--secondary"
                      style={{ padding: "4px 8px" }}
                      disabled={idx === state.proofBadges.length - 1}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = state.proofBadges.filter((_, i) => i !== idx);
                        setState({ ...state, proofBadges: next });
                      }}
                      className="admin-btn admin-btn--danger"
                      style={{ padding: "4px 8px" }}
                    >
                      Suppr.
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setState({ ...state, proofBadges: [...state.proofBadges, { value: "", label: "" }] })}
                className="admin-btn admin-btn--secondary"
              >
                + Ajouter un badge de preuve
              </button>
            </div>
          </div>
        )}

        {/* ── 6. PROCESS & FAQ ────────────────────────────────────────────── */}
        {activeTab === "process" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Process */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
                Étapes de déroulement (Process Steps)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label className="admin-field">
                  <span className="admin-field__label">Titre de la section de déroulement</span>
                  <input
                    type="text"
                    value={state.content.processTitle}
                    onChange={(e) => updateContentDirect("processTitle", e.target.value)}
                    className="admin-input"
                    placeholder="Comment se passe une séance ?"
                  />
                </label>

                <div>
                  <span className="admin-field__label" style={{ marginBottom: "6px", display: "block" }}>
                    Étapes successives
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {state.processSteps.map((step, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => {
                            const next = [...state.processSteps];
                            next[idx] = e.target.value;
                            setState({ ...state, processSteps: next });
                          }}
                          className="admin-input"
                          placeholder={`Étape ${idx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            const next = [...state.processSteps];
                            const tmp = next[idx];
                            next[idx] = next[idx - 1];
                            next[idx - 1] = tmp;
                            setState({ ...state, processSteps: next });
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === 0}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === state.processSteps.length - 1) return;
                            const next = [...state.processSteps];
                            const tmp = next[idx];
                            next[idx] = next[idx + 1];
                            next[idx + 1] = tmp;
                            setState({ ...state, processSteps: next });
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === state.processSteps.length - 1}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = state.processSteps.filter((_, i) => i !== idx);
                            setState({ ...state, processSteps: next });
                          }}
                          className="admin-btn admin-btn--danger"
                          style={{ padding: "4px 8px" }}
                        >
                          Suppr.
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setState({ ...state, processSteps: [...state.processSteps, ""] })}
                    className="admin-btn admin-btn--secondary"
                  >
                    + Ajouter une étape
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
                Questions fréquentes (FAQ)
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--admin-amber)",
                  marginBottom: "12px",
                  padding: "8px",
                  border: "1px solid var(--admin-border)",
                  borderRadius: "4px",
                  background: "rgba(245,158,11,0.05)",
                }}
              >
                ⚠️ <strong>Note de conformité :</strong> Pour être conforme, il est fortement recommandé d&apos;inclure une
                première question mentionnant explicitement que cette méthode ne remplace pas une consultation ou un avis médical.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "12px" }}>
                {state.faq.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid var(--admin-border)",
                      borderRadius: "6px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      background: "rgba(255,255,255,0.01)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "600", fontSize: "13px" }}>Question #{idx + 1}</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            const next = [...state.faq];
                            const tmp = next[idx];
                            next[idx] = next[idx - 1];
                            next[idx - 1] = tmp;
                            setState({ ...state, faq: next });
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "2px 6px", fontSize: "11px" }}
                          disabled={idx === 0}
                        >
                          ▲ Monter
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx === state.faq.length - 1) return;
                            const next = [...state.faq];
                            const tmp = next[idx];
                            next[idx] = next[idx + 1];
                            next[idx + 1] = tmp;
                            setState({ ...state, faq: next });
                          }}
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "2px 6px", fontSize: "11px" }}
                          disabled={idx === state.faq.length - 1}
                        >
                          ▼ Descendre
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = state.faq.filter((_, i) => i !== idx);
                            setState({ ...state, faq: next });
                          }}
                          className="admin-btn admin-btn--danger"
                          style={{ padding: "2px 6px", fontSize: "11px" }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => {
                        const next = [...state.faq];
                        next[idx] = { ...next[idx], question: e.target.value };
                        setState({ ...state, faq: next });
                      }}
                      className="admin-input"
                      placeholder="La question"
                    />

                    <textarea
                      rows={3}
                      value={item.answer}
                      onChange={(e) => {
                        const next = [...state.faq];
                        next[idx] = { ...next[idx], answer: e.target.value };
                        setState({ ...state, faq: next });
                      }}
                      className="admin-input"
                      placeholder="La réponse"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setState({ ...state, faq: [...state.faq, { question: "", answer: "" }] })}
                className="admin-btn admin-btn--secondary"
              >
                + Ajouter une question à la FAQ
              </button>
            </div>
          </div>
        )}

        {/* ── 7. TESTIMONIAL ──────────────────────────────────────────────── */}
        {activeTab === "testimonial" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label className="admin-field">
              <span className="admin-field__label">URL de l&apos;affiche vidéo (posterSrc)</span>
              <input
                type="text"
                value={state.content.testimonial.posterSrc}
                onChange={(e) => updateContentSubfield("testimonial", "posterSrc", e.target.value)}
                className="admin-input"
                placeholder="ex: /practice-01.webp ou URL d'une image uploadée"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">URL de la vidéo (videoSrc)</span>
              <input
                type="text"
                value={state.content.testimonial.videoSrc}
                onChange={(e) => updateContentSubfield("testimonial", "videoSrc", e.target.value)}
                className="admin-input"
                placeholder="ex: /practice-01.mp4"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">CTA sur témoignage</span>
              <input
                type="text"
                value={state.content.testimonial.cta}
                onChange={(e) => updateContentSubfield("testimonial", "cta", e.target.value)}
                className="admin-input"
                placeholder="ex: Écouter les avis sur WhatsApp"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">ID de témoignage lié</span>
              <input
                type="text"
                value={state.content.testimonial.testimonialId}
                onChange={(e) => updateContentSubfield("testimonial", "testimonialId", e.target.value)}
                className="admin-input"
                placeholder="ex: clx123abc456"
              />
            </label>
          </div>
        )}

        {/* ── 8. SEO & COMPLIANCE ─────────────────────────────────────────── */}
        {activeTab === "seo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label className="admin-field">
              <span className="admin-field__label">Titre SEO (seoTitle)</span>
              <input
                name="seoTitle"
                value={state.seoTitle}
                onChange={(e) => setState({ ...state, seoTitle: e.target.value })}
                className="admin-input"
                placeholder="ex: Séance privée de reboutement à Saint-Barthélemy"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Meta Description (metaDescription)</span>
              <textarea
                name="metaDescription"
                rows={3}
                value={state.metaDescription}
                onChange={(e) => setState({ ...state, metaDescription: e.target.value })}
                className="admin-input"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">URL Canonique customisée (canonical)</span>
              <input
                name="canonical"
                value={state.canonical}
                onChange={(e) => setState({ ...state, canonical: e.target.value })}
                className="admin-input"
                placeholder="ex: https://methodetms.com/fr/st-barth"
              />
            </label>

            <div className="admin-form__grid">
              <label className="admin-field">
                <span className="admin-field__label">Groupe Hreflang (hreflangGroupId)</span>
                <input
                  name="hreflangGroupId"
                  value={state.hreflangGroupId}
                  onChange={(e) => setState({ ...state, hreflangGroupId: e.target.value })}
                  className="admin-input"
                  placeholder="ex: private-sessions-stbarth"
                />
              </label>

              <label className="admin-field admin-field--checkbox" style={{ alignSelf: "center", marginTop: "24px" }}>
                <input
                  name="xDefault"
                  type="checkbox"
                  checked={state.xDefault}
                  onChange={(e) => setState({ ...state, xDefault: e.target.checked })}
                />
                <span style={{ marginLeft: "8px" }}>x-default (Page par défaut de ce groupe linguistique)</span>
              </label>
            </div>

            <label className="admin-field">
              <span className="admin-field__label">Texte de conformité juridique (complianceText)</span>
              <textarea
                name="complianceText"
                rows={3}
                value={state.complianceText}
                onChange={(e) => setState({ ...state, complianceText: e.target.value })}
                className="admin-input"
              />
            </label>

            <div style={{ display: "flex", gap: "20px", marginTop: "10px", flexWrap: "wrap" }}>
              <label className="admin-field admin-field--checkbox">
                <input
                  name="noindex"
                  type="checkbox"
                  checked={state.noindex}
                  onChange={(e) => setState({ ...state, noindex: e.target.checked })}
                />
                <span style={{ marginLeft: "8px" }}>noindex (Bloque l&apos;indexation de cette page par les moteurs)</span>
              </label>

              <label className="admin-field admin-field--checkbox">
                <input
                  name="publishOverride"
                  type="checkbox"
                  checked={state.publishOverride}
                  onChange={(e) => setState({ ...state, publishOverride: e.target.checked })}
                />
                <span style={{ marginLeft: "8px" }}>Force-publish (Autoriser la publication en LIVE malgré noindex/readiness score)</span>
              </label>
            </div>
          </div>
        )}

        {/* ── 9. ADVANCED JSON ────────────────────────────────────────────── */}
        {activeTab === "json" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: 0 }}>
              Editez le JSON brut pour le débogage. Toute modification syntaxiquement valide sera immédiatement reportée dans l&apos;éditeur.
            </p>
            <textarea
              rows={20}
              value={rawJson}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              className="admin-input"
              style={{ fontFamily: "monospace", fontSize: "12px", background: "black", color: "#85e885" }}
            />
            {jsonError && (
              <div style={{ fontSize: "13px", color: "red", fontWeight: "600" }}>
                ❌ Erreur de syntaxe JSON : {jsonError}
              </div>
            )}
          </div>
        )}

        {/* Pied de formulaire actions */}
        <div className="admin-form__actions" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--admin-border)", display: "flex", gap: "12px" }}>
          <button type="submit" className="admin-btn admin-btn--primary">
            {isEdit ? "Enregistrer les modifications" : "Créer la landing page"}
          </button>
          <Link href="/admin/landings" className="admin-btn admin-btn--secondary" style={{ textDecoration: "none" }}>
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
