"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { slugify } from "@/lib/utils";
import ArticleStatusBadge from "./ArticleStatusBadge";
import ArticleAIAssistant from "./studio/ArticleAIAssistant";
import ArticleInspector from "./studio/ArticleInspector";
import ArticleStudioStepper from "./studio/ArticleStudioStepper";
import type { EvidenceNotes, FaqItem, GeoChecklistItem } from "@/lib/geo";
import type {
  ArticleData,
  ArticlePatch,
  ArticleStatus,
  GoogleMetrics,
  SaveStatus,
  StudioMobileTab,
  TiptapChangePayload,
  TiptapContentCommand,
} from "./studio/ArticleStudioTypes";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="tiptap-skeleton">
      <div className="tiptap-skeleton__toolbar" />
      <div className="tiptap-skeleton__body" />
    </div>
  ),
});

const STATUS_TRANSITIONS: Record<ArticleStatus, { label: string; next: ArticleStatus }[]> = {
  DRAFT: [
    { label: "Marquer prêt", next: "READY" },
    { label: "Publier", next: "PUBLISHED" },
  ],
  READY: [
    { label: "Publier", next: "PUBLISHED" },
    { label: "Brouillon", next: "DRAFT" },
  ],
  PUBLISHED: [
    { label: "Archiver", next: "ARCHIVED" },
    { label: "Brouillon", next: "DRAFT" },
  ],
  ARCHIVED: [{ label: "Brouillon", next: "DRAFT" }],
};

const MOBILE_TABS: { id: StudioMobileTab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "article", label: "Article" },
  { id: "seo", label: "SEO" },
  { id: "image", label: "Image" },
  { id: "langues", label: "Langues" },
  { id: "publish", label: "Publish" },
];

type SeoPanelValue = string | boolean | string[] | FaqItem[] | EvidenceNotes;

