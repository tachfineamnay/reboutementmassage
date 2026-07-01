"use client";

import React, { useState } from "react";
import { upsertExperimentAction, archiveExperimentAction } from "@/lib/growth/actions";
import Link from "next/link";

interface TestimonialOption {
  id: string;
  displayName: string;
}

interface LandingOption {
  id: string;
  heroTitle: string;
}

interface ExperimentEditorProps {
  experiment?: any;
  landings: LandingOption[];
  testimonials: TestimonialOption[];
}

export default function ExperimentEditor({
  experiment,
  landings,
  testimonials,
}: ExperimentEditorProps) {
  const isEdit = !!experiment?.id;

  const [state, setState] = useState(() => {
    const e = experiment || {};
    return {
      id: e.id || "",
      landingPageId: e.landingPageId || landings[0]?.id || "",
      name: e.name || "",
      hypothesis: e.hypothesis || "",
      status: e.status || "DRAFT",
      primaryMetric: e.primaryMetric || "whatsapp_clicks",
      startAt: e.startAt ? new Date(e.startAt).toISOString().slice(0, 16) : "",
      endAt: e.endAt ? new Date(e.endAt).toISOString().slice(0, 16) : "",
      notes: e.notes || "",
    };
  });

  const [variants, setVariants] = useState<any[]>(() => {
    const vars = experiment?.variants || [];
    return vars.map((v: any) => ({
      id: v.id || "",
      name: v.name || "",
      trafficSplit: v.trafficSplit || 50,
      heroTitle: v.heroTitle || "",
      heroSubtitle: v.heroSubtitle || "",
      primaryCta: v.primaryCta || "",
      testimonialId: v.testimonialId || "",
      contentOverrides: v.contentOverrides ? JSON.stringify(v.contentOverrides, null, 2) : "{}",
      errors: "",
    }));
  });

  const totalSplit = variants.reduce((sum, v) => sum + Number(v.trafficSplit || 0), 0);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: "",
        name: `Variante ${String.fromCharCode(65 + variants.length)}`,
        trafficSplit: 50,
        heroTitle: "",
        heroSubtitle: "",
        primaryCta: "",
        testimonialId: "",
        contentOverrides: "{}",
        errors: "",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, val: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: val };
    setVariants(next);
  };

  // Convert raw string contentOverrides back to object for submission
  const getSubmissionVariants = () => {
    return variants.map((v) => {
      let overrides = {};
      try {
        overrides = JSON.parse(v.contentOverrides);
      } catch {}
      return {
        id: v.id || undefined,
        name: v.name,
        trafficSplit: Number(v.trafficSplit || 0),
        heroTitle: v.heroTitle || null,
        heroSubtitle: v.heroSubtitle || null,
        primaryCta: v.primaryCta || null,
        testimonialId: v.testimonialId || null,
        contentOverrides: overrides,
      };
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--admin-border)", paddingBottom: "16px" }}>
        <h1 className="admin-page__title" style={{ margin: 0 }}>
          {isEdit ? `Expérience: ${state.name}` : "Nouvelle expérience A/B"}
        </h1>
        {isEdit && (
          <span className={`badge ${state.status === "RUNNING" ? "badge--published" : "badge--draft"}`}>
            {state.status}
          </span>
        )}
      </div>

      <form action={upsertExperimentAction} className="admin-form">
        <input type="hidden" name="id" value={state.id} />
        <input type="hidden" name="variants" value={JSON.stringify(getSubmissionVariants())} />

        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Landing Page ciblée *</span>
            <select
              name="landingPageId"
              required
              value={state.landingPageId}
              onChange={(e) => setState({ ...state, landingPageId: e.target.value })}
              className="admin-input"
            >
              {landings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.heroTitle}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Nom de l'expérience *</span>
            <input
              name="name"
              required
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              className="admin-input"
              placeholder="ex: Test Hero Title St-Barth"
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Métrique principale de succès</span>
            <select
              name="primaryMetric"
              value={state.primaryMetric}
              onChange={(e) => setState({ ...state, primaryMetric: e.target.value })}
              className="admin-input"
            >
              <option value="whatsapp_clicks">Clics WhatsApp</option>
              <option value="form_submits">Formulaires envoyés</option>
              <option value="booking_clicks">Clics Calendrier (Booking)</option>
              <option value="video_plays">Lectures Vidéo</option>
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select
              name="status"
              value={state.status}
              onChange={(e) => setState({ ...state, status: e.target.value })}
              className="admin-input"
            >
              <option value="DRAFT">Brouillon (DRAFT)</option>
              <option value="RUNNING">En cours (RUNNING)</option>
              <option value="PAUSED">En pause (PAUSED)</option>
              <option value="COMPLETED">Terminé (COMPLETED)</option>
              <option value="ARCHIVED">Archivé (ARCHIVED)</option>
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Date de début</span>
            <input
              name="startAt"
              type="datetime-local"
              value={state.startAt}
              onChange={(e) => setState({ ...state, startAt: e.target.value })}
              className="admin-input"
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Date de fin</span>
            <input
              name="endAt"
              type="datetime-local"
              value={state.endAt}
              onChange={(e) => setState({ ...state, endAt: e.target.value })}
              className="admin-input"
            />
          </label>
        </div>

        <label className="admin-field">
          <span className="admin-field__label">Hypothèse du test</span>
          <textarea
            name="hypothesis"
            rows={2}
            value={state.hypothesis}
            onChange={(e) => setState({ ...state, hypothesis: e.target.value })}
            className="admin-input"
            placeholder="ex: Un titre focalisé sur le soulagement immédiat convertira 15% de plus."
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Notes additionnelles</span>
          <textarea
            name="notes"
            rows={2}
            value={state.notes}
            onChange={(e) => setState({ ...state, notes: e.target.value })}
            className="admin-input"
          />
        </label>

        {/* Variantes d'expériences */}
        <section style={{ marginTop: "24px", borderTop: "1px solid var(--admin-border)", paddingTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", margin: 0 }}>Variantes du test A/B ({variants.length})</h2>
            <button type="button" onClick={addVariant} className="admin-btn admin-btn--secondary">
              + Ajouter une variante
            </button>
          </div>

          {totalSplit !== 100 && (
            <div style={{ padding: "8px 12px", border: "1px solid #f59e0b", borderRadius: "6px", background: "rgba(245,158,11,0.05)", color: "#f59e0b", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
              ⚠️ Attention : Le total des splits de trafic est de {totalSplit}% au lieu de 100%. Veuillez ajuster les poids.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {variants.map((v, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid var(--admin-border)",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "8px" }}>
                  <span style={{ fontWeight: "bold" }}>Variante #{idx + 1}</span>
                  <button type="button" onClick={() => removeVariant(idx)} className="admin-btn admin-btn--danger" style={{ padding: "2px 8px", fontSize: "11px" }}>
                    Supprimer cette variante
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <label className="admin-field">
                    <span className="admin-field__label">Nom de la variante *</span>
                    <input
                      type="text"
                      required
                      value={v.name}
                      onChange={(e) => updateVariant(idx, "name", e.target.value)}
                      className="admin-input"
                      placeholder="ex: Titre Direct"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field__label">Split trafic (%) *</span>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={v.trafficSplit}
                      onChange={(e) => updateVariant(idx, "trafficSplit", e.target.value)}
                      className="admin-input"
                    />
                  </label>
                </div>

                <h4 style={{ fontSize: "13px", margin: "12px 0 6px 0", color: "var(--admin-text-muted)" }}>
                  Surcharges de contenu (Overrides)
                </h4>
                <div className="admin-form__grid" style={{ marginBottom: "12px" }}>
                  <label className="admin-field">
                    <span className="admin-field__label">Override Hero Title</span>
                    <input
                      type="text"
                      value={v.heroTitle}
                      onChange={(e) => updateVariant(idx, "heroTitle", e.target.value)}
                      className="admin-input"
                      placeholder="Laisser vide pour garder l'original"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field__label">Override CTA Principal</span>
                    <input
                      type="text"
                      value={v.primaryCta}
                      onChange={(e) => updateVariant(idx, "primaryCta", e.target.value)}
                      className="admin-input"
                    />
                  </label>
                </div>

                <label className="admin-field" style={{ marginBottom: "12px" }}>
                  <span className="admin-field__label">Override Hero Subtitle</span>
                  <textarea
                    rows={2}
                    value={v.heroSubtitle}
                    onChange={(e) => updateVariant(idx, "heroSubtitle", e.target.value)}
                    className="admin-input"
                  />
                </label>

                <div className="admin-form__grid" style={{ marginBottom: "12px" }}>
                  <label className="admin-field">
                    <span className="admin-field__label">Override Témoignage lié</span>
                    <select
                      value={v.testimonialId}
                      onChange={(e) => updateVariant(idx, "testimonialId", e.target.value)}
                      className="admin-input"
                    >
                      <option value="">— Aucun override —</option>
                      {testimonials.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="admin-field">
                  <span className="admin-field__label">Surcharges complexes JSON (contentOverrides)</span>
                  <textarea
                    rows={4}
                    value={v.contentOverrides}
                    onChange={(e) => {
                      updateVariant(idx, "contentOverrides", e.target.value);
                      try {
                        JSON.parse(e.target.value);
                        updateVariant(idx, "errors", "");
                      } catch (err: any) {
                        updateVariant(idx, "errors", err.message);
                      }
                    }}
                    className="admin-input"
                    style={{ fontFamily: "monospace", fontSize: "12px", background: "black", color: "#85e885" }}
                  />
                  {v.errors && (
                    <span style={{ color: "red", fontSize: "11px", display: "block", marginTop: "4px" }}>
                      Erreur JSON : {v.errors}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-form__actions" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button type="submit" className="admin-btn admin-btn--primary">
            {isEdit ? "Enregistrer l'expérience" : "Créer l'expérience"}
          </button>
          <Link href="/admin/experiments" className="admin-btn admin-btn--secondary" style={{ textDecoration: "none" }}>
            Annuler
          </Link>
        </div>
      </form>

      {isEdit && state.status !== "ARCHIVED" && (
        <form action={archiveExperimentAction} style={{ marginTop: "12px" }}>
          <input type="hidden" name="id" value={state.id} />
          <button type="submit" className="admin-btn admin-btn--danger" style={{ width: "100%" }}>
            Archiver l'expérience A/B 🗑️
          </button>
        </form>
      )}
    </div>
  );
}
