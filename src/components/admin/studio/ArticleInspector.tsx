"use client";

import ArticleJsonLdEditor from "@/components/admin/ArticleJsonLdEditor";
import ArticleLocaleSwitcher from "@/components/admin/ArticleLocaleSwitcher";
import ArticleStatusBadge from "@/components/admin/ArticleStatusBadge";
import ImageUploader from "@/components/admin/ImageUploader";
import SeoPanel from "@/components/admin/SeoPanel";
import type { EvidenceNotes, FaqItem } from "@/lib/geo";
import ArticleStudioContextPanel from "./ArticleStudioContextPanel";
import type { ArticleData, ArticleStatus, GoogleMetrics, SaveStatus } from "./ArticleStudioTypes";

type SeoPanelValue = string | boolean | string[] | FaqItem[] | EvidenceNotes;

type MediaAsset = {
  id: string;
  url: string;
  filename: string;
};

type Ga4Data = {
  sessions: number;
  storyViewCount: number;
  storyCtaClickCount: number;
  leadSubmittedCount: number;
};

type InspectionResult = {
  indexStatus: string;
  verdict: string;
  coverageState: string;
  lastCrawlTime: string | null;
  userCanonical: string | null;
  googleCanonical: string | null;
};

type PageSpeedResult = {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  lcp: string;
  cls: string;
  auditedAt: string;
};

