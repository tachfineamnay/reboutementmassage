"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { slugify } from "@/lib/utils";
import ImageUploader from "./ImageUploader";
import SeoPanel from "./SeoPanel";
import ArticleStatusBadge from "./ArticleStatusBadge";
import type {
  EvidenceNotes,
  FaqItem,
  GeoChecklistItem,
} from "@/lib/geo";
import type { TiptapContent, ContentStats } from "./TiptapEditor";

// ─── Chargement dynamique de l'éditeur (pas de SSR) ─────────────────────────
const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="tiptap-skeleton">
      <div className="tiptap-skeleton__toolbar" />
      <div className="tiptap-skeleton__body" />
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "FR" | "EN" | "ES";
type ArticleStatus = "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";

type ArticleData = {
  id: string;
  locale: Locale;
  title: string;
  slug: string;
  excerpt: string;
  status: ArticleStatus;
  publishedAt: string | null;
  updatedAt: string;
  coverImageId: string;
  coverImageUrl: string;
  coverImageAltFr: string;
  coverImageAltEn: string;
  coverImageAltEs: string;
  content: {
    editorJson: TiptapContent;
    plainText: string;
    html: string;
    wordCount: number;
    readingTime: number;
  };
  seo: {
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    noindex: boolean;
    score: number;
    llmReadabilityScore: number;
    atomicAnswerPresent: boolean;
    answerCoverageScore: number;
    geoChecklist: GeoChecklistItem[];
    primaryQuestion: string;
    answerIntent: string;
    targetAudience: string;
    geoLocation: string;
    businessGoal: string;
    entityTargets: string[];
    faqItems: FaqItem[];
    evidenceNotes: EvidenceNotes;
    aeoScore: number;
    geoScore: number;
    eeatScore: number;
  };
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─── Transitions de statut ────────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<ArticleStatus, { label: string; next: ArticleStatus }[]> = {
  DRAFT: [
    { label: "Marquer comme prêt", next: "READY" },
    { label: "Publier", next: "PUBLISHED" },
  ],
  READY: [
    { label: "Publier", next: "PUBLISHED" },
    { label: "Remettre en brouillon", next: "DRAFT" },
  ],
  PUBLISHED: [
    { label: "Archiver", next: "ARCHIVED" },
    { label: "Remettre en brouillon", next: "DRAFT" },
  ],
  ARCHIVED: [{ label: "Remettre en brouillon", next: "DRAFT" }],
};

// ─── Composant ───────────────────────────────────────────────────────────────

export default function ArticleEditor({
  article,
  googleMetrics,
}: {
  article: ArticleData;
  googleMetrics: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState(article);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "google" | "settings">("content");
  const [isDirty, setIsDirty] = useState(false);

  // GA4
  const [ga4Data, setGa4Data] = useState<{
    sessions: number;
    storyViewCount: number;
    storyCtaClickCount: number;
    leadSubmittedCount: number;
  } | null>(null);
  const [ga4Loading, setGa4Loading] = useState(false);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [ga4Configured, setGa4Configured] = useState<boolean>(true);

  // URL Inspection
  const [inspectionResult, setInspectionResult] = useState<{
    indexStatus: string;
    verdict: string;
    coverageState: string;
    lastCrawlTime: string | null;
    userCanonical: string | null;
    googleCanonical: string | null;
  } | null>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [inspectionConfigured, setInspectionConfigured] = useState<boolean>(true);

  // PageSpeed
  const [pageSpeedResult, setPageSpeedResult] = useState<{
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
    lcp: string;
    cls: string;
    auditedAt: string;
  } | null>(null);
  const [pageSpeedLoading, setPageSpeedLoading] = useState(false);
  const [pageSpeedError, setPageSpeedError] = useState<string | null>(null);
  const [pageSpeedConfigured, setPageSpeedConfigured] = useState<boolean>(true);

  const fetchGa4Data = useCallback(async () => {
    setGa4Loading(true);
    setGa4Error(null);
    try {
      const res = await fetch(`/api/admin/google/ga4/page?articleId=${article.id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement des données GA4.");
      }
      if (data.status === "non_configure") {
        setGa4Configured(false);
      } else {
        setGa4Data(data.result);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur de connexion.";
      setGa4Error(errMsg);
    } finally {
      setGa4Loading(false);
    }
  }, [article.id]);

  const handleInspectUrl = async () => {
    setInspectionLoading(true);
    setInspectionError(null);
    try {
      const res = await fetch("/api/admin/google/url-inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inspection de l'URL.");
      }
      if (data.status === "non_configure") {
        setInspectionConfigured(false);
      } else {
        setInspectionResult(data.result);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la requête.";
      setInspectionError(errMsg);
    } finally {
      setInspectionLoading(false);
    }
  };

  const handleRunPageSpeed = async () => {
    setPageSpeedLoading(true);
    setPageSpeedError(null);
    try {
      const res = await fetch("/api/admin/google/pagespeed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'audit PageSpeed.");
      }
      if (data.status === "non_configure") {
        setPageSpeedConfigured(false);
      } else {
        setPageSpeedResult(data.result);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la requête.";
      setPageSpeedError(errMsg);
    } finally {
      setPageSpeedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "google" && !ga4Data && !ga4Loading) {
      const timer = setTimeout(() => {
        fetchGa4Data();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, ga4Data, ga4Loading, fetchGa4Data]);

  // Ref pour l'autosave (évite closure stale)
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);
  const isDirtyRef = useRef(isDirty);
  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  // ─── Helpers état ────────────────────────────────────────────────────────

  function set<K extends keyof ArticleData>(key: K, value: ArticleData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  function setSeo<K extends keyof ArticleData["seo"]>(key: K, value: ArticleData["seo"][K]) {
    setData((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
    setIsDirty(true);
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    set("title", title);
    if (!slugEdited && data.status === "DRAFT") {
      set("slug", slugify(title));
    }
  }

  function setCoverAlt(field: "altFr" | "altEn" | "altEs", value: string) {
    const keyMap = {
      altFr: "coverImageAltFr",
      altEn: "coverImageAltEn",
      altEs: "coverImageAltEs",
    } as const;
    set(keyMap[field], value);
  }

  // ─── Callback Tiptap onChange ─────────────────────────────────────────────

  const handleEditorChange = useCallback(
    ({
      editorJson,
      html,
      plainText,
      stats,
    }: {
      editorJson: TiptapContent;
      html: string;
      plainText: string;
      stats: ContentStats;
    }) => {
      setData((prev) => ({
        ...prev,
        content: {
          editorJson,
          html,
          plainText,
          wordCount: stats.wordCount,
          readingTime: stats.readingTime,
        },
      }));
      setIsDirty(true);
    },
    []
  );

  // ─── Sauvegarde ──────────────────────────────────────────────────────────

  const save = useCallback(
    async (overrideStatus?: ArticleStatus) => {
      const current = dataRef.current;
      setSaveStatus("saving");
      setSaveMessage("");

      try {
        const status = overrideStatus ?? current.status;

        // 1. PATCH article
        const articleRes = await fetch(`/api/admin/articles/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: current.title.trim(),
            slug: current.slug.trim(),
            excerpt: current.excerpt.trim() || null,
            status,
            coverImageId: current.coverImageId || null,
            publishedAt:
              status === "PUBLISHED" && !current.publishedAt
                ? new Date().toISOString()
                : current.publishedAt,
          }),
        });

        if (!articleRes.ok) {
          const body = await articleRes.json().catch(() => ({}));
          throw new Error(body.error ?? "Erreur sauvegarde article.");
        }

        const saved = await articleRes.json();
        setData((prev) => ({
          ...prev,
          status: saved.status,
          updatedAt: saved.updatedAt,
          ...(saved.publishedAt ? { publishedAt: saved.publishedAt } : {}),
        }));

        // 2. PUT content (JSON + HTML + plainText + stats)
        await fetch(`/api/admin/articles/${current.id}/content`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            editorJson: current.content.editorJson,
            html: current.content.html || null,
            plainText: current.content.plainText || null,
            wordCount: current.content.wordCount,
            readingTime: current.content.readingTime,
          }),
        });

        // 3. PUT SEO
        const seoRes = await fetch(`/api/admin/articles/${current.id}/seo`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seoTitle: current.seo.seoTitle || null,
            metaDescription: current.seo.metaDescription || null,
            focusKeyword: current.seo.focusKeyword || null,
            noindex: current.seo.noindex,
            primaryQuestion: current.seo.primaryQuestion || null,
            answerIntent: current.seo.answerIntent || null,
            targetAudience: current.seo.targetAudience || null,
            geoLocation: current.seo.geoLocation || null,
            businessGoal: current.seo.businessGoal || null,
            entityTargets: current.seo.entityTargets,
            faqItems: current.seo.faqItems,
            evidenceNotes: current.seo.evidenceNotes,
          }),
        });

        if (!seoRes.ok) {
          const body = await seoRes.json().catch(() => ({}));
          throw new Error(body.error ?? "Erreur sauvegarde SEO.");
        }

        const savedSeo = await seoRes.json();
        setData((prev) => ({
          ...prev,
          seo: {
            ...prev.seo,
            score: typeof savedSeo.score === "number" ? savedSeo.score : prev.seo.score,
            llmReadabilityScore:
              typeof savedSeo.llmReadabilityScore === "number"
                ? savedSeo.llmReadabilityScore
                : prev.seo.llmReadabilityScore,
            atomicAnswerPresent:
              typeof savedSeo.atomicAnswerPresent === "boolean"
                ? savedSeo.atomicAnswerPresent
                : prev.seo.atomicAnswerPresent,
            answerCoverageScore:
              typeof savedSeo.answerCoverageScore === "number"
                ? savedSeo.answerCoverageScore
                : prev.seo.answerCoverageScore,
            geoChecklist: Array.isArray(savedSeo.geoChecklist)
              ? (savedSeo.geoChecklist as GeoChecklistItem[])
              : prev.seo.geoChecklist,
            aeoScore:
              typeof savedSeo.aeoScore === "number"
                ? savedSeo.aeoScore
                : prev.seo.aeoScore,
            geoScore:
              typeof savedSeo.geoScore === "number"
                ? savedSeo.geoScore
                : prev.seo.geoScore,
            eeatScore:
              typeof savedSeo.eeatScore === "number"
                ? savedSeo.eeatScore
                : prev.seo.eeatScore,
          },
        }));

        // 4. PATCH cover image alt texts if coverImageId exists
        if (current.coverImageId) {
          await fetch(`/api/admin/uploads/${current.coverImageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              altFr: current.coverImageAltFr || "",
              altEn: current.coverImageAltEn || "",
              altEs: current.coverImageAltEs || "",
            }),
          });
        }

        setSaveStatus("saved");
        setSaveMessage(
          `Enregistré à ${new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(new Date())}`
        );
        setIsDirty(false);
        router.refresh();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch (e) {
        setSaveStatus("error");
        setSaveMessage(e instanceof Error ? e.message : "Erreur inconnue.");
      }
    },
    [router]
  );

  // ─── Autosave toutes les 5 secondes si modifié ───────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current && saveStatus !== "saving") {
        save();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [save, saveStatus]);

  // ─── Actions de statut ────────────────────────────────────────────────────

  async function handleStatusAction(next: ArticleStatus) {
    if (next === "PUBLISHED") {
      startTransition(async () => {
        const res = await fetch(`/api/admin/articles/${data.id}/publish`, { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setSaveStatus("error");
          setSaveMessage(body.error ?? "Erreur lors de la publication.");
          return;
        }
        const updated = await res.json();
        setData((prev) => ({ ...prev, status: updated.status, publishedAt: updated.publishedAt }));
        setSaveStatus("saved");
        setSaveMessage("Article publié ✓");
        setTimeout(() => setSaveStatus("idle"), 3000);
        router.refresh();
      });
    } else if (next === "ARCHIVED") {
      startTransition(async () => {
        const res = await fetch(`/api/admin/articles/${data.id}/archive`, { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setSaveStatus("error");
          setSaveMessage(body.error ?? "Erreur lors de l'archivage.");
          return;
        }
        setData((prev) => ({ ...prev, status: "ARCHIVED" }));
        setSaveStatus("saved");
        setSaveMessage("Article archivé.");
        setTimeout(() => setSaveStatus("idle"), 3000);
        router.refresh();
      });
    } else {
      await save(next);
    }
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="article-editor">
      {/* ── Header ── */}
      <div className="article-editor__header">
        <div className="article-editor__title-row">
          <input
            type="text"
            className="article-editor__title-input"
            value={data.title}
            onChange={handleTitleChange}
            placeholder="Titre de l'article"
            maxLength={200}
          />
          <ArticleStatusBadge status={data.status} />
        </div>

        <div className="article-editor__toolbar">
          {/* Stats + dernière modif */}
          <div className="article-editor__meta">
            {data.content.wordCount > 0 && (
              <span className="article-editor__stat">
                {data.content.wordCount} mots · {data.content.readingTime} min
              </span>
            )}
            {data.updatedAt && (
              <span className="article-editor__stat">
                Modifié{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(data.updatedAt))}
              </span>
            )}
            {isDirty && saveStatus === "idle" && (
              <span className="article-editor__stat article-editor__stat--dirty">
                ● Modifications non sauvegardées
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="article-editor__actions">
            {saveStatus !== "idle" && (
              <span
                className={`save-status save-status--${saveStatus}`}
                role="status"
                aria-live="polite"
              >
                {saveStatus === "saving" && (
                  <><span className="login-spinner" aria-hidden="true" /> Sauvegarde…</>
                )}
                {saveStatus === "saved" && <>✓ {saveMessage}</>}
                {saveStatus === "error" && <>⚠ {saveMessage}</>}
              </span>
            )}

            {STATUS_TRANSITIONS[data.status].map(({ label, next }) => (
              <button
                key={next}
                type="button"
                className={`admin-btn ${
                  next === "PUBLISHED"
                    ? "admin-btn--success"
                    : next === "ARCHIVED"
                    ? "admin-btn--danger"
                    : "admin-btn--ghost"
                }`}
                onClick={() => handleStatusAction(next)}
                disabled={isPending || saveStatus === "saving"}
              >
                {label}
              </button>
            ))}

            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => startTransition(() => save())}
              disabled={isPending || saveStatus === "saving"}
            >
              {saveStatus === "saving" ? (
                <><span className="login-spinner" aria-hidden="true" /> Sauvegarde…</>
              ) : (
                "Sauvegarder"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="article-editor__layout">
        {/* Colonne principale */}
        <div className="article-editor__main">
          {/* Onglets */}
          <div className="editor-tabs">
            {(["content", "seo", "google", "settings"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`editor-tab ${activeTab === tab ? "editor-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "content"
                  ? "📝 Contenu"
                  : tab === "seo"
                  ? "🔍 SEO"
                  : tab === "google"
                  ? "📈 Performances"
                  : "⚙ Paramètres"}
              </button>
            ))}
          </div>

          {/* ── Onglet Contenu ── */}
          {activeTab === "content" && (
            <div className="editor-panel">
              {/* Extrait */}
              <div className="admin-field">
                <label className="admin-label" htmlFor="ae-excerpt">
                  Extrait
                  <span className="admin-label__optional">visible dans la liste</span>
                </label>
                <textarea
                  id="ae-excerpt"
                  className="admin-input"
                  rows={2}
                  maxLength={500}
                  placeholder="Bref résumé visible dans la liste et les réseaux sociaux…"
                  value={data.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                />
                <span
                  className={`admin-hint ${data.excerpt.length > 480 ? "admin-hint--warn" : ""}`}
                >
                  {data.excerpt.length}/500
                </span>
              </div>

              {/* Éditeur Tiptap */}
              <div className="admin-field">
                <label className="admin-label">
                  Corps de l&apos;article
                </label>
                <TiptapEditor
                  initialContent={data.content.editorJson}
                  onChange={handleEditorChange}
                  placeholder="Commencez à rédiger votre article…"
                  locale={article.locale}
                />
              </div>
            </div>
          )}

          {/* ── Onglet SEO ── */}
          {activeTab === "seo" && (
            <div className="editor-panel">
              <SeoPanel
                seoTitle={data.seo.seoTitle}
                seoDescription={data.seo.metaDescription}
                focusKeyword={data.seo.focusKeyword}
                noindex={data.seo.noindex}
                slug={data.slug}
                locale={article.locale}
                title={data.title}
                plainText={data.content.plainText}
                html={data.content.html}
                editorJson={data.content.editorJson}
                seoScore={data.seo.score}
                primaryQuestion={data.seo.primaryQuestion}
                answerIntent={data.seo.answerIntent}
                targetAudience={data.seo.targetAudience}
                geoLocation={data.seo.geoLocation}
                businessGoal={data.seo.businessGoal}
                entityTargets={data.seo.entityTargets}
                faqItems={data.seo.faqItems}
                evidenceNotes={data.seo.evidenceNotes}
                onChange={(field, value) => {
                  if (field === "seoTitle") setSeo("seoTitle", value as string);
                  else if (field === "seoDescription") setSeo("metaDescription", value as string);
                  else if (field === "focusKeyword") setSeo("focusKeyword", value as string);
                  else if (field === "noindex") setSeo("noindex", value as boolean);
                  else if (field === "primaryQuestion") setSeo("primaryQuestion", value as string);
                  else if (field === "answerIntent") setSeo("answerIntent", value as string);
                  else if (field === "targetAudience") setSeo("targetAudience", value as string);
                  else if (field === "geoLocation") setSeo("geoLocation", value as string);
                  else if (field === "businessGoal") setSeo("businessGoal", value as string);
                  else if (field === "entityTargets") setSeo("entityTargets", value as string[]);
                  else if (field === "faqItems") setSeo("faqItems", value as FaqItem[]);
                  else if (field === "evidenceNotes") setSeo("evidenceNotes", value as EvidenceNotes);
                }}
              />
            </div>
          )}

          {/* ── Onglet Performances Google ── */}
          {activeTab === "google" && (
            <div className="editor-panel">
              {/* Alerte si configuration manquante */}
              {(!ga4Configured || !inspectionConfigured || !pageSpeedConfigured) && (
                <div style={{ padding: "12px 16px", borderRadius: "6px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "#d97706", fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <strong>⚠️ Mode dégradé / Intégration Google partielle</strong>
                  <span>Certaines variables d&apos;environnement Google sont absentes ou incorrectes. Assurez-vous d&apos;avoir configuré tous les identifiants OAuth, Property ID et clé d&apos;API dans votre fichier de configuration.</span>
                </div>
              )}

              {/* 1. Bloc Search Console */}
              <div className="admin-panel" style={{ margin: 0, padding: "20px" }}>
                <h3 className="admin-panel__title" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-muted)", marginBottom: "16px" }}>
                  Métrique de visibilité Search Console (28 derniers jours)
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
                  <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>Impressions</span>
                    <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                      {googleMetrics ? googleMetrics.impressions.toLocaleString() : 0}
                    </span>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>Clics</span>
                    <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                      {googleMetrics ? googleMetrics.clicks.toLocaleString() : 0}
                    </span>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>CTR moyen</span>
                    <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                      {googleMetrics ? googleMetrics.ctr.toFixed(2) : "0.00"} %
                    </span>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>Position moyenne</span>
                    <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                      {googleMetrics ? googleMetrics.position.toFixed(1) : "0.0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Bloc GA4 */}
              <div className="admin-panel" style={{ margin: 0, padding: "20px" }}>
                <h3 className="admin-panel__title" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-muted)", marginBottom: "16px" }}>
                  Audience et Conversions GA4 (30 derniers jours)
                </h3>
                {!ga4Configured ? (
                  <p style={{ fontSize: "13px", color: "var(--admin-muted)", fontStyle: "italic", margin: 0 }}>
                    API GA4 non configurée (identifiant de propriété ou variables OAuth manquants).
                  </p>
                ) : ga4Loading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--admin-muted)" }}>
                    <span className="login-spinner" /> Chargement des métriques Google Analytics...
                  </div>
                ) : ga4Error ? (
                  <p style={{ fontSize: "13px", color: "#f87171", margin: 0 }}>
                    ⚠️ {ga4Error}
                  </p>
                ) : ga4Data ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
                    <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                      <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>Sessions organiques</span>
                      <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                        {ga4Data.sessions.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                      <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>Lectures (story_view)</span>
                      <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                        {ga4Data.storyViewCount.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                      <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>Clics CTA (story_cta_click)</span>
                      <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                        {ga4Data.storyCtaClickCount.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ padding: "12px", border: "1px solid var(--admin-border)", borderRadius: "6px" }}>
                      <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>Leads (lead_submitted)</span>
                      <span style={{ fontSize: "18px", fontWeight: 600, display: "block", marginTop: "4px" }}>
                        {ga4Data.leadSubmittedCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "var(--admin-muted)", margin: 0 }}>Aucune donnée disponible pour cette période.</p>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
                {/* 3. Inspection d'URL */}
                <div className="admin-panel" style={{ margin: 0, padding: "20px" }}>
                  <h3 className="admin-panel__title" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-muted)", marginBottom: "16px" }}>
                    Inspection d&apos;URL Google (Temps réel)
                  </h3>
                  
                  {!inspectionConfigured ? (
                    <p style={{ fontSize: "13px", color: "var(--admin-muted)", fontStyle: "italic", margin: 0 }}>
                      URL Inspection API non configurée.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={handleInspectUrl}
                        disabled={inspectionLoading}
                        style={{ alignSelf: "flex-start" }}
                      >
                        {inspectionLoading ? "⌛ Inspection..." : "🔍 Inspecter l'URL"}
                      </button>

                      {inspectionError && (
                        <span style={{ fontSize: "12px", color: "#f87171" }}>⚠️ {inspectionError}</span>
                      )}

                      {inspectionResult && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--admin-border)", paddingTop: "12px", fontSize: "13px" }}>
                          <div>
                            <span style={{ color: "var(--admin-muted)" }}>Verdict : </span>
                            <span style={{ fontWeight: 600, color: inspectionResult.indexStatus === "INDEXED" ? "var(--admin-green)" : "#fbbf24" }}>
                              {inspectionResult.verdict}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "var(--admin-muted)" }}>Dernier crawl : </span>
                            <span>
                              {inspectionResult.lastCrawlTime ? new Date(inspectionResult.lastCrawlTime).toLocaleString("fr-FR") : "Jamais ou inconnu"}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "var(--admin-muted)" }}>Canonical déclaré : </span>
                            <span style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "11px" }}>{inspectionResult.userCanonical || "Aucun"}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--admin-muted)" }}>Canonical Google : </span>
                            <span style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "11px" }}>{inspectionResult.googleCanonical || "Aucun"}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--admin-muted)" }}>Statut d&apos;indexation : </span>
                            <span>{inspectionResult.coverageState}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. PageSpeed Insights */}
                <div className="admin-panel" style={{ margin: 0, padding: "20px" }}>
                  <h3 className="admin-panel__title" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-muted)", marginBottom: "16px" }}>
                    Audit Mobile PageSpeed Insights
                  </h3>
                  
                  {!pageSpeedConfigured ? (
                    <p style={{ fontSize: "13px", color: "var(--admin-muted)", fontStyle: "italic", margin: 0 }}>
                      Clé API PageSpeed non configurée.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={handleRunPageSpeed}
                        disabled={pageSpeedLoading}
                        style={{ alignSelf: "flex-start" }}
                      >
                        {pageSpeedLoading ? "⌛ Audit en cours..." : "⚡ Lancer PageSpeed"}
                      </button>

                      {pageSpeedError && (
                        <span style={{ fontSize: "12px", color: "#f87171" }}>⚠️ {pageSpeedError}</span>
                      )}

                      {pageSpeedResult && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--admin-border)", paddingTop: "12px", fontSize: "13px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center" }}>
                            <div style={{ padding: "8px", border: "1px solid var(--admin-border)", borderRadius: "4px" }}>
                              <span style={{ fontSize: "10px", color: "var(--admin-muted)", display: "block" }}>Performance</span>
                              <span style={{ fontSize: "18px", fontWeight: 700, color: pageSpeedResult.performanceScore >= 90 ? "var(--admin-green)" : pageSpeedResult.performanceScore >= 50 ? "#fbbf24" : "#f87171" }}>
                                {pageSpeedResult.performanceScore}
                              </span>
                            </div>
                            <div style={{ padding: "8px", border: "1px solid var(--admin-border)", borderRadius: "4px" }}>
                              <span style={{ fontSize: "10px", color: "var(--admin-muted)", display: "block" }}>SEO</span>
                              <span style={{ fontSize: "18px", fontWeight: 700, color: pageSpeedResult.seoScore >= 90 ? "var(--admin-green)" : pageSpeedResult.seoScore >= 50 ? "#fbbf24" : "#f87171" }}>
                                {pageSpeedResult.seoScore}
                              </span>
                            </div>
                            <div style={{ padding: "8px", border: "1px solid var(--admin-border)", borderRadius: "4px" }}>
                              <span style={{ fontSize: "10px", color: "var(--admin-muted)", display: "block" }}>Accessibilité</span>
                              <span style={{ fontSize: "18px", fontWeight: 700, color: pageSpeedResult.accessibilityScore >= 90 ? "var(--admin-green)" : pageSpeedResult.accessibilityScore >= 50 ? "#fbbf24" : "#f87171" }}>
                                {pageSpeedResult.accessibilityScore}
                              </span>
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
                            <span style={{ color: "var(--admin-muted)" }}>Largest Contentful Paint (LCP)</span>
                            <span style={{ fontWeight: 600 }}>{pageSpeedResult.lcp}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--admin-muted)" }}>Cumulative Layout Shift (CLS)</span>
                            <span style={{ fontWeight: 600 }}>{pageSpeedResult.cls}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Onglet Paramètres ── */}
          {activeTab === "settings" && (
            <div className="editor-panel">
              {/* Slug */}
              <div className="admin-field">
                <label className="admin-label" htmlFor="ae-slug">
                  Slug URL
                </label>
                <div className="admin-input-group">
                  <span className="admin-input-prefix">
                    /{article.locale.toLowerCase()}/stories/
                  </span>
                  <input
                    id="ae-slug"
                    type="text"
                    className="admin-input"
                    value={data.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      set(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }}
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    maxLength={200}
                  />
                </div>
                {data.status === "PUBLISHED" && (
                  <span className="admin-hint admin-hint--warn">
                    ⚠ Modifier le slug d&apos;un article publié casse les liens existants.
                  </span>
                )}
              </div>

              {/* Langue */}
              <div className="admin-field">
                <label className="admin-label">Langue</label>
                <span className="badge badge--locale">{article.locale}</span>
                <span className="admin-hint">
                  Utilisez le sélecteur « Langue et URL publique » au-dessus de l&apos;éditeur.
                </span>
              </div>

              {/* Dates */}
              <div className="admin-field">
                <label className="admin-label">Informations</label>
                <dl className="settings-list">
                  <div className="settings-row">
                    <dt>Dernière modification</dt>
                    <dd>
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "long",
                        timeStyle: "short",
                      }).format(new Date(data.updatedAt))}
                    </dd>
                  </div>
                  {data.publishedAt && (
                    <div className="settings-row">
                      <dt>Publié le</dt>
                      <dd>
                        {new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "long",
                          timeStyle: "short",
                        }).format(new Date(data.publishedAt))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Danger zone */}
              <div className="admin-field danger-zone">
                <h4 className="danger-zone__title">Zone de danger</h4>
                <p className="danger-zone__desc">La suppression est irréversible.</p>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={async () => {
                    if (
                      !confirm(
                        `Supprimer "${data.title}" ? Cette action est irréversible.`
                      )
                    )
                      return;
                    await fetch(`/api/admin/articles/${data.id}`, {
                      method: "DELETE",
                    });
                    router.push("/admin/articles");
                  }}
                >
                  Supprimer cet article
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="article-editor__sidebar">
          {/* Publication */}
          <div className="admin-panel">
            <h3 className="admin-panel__title">Publication</h3>
            <div className="pub-status">
              <ArticleStatusBadge status={data.status} />
              {data.publishedAt && (
                <p className="pub-date">
                  Publié le{" "}
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
                    new Date(data.publishedAt)
                  )}
                </p>
              )}
            </div>
            <div className="pub-actions">
              {STATUS_TRANSITIONS[data.status].map(({ label, next }) => (
                <button
                  key={next}
                  type="button"
                  className={`admin-btn admin-btn--sm admin-btn--full ${
                    next === "PUBLISHED"
                      ? "admin-btn--success"
                      : next === "ARCHIVED"
                      ? "admin-btn--danger"
                      : "admin-btn--ghost"
                  }`}
                  onClick={() => handleStatusAction(next)}
                  disabled={isPending || saveStatus === "saving"}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Image de couverture */}
          <div className="admin-panel">
            <h3 className="admin-panel__title">Image de couverture</h3>
            <ImageUploader
              currentImage={data.coverImageUrl || null}
              onUpload={(asset) => {
                set("coverImageId", asset.id);
                set("coverImageUrl", asset.url);
                if (asset.id === "") {
                  set("coverImageAltFr", "");
                  set("coverImageAltEn", "");
                  set("coverImageAltEs", "");
                }
              }}
            />
            {data.coverImageId && (
              <div className="cover-alt-fields" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label className="admin-label" htmlFor="cover-alt-fr" style={{ fontSize: "12px" }}>Texte alt (FR)</label>
                  <input
                    id="cover-alt-fr"
                    type="text"
                    className="admin-input"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={data.coverImageAltFr || ""}
                    onChange={(e) => setCoverAlt("altFr", e.target.value)}
                    placeholder="Description de l'image en français"
                  />
                </div>
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label className="admin-label" htmlFor="cover-alt-en" style={{ fontSize: "12px" }}>Texte alt (EN)</label>
                  <input
                    id="cover-alt-en"
                    type="text"
                    className="admin-input"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={data.coverImageAltEn || ""}
                    onChange={(e) => setCoverAlt("altEn", e.target.value)}
                    placeholder="Description de l'image en anglais"
                  />
                </div>
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label className="admin-label" htmlFor="cover-alt-es" style={{ fontSize: "12px" }}>Texte alt (ES)</label>
                  <input
                    id="cover-alt-es"
                    type="text"
                    className="admin-input"
                    style={{ padding: "6px 8px", fontSize: "13px" }}
                    value={data.coverImageAltEs || ""}
                    onChange={(e) => setCoverAlt("altEs", e.target.value)}
                    placeholder="Description de l'image en espagnol"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