function commandId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ArticleEditor({
  article,
  googleMetrics,
  customJsonLd,
}: {
  article: ArticleData;
  googleMetrics: GoogleMetrics;
  customJsonLd: unknown;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState(article);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<StudioMobileTab>("article");
  const [contentCommand, setContentCommand] = useState<TiptapContentCommand | null>(null);

  const [ga4Data, setGa4Data] = useState<{
    sessions: number;
    storyViewCount: number;
    storyCtaClickCount: number;
    leadSubmittedCount: number;
  } | null>(null);
  const [ga4Loading, setGa4Loading] = useState(false);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [ga4Configured, setGa4Configured] = useState(true);

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
  const [inspectionConfigured, setInspectionConfigured] = useState(true);

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
  const [pageSpeedConfigured, setPageSpeedConfigured] = useState(true);

  const dataRef = useRef(data);
  const isDirtyRef = useRef(isDirty);
  const ga4RequestedRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  function setArticleField<K extends keyof ArticleData>(key: K, value: ArticleData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  function setSeo<K extends keyof ArticleData["seo"]>(key: K, value: ArticleData["seo"][K]) {
    setData((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
    setIsDirty(true);
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const title = event.target.value;
    setArticleField("title", title);
    if (!slugEdited && data.status === "DRAFT") {
      setArticleField("slug", slugify(title));
    }
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setArticleField(
      "slug",
      event.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }

  function setCoverAlt(field: "altFr" | "altEn" | "altEs", value: string) {
    const keyMap = {
      altFr: "coverImageAltFr",
      altEn: "coverImageAltEn",
      altEs: "coverImageAltEs",
    } as const;
    setArticleField(keyMap[field], value);
  }

  function handleSeoChange(field: string, value: SeoPanelValue) {
    const key = field === "seoDescription" ? "metaDescription" : field;
    if (key in data.seo) {
      setSeo(key as keyof ArticleData["seo"], value as never);
    }
  }

  const handleEditorChange = useCallback(
    ({ editorJson, html, plainText, stats }: TiptapChangePayload) => {
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

  const fetchGa4Data = useCallback(async () => {
    setGa4Loading(true);
    setGa4Error(null);
    try {
      const res = await fetch(`/api/admin/google/ga4/page?articleId=${article.id}`);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Erreur lors du chargement des données GA4.");
      }
      if (body.status === "non_configure") {
        setGa4Configured(false);
      } else {
        setGa4Data(body.result);
      }
    } catch (err) {
      setGa4Error(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setGa4Loading(false);
    }
  }, [article.id]);

  useEffect(() => {
    if (ga4RequestedRef.current) return;
    ga4RequestedRef.current = true;
    void fetchGa4Data();
  }, [fetchGa4Data]);

  const save = useCallback(
    async (overrideStatus?: ArticleStatus) => {
      const current = dataRef.current;
      setSaveStatus("saving");
      setSaveMessage("");

      try {
        const status = overrideStatus ?? current.status;

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

        const contentRes = await fetch(`/api/admin/articles/${current.id}/content`, {
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

        if (!contentRes.ok) {
          const body = await contentRes.json().catch(() => ({}));
          throw new Error(body.error ?? "Erreur sauvegarde contenu.");
        }

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
              typeof savedSeo.aeoScore === "number" ? savedSeo.aeoScore : prev.seo.aeoScore,
            geoScore:
              typeof savedSeo.geoScore === "number" ? savedSeo.geoScore : prev.seo.geoScore,
            eeatScore:
              typeof savedSeo.eeatScore === "number" ? savedSeo.eeatScore : prev.seo.eeatScore,
          },
        }));

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
          `Enregistré à ${new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(
            new Date()
          )}`
        );
        setIsDirty(false);
        router.refresh();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch (err) {
        setSaveStatus("error");
        setSaveMessage(err instanceof Error ? err.message : "Erreur inconnue.");
      }
    },
    [router]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current && saveStatus !== "saving") {
        void save();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [save, saveStatus]);

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
        setData((prev) => ({
          ...prev,
          status: updated.status,
          publishedAt: updated.publishedAt,
          updatedAt: updated.updatedAt ?? prev.updatedAt,
        }));
        setSaveStatus("saved");
        setSaveMessage("Article publié.");
        setTimeout(() => setSaveStatus("idle"), 3000);
        router.refresh();
      });
      return;
    }

    if (next === "ARCHIVED") {
      startTransition(async () => {
        const res = await fetch(`/api/admin/articles/${data.id}/archive`, { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setSaveStatus("error");
          setSaveMessage(body.error ?? "Erreur lors de l'archivage.");
          return;
        }
        const updated = await res.json().catch(() => ({}));
        setData((prev) => ({
          ...prev,
          status: "ARCHIVED",
          updatedAt: updated.updatedAt ?? prev.updatedAt,
        }));
        setSaveStatus("saved");
        setSaveMessage("Article archivé.");
        setTimeout(() => setSaveStatus("idle"), 3000);
        router.refresh();
      });
      return;
    }

    await save(next);
  }

  async function handleInspectUrl() {
    setInspectionLoading(true);
    setInspectionError(null);
    try {
      const res = await fetch("/api/admin/google/url-inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Erreur lors de l'inspection de l'URL.");
      }
      if (body.status === "non_configure") {
        setInspectionConfigured(false);
      } else {
        setInspectionResult(body.result);
      }
    } catch (err) {
      setInspectionError(err instanceof Error ? err.message : "Erreur lors de la requête.");
    } finally {
      setInspectionLoading(false);
    }
  }

  async function handleRunPageSpeed() {
    setPageSpeedLoading(true);
    setPageSpeedError(null);
    try {
      const res = await fetch("/api/admin/google/pagespeed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Erreur lors de l'audit PageSpeed.");
      }
      if (body.status === "non_configure") {
        setPageSpeedConfigured(false);
      } else {
        setPageSpeedResult(body.result);
      }
    } catch (err) {
      setPageSpeedError(err instanceof Error ? err.message : "Erreur lors de la requête.");
    } finally {
      setPageSpeedLoading(false);
    }
  }

  function applyArticlePatch(patch: ArticlePatch) {
    setData((prev) => ({
      ...prev,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
      ...(patch.altFr !== undefined ? { coverImageAltFr: patch.altFr } : {}),
      ...(patch.altEn !== undefined ? { coverImageAltEn: patch.altEn } : {}),
      ...(patch.altEs !== undefined ? { coverImageAltEs: patch.altEs } : {}),
      seo: {
        ...prev.seo,
        ...(patch.seoTitle !== undefined ? { seoTitle: patch.seoTitle } : {}),
        ...(patch.metaDescription !== undefined
          ? { metaDescription: patch.metaDescription }
          : {}),
        ...(patch.focusKeyword !== undefined ? { focusKeyword: patch.focusKeyword } : {}),
        ...(patch.primaryQuestion !== undefined
          ? { primaryQuestion: patch.primaryQuestion }
          : {}),
        ...(patch.answerIntent !== undefined ? { answerIntent: patch.answerIntent } : {}),
        ...(patch.targetAudience !== undefined ? { targetAudience: patch.targetAudience } : {}),
        ...(patch.geoLocation !== undefined ? { geoLocation: patch.geoLocation } : {}),
        ...(patch.businessGoal !== undefined ? { businessGoal: patch.businessGoal } : {}),
        ...(patch.entityTargets !== undefined ? { entityTargets: patch.entityTargets } : {}),
        ...(patch.faqItems !== undefined ? { faqItems: patch.faqItems } : {}),
        ...(patch.evidenceNotes !== undefined ? { evidenceNotes: patch.evidenceNotes } : {}),
      },
    }));

    if (patch.contentHtml) {
      setContentCommand({ id: commandId(), html: patch.contentHtml, mode: "replace" });
    }
    setIsDirty(true);
  }

  function insertHtml(html: string, mode: "insert" | "replace") {
    setContentCommand({ id: commandId(), html, mode });
    setIsDirty(true);
  }

  function handleCoverUpload(asset: { id: string; url: string; filename: string }) {
    setArticleField("coverImageId", asset.id);
    setArticleField("coverImageUrl", asset.url);
    if (asset.id === "") {
      setArticleField("coverImageAltFr", "");
      setArticleField("coverImageAltEn", "");
      setArticleField("coverImageAltEs", "");
    }
  }

  async function handleDeleteArticle() {
    if (!confirm(`Supprimer "${data.title}" ? Cette action est irréversible.`)) return;
    await fetch(`/api/admin/articles/${data.id}`, { method: "DELETE" });
    router.push("/admin/articles");
  }

  const formattedUpdatedAt = data.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(data.updatedAt))
    : "";

  return (
    <div className="article-studio">
      <header className="article-studio__header">
        <div className="article-studio__breadcrumb">
          <Link href="/admin/articles">Articles</Link>
          <span>/</span>
          <span>Studio</span>
        </div>

        <div className="article-studio__title-row">
          <input
            type="text"
            className="article-editor__title-input article-studio__title-input"
            value={data.title}
            onChange={handleTitleChange}
            placeholder="Titre de l'article"
            maxLength={200}
          />
          <ArticleStatusBadge status={data.status} />
        </div>

        <div className="article-studio__toolbar">
          <div className="article-editor__meta">
            <span className="article-editor__stat">{data.locale}</span>
            <span className="article-editor__stat">
              {data.content.wordCount} mots · {data.content.readingTime || 0} min
            </span>
            {formattedUpdatedAt && (
              <span className="article-editor__stat">Modifié {formattedUpdatedAt}</span>
            )}
            {isDirty && saveStatus === "idle" && (
              <span className="article-editor__stat article-editor__stat--dirty">
                Modifications non sauvegardées
              </span>
            )}
            {saveStatus !== "idle" && (
              <span className={`save-status save-status--${saveStatus}`} role="status">
                {saveStatus === "saving" && "Sauvegarde..."}
                {saveStatus === "saved" && saveMessage}
                {saveStatus === "error" && saveMessage}
              </span>
            )}
          </div>

          <div className="article-editor__actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => save()}
              disabled={saveStatus === "saving"}
            >
              Sauvegarder
            </button>
            {STATUS_TRANSITIONS[data.status].map(({ label, next }) => (
              <button
                key={next}
                type="button"
                className={`admin-btn admin-btn--ghost ${
                  next === "PUBLISHED" ? "admin-btn--success" : ""
                } ${next === "ARCHIVED" ? "admin-btn--danger" : ""}`}
                onClick={() => handleStatusAction(next)}
                disabled={isPending || saveStatus === "saving"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <ArticleStudioStepper article={data} />

      <nav className="article-studio-mobile-tabs" aria-label="Sections Studio">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeMobileTab === tab.id ? "article-studio-mobile-tabs__active" : ""}
            onClick={() => setActiveMobileTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="article-studio__layout">
        <div
          className={`article-studio__pane article-studio__pane--chat ${
            activeMobileTab === "chat" ? "article-studio__pane--active" : ""
          }`}
        >
          <ArticleAIAssistant
            article={data}
            onApplyPatch={applyArticlePatch}
            onInsertHtml={insertHtml}
          />
        </div>

        <main
          className={`article-studio__pane article-studio__canvas ${
            activeMobileTab === "article" ? "article-studio__pane--active" : ""
          }`}
        >
          <div className="article-studio-canvas__meta">
            <div className="admin-field">
              <label className="admin-label" htmlFor="article-studio-excerpt">
                Extrait
              </label>
              <textarea
                id="article-studio-excerpt"
                className="admin-input"
                rows={3}
                maxLength={500}
                value={data.excerpt}
                onChange={(event) => setArticleField("excerpt", event.target.value)}
                placeholder="Résumé court pour la liste, les partages et la promesse éditoriale."
              />
              <span className="admin-hint">{data.excerpt.length}/500</span>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="article-studio-slug">
                Slug URL
              </label>
              <div className="admin-input-group">
                <span className="admin-input-prefix">/{data.locale.toLowerCase()}/stories/</span>
                <input
                  id="article-studio-slug"
                  type="text"
                  className="admin-input"
                  value={data.slug}
                  onChange={handleSlugChange}
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  maxLength={200}
                />
              </div>
              {data.status === "PUBLISHED" && (
                <span className="admin-hint admin-hint--warn">
                  Modifier le slug d&apos;un article publié casse les liens existants.
                </span>
              )}
            </div>
          </div>

          <TiptapEditor
            initialContent={data.content.editorJson}
            onChange={handleEditorChange}
            placeholder="Rédigez l'article ici. L'assistant propose, ce canvas valide."
            locale={data.locale}
            contentCommand={contentCommand}
          />
        </main>

        <div
          className={`article-studio__pane article-studio__pane--inspector ${
            activeMobileTab !== "chat" && activeMobileTab !== "article"
              ? "article-studio__pane--active"
              : ""
          }`}
        >
          <ArticleInspector
            article={data}
            googleMetrics={googleMetrics}
            customJsonLd={customJsonLd}
            saveStatus={saveStatus}
            isPending={isPending}
            ga4Data={ga4Data}
            ga4Loading={ga4Loading}
            ga4Error={ga4Error}
            ga4Configured={ga4Configured}
            inspectionResult={inspectionResult}
            inspectionLoading={inspectionLoading}
            inspectionError={inspectionError}
            inspectionConfigured={inspectionConfigured}
            pageSpeedResult={pageSpeedResult}
            pageSpeedLoading={pageSpeedLoading}
            pageSpeedError={pageSpeedError}
            pageSpeedConfigured={pageSpeedConfigured}
            onStatusAction={handleStatusAction}
            onSeoChange={handleSeoChange}
            onCoverUpload={handleCoverUpload}
            onCoverAltChange={setCoverAlt}
            onInspectUrl={handleInspectUrl}
            onRunPageSpeed={handleRunPageSpeed}
            onDeleteArticle={handleDeleteArticle}
          />
        </div>
      </div>
    </div>
  );
}