const STATUS_TRANSITIONS: Record<ArticleStatus, { label: string; next: ArticleStatus }[]> = {
  DRAFT: [
    { label: "Marquer prêt", next: "READY" },
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

function InspectorSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="article-inspector__section" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="article-inspector__section-body">{children}</div>
    </details>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="article-inspector-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function ArticleInspector({
  article,
  googleMetrics,
  customJsonLd,
  saveStatus,
  isPending,
  ga4Data,
  ga4Loading,
  ga4Error,
  ga4Configured,
  inspectionResult,
  inspectionLoading,
  inspectionError,
  inspectionConfigured,
  pageSpeedResult,
  pageSpeedLoading,
  pageSpeedError,
  pageSpeedConfigured,
  onStatusAction,
  onSeoChange,
  onCoverUpload,
  onCoverAltChange,
  onInspectUrl,
  onRunPageSpeed,
  onDeleteArticle,
}: {
  article: ArticleData;
  googleMetrics: GoogleMetrics;
  customJsonLd: unknown;
  saveStatus: SaveStatus;
  isPending: boolean;
  ga4Data: Ga4Data | null;
  ga4Loading: boolean;
  ga4Error: string | null;
  ga4Configured: boolean;
  inspectionResult: InspectionResult | null;
  inspectionLoading: boolean;
  inspectionError: string | null;
  inspectionConfigured: boolean;
  pageSpeedResult: PageSpeedResult | null;
  pageSpeedLoading: boolean;
  pageSpeedError: string | null;
  pageSpeedConfigured: boolean;
  onStatusAction: (next: ArticleStatus) => void;
  onSeoChange: (field: string, value: SeoPanelValue) => void;
  onCoverUpload: (asset: MediaAsset) => void;
  onCoverAltChange: (field: "altFr" | "altEn" | "altEs", value: string) => void;
  onInspectUrl: () => void;
  onRunPageSpeed: () => void;
  onDeleteArticle: () => void;
}) {
  return (
    <aside className="article-inspector" aria-label="Inspector article">
      <ArticleStudioContextPanel article={article} />

      <InspectorSection title="Publication" defaultOpen>
        <div className="pub-status">
          <ArticleStatusBadge status={article.status} />
          {article.publishedAt && (
            <p className="pub-date">
              Publié le{" "}
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
                new Date(article.publishedAt)
              )}
            </p>
          )}
        </div>
        <div className="pub-actions">
          {STATUS_TRANSITIONS[article.status].map(({ label, next }) => (
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
              onClick={() => onStatusAction(next)}
              disabled={isPending || saveStatus === "saving"}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="danger-zone article-inspector__danger">
          <h4 className="danger-zone__title">Zone de danger</h4>
          <p className="danger-zone__desc">La suppression est irréversible.</p>
          <button
            type="button"
            className="admin-btn admin-btn--danger admin-btn--sm admin-btn--full"
            onClick={onDeleteArticle}
          >
            Supprimer cet article
          </button>
        </div>
      </InspectorSection>

      <InspectorSection title="SEO" defaultOpen>
        <SeoPanel
          seoTitle={article.seo.seoTitle}
          seoDescription={article.seo.metaDescription}
          focusKeyword={article.seo.focusKeyword}
          noindex={article.seo.noindex}
          slug={article.slug}
          locale={article.locale}
          title={article.title}
          plainText={article.content.plainText}
          html={article.content.html}
          editorJson={article.content.editorJson}
          seoScore={article.seo.score}
          primaryQuestion={article.seo.primaryQuestion}
          answerIntent={article.seo.answerIntent}
          targetAudience={article.seo.targetAudience}
          geoLocation={article.seo.geoLocation}
          businessGoal={article.seo.businessGoal}
          entityTargets={article.seo.entityTargets}
          faqItems={article.seo.faqItems}
          evidenceNotes={article.seo.evidenceNotes}
          onChange={onSeoChange}
        />
      </InspectorSection>

      <InspectorSection title="AEO/GEO">
        <div className="article-inspector-score-row">
          <MetricCard label="AEO" value={`${article.seo.aeoScore}/100`} />
          <MetricCard label="GEO" value={`${article.seo.geoScore}/100`} />
          <MetricCard label="E-E-A-T" value={`${article.seo.eeatScore}/100`} />
        </div>
        <p className="admin-hint">
          Les champs AEO/GEO sont éditables dans la section SEO. Les scores sont recalculés à la sauvegarde.
        </p>
      </InspectorSection>

      <InspectorSection title="Crédibilité E-E-A-T">
        <div className="admin-field">
          <label className="admin-label" htmlFor="inspector-eeat-experience">
            Notes d&apos;expérience
          </label>
          <textarea
            id="inspector-eeat-experience"
            className="admin-input"
            rows={4}
            value={article.seo.evidenceNotes.experience}
            onChange={(event) =>
              onSeoChange("evidenceNotes", {
                ...article.seo.evidenceNotes,
                experience: event.target.value,
              })
            }
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="inspector-eeat-precautions">
            Limites et précautions
          </label>
          <textarea
            id="inspector-eeat-precautions"
            className="admin-input"
            rows={4}
            value={article.seo.evidenceNotes.precautions}
            onChange={(event) =>
              onSeoChange("evidenceNotes", {
                ...article.seo.evidenceNotes,
                precautions: event.target.value,
              })
            }
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Image principale">
        <ImageUploader currentImage={article.coverImageUrl || null} onUpload={onCoverUpload} />
        <div className="cover-alt-fields">
          <div className="admin-field">
            <label className="admin-label" htmlFor="cover-alt-fr">Texte alt FR</label>
            <input
              id="cover-alt-fr"
              type="text"
              className="admin-input"
              value={article.coverImageAltFr || ""}
              onChange={(event) => onCoverAltChange("altFr", event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="cover-alt-en">Texte alt EN</label>
            <input
              id="cover-alt-en"
              type="text"
              className="admin-input"
              value={article.coverImageAltEn || ""}
              onChange={(event) => onCoverAltChange("altEn", event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="cover-alt-es">Texte alt ES</label>
            <input
              id="cover-alt-es"
              type="text"
              className="admin-input"
              value={article.coverImageAltEs || ""}
              onChange={(event) => onCoverAltChange("altEs", event.target.value)}
            />
          </div>
        </div>
      </InspectorSection>

      <InspectorSection title="Traductions">
        <ArticleLocaleSwitcher
          articleId={article.id}
          initialLocale={article.locale}
          slug={article.slug}
          status={article.status}
          embedded
        />
        <p className="admin-hint">
          Les adaptations IA EN et ES-MX sont des propositions. Aucun article traduit n&apos;est créé automatiquement.
        </p>
      </InspectorSection>

      <InspectorSection title="JSON-LD">
        <ArticleJsonLdEditor articleId={article.id} initialValue={customJsonLd} embedded />
      </InspectorSection>

      <InspectorSection title="Performances Google">
        <div className="article-inspector-score-row">
          <MetricCard label="Clics" value={googleMetrics.clicks.toLocaleString("fr-FR")} />
          <MetricCard
            label="Impressions"
            value={googleMetrics.impressions.toLocaleString("fr-FR")}
          />
          <MetricCard label="CTR" value={`${googleMetrics.ctr.toFixed(1)}%`} />
          <MetricCard label="Position" value={googleMetrics.position.toFixed(1)} />
        </div>

        {!ga4Configured ? (
          <p className="admin-hint">API GA4 non configurée.</p>
        ) : ga4Loading ? (
          <p className="admin-hint">Chargement GA4...</p>
        ) : ga4Error ? (
          <p className="admin-hint admin-hint--warn">{ga4Error}</p>
        ) : ga4Data ? (
          <div className="article-inspector-score-row">
            <MetricCard label="Sessions" value={ga4Data.sessions.toLocaleString("fr-FR")} />
            <MetricCard label="Lectures" value={ga4Data.storyViewCount.toLocaleString("fr-FR")} />
            <MetricCard label="CTA" value={ga4Data.storyCtaClickCount.toLocaleString("fr-FR")} />
            <MetricCard label="Leads" value={ga4Data.leadSubmittedCount.toLocaleString("fr-FR")} />
          </div>
        ) : (
          <p className="admin-hint">Aucune donnée GA4 disponible.</p>
        )}

        <div className="article-inspector-google-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={onInspectUrl}
            disabled={inspectionLoading || !inspectionConfigured}
          >
            {inspectionLoading ? "Inspection..." : "Inspecter l'URL"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={onRunPageSpeed}
            disabled={pageSpeedLoading || !pageSpeedConfigured}
          >
            {pageSpeedLoading ? "Audit..." : "Lancer PageSpeed"}
          </button>
        </div>

        {!inspectionConfigured && <p className="admin-hint">URL Inspection non configurée.</p>}
        {inspectionError && <p className="admin-hint admin-hint--warn">{inspectionError}</p>}
        {inspectionResult && (
          <div className="article-inspector-result">
            <strong>{inspectionResult.verdict}</strong>
            <span>{inspectionResult.coverageState}</span>
            <span>
              Dernier crawl:{" "}
              {inspectionResult.lastCrawlTime
                ? new Date(inspectionResult.lastCrawlTime).toLocaleString("fr-FR")
                : "inconnu"}
            </span>
          </div>
        )}

        {!pageSpeedConfigured && <p className="admin-hint">PageSpeed non configuré.</p>}
        {pageSpeedError && <p className="admin-hint admin-hint--warn">{pageSpeedError}</p>}
        {pageSpeedResult && (
          <div className="article-inspector-score-row">
            <MetricCard label="Perf" value={pageSpeedResult.performanceScore} />
            <MetricCard label="SEO" value={pageSpeedResult.seoScore} />
            <MetricCard label="Accessibilité" value={pageSpeedResult.accessibilityScore} />
            <MetricCard label="LCP" value={pageSpeedResult.lcp} />
          </div>
        )}
      </InspectorSection>
    </aside>
  );
}
