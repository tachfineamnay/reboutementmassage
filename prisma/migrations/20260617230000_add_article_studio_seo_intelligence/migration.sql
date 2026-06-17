-- CreateEnum
CREATE TYPE "StudioStage" AS ENUM ('RESEARCH', 'BRIEF', 'OUTLINE', 'DRAFT', 'FACT_CHECK', 'SEO', 'TRANSLATION', 'IMAGE');

-- CreateEnum
CREATE TYPE "StudioRunStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StudioArtifactStatus" AS ENUM ('GENERATED', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "StudioClaimStatus" AS ENUM ('VERIFIED', 'NEEDS_NUANCE', 'UNSUPPORTED', 'HUMAN_EVIDENCE_REQUIRED');

-- CreateEnum
CREATE TYPE "StudioSourceStatus" AS ENUM ('CANDIDATE', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HumanEvidenceStatus" AS ENUM ('DRAFT', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SeoIssueSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SeoSuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'APPLIED');

-- CreateEnum
CREATE TYPE "SeoEntityType" AS ENUM ('PERSON', 'ORGANIZATION', 'LOCAL_BUSINESS');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "authorEntityId" TEXT;

-- AlterTable
ALTER TABLE "article_seo" ADD COLUMN     "schemaConfig" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "article_studio_runs" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "stage" "StudioStage" NOT NULL,
    "status" "StudioRunStatus" NOT NULL DEFAULT 'QUEUED',
    "openaiResponseId" TEXT,
    "model" TEXT NOT NULL,
    "reasoningEffort" TEXT,
    "promptVersion" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "createdBy" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_studio_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_studio_artifacts" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "runId" TEXT,
    "stage" "StudioStage" NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "StudioArtifactStatus" NOT NULL DEFAULT 'GENERATED',
    "contentHash" TEXT,
    "data" JSONB NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_studio_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sources" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "artifactId" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "publishedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceType" TEXT,
    "authorityTier" INTEGER NOT NULL DEFAULT 3,
    "status" "StudioSourceStatus" NOT NULL DEFAULT 'CANDIDATE',
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "article_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_claims" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "artifactId" TEXT,
    "text" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" "StudioClaimStatus" NOT NULL DEFAULT 'UNSUPPORTED',
    "contentHash" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_claim_sources" (
    "claimId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "article_claim_sources_pkey" PRIMARY KEY ("claimId","sourceId")
);

-- CreateTable
CREATE TABLE "article_human_evidence" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "HumanEvidenceStatus" NOT NULL DEFAULT 'DRAFT',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_human_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_revisions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_crawl_runs" (
    "id" TEXT NOT NULL,
    "status" "StudioRunStatus" NOT NULL DEFAULT 'QUEUED',
    "baseUrl" TEXT NOT NULL,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "crawledPages" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_crawl_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_pages" (
    "id" TEXT NOT NULL,
    "crawlRunId" TEXT,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" "Locale",
    "pageType" TEXT,
    "title" TEXT,
    "statusCode" INTEGER NOT NULL,
    "indexable" BOOLEAN NOT NULL DEFAULT true,
    "canonical" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "contentHash" TEXT,
    "plainText" TEXT,
    "depth" INTEGER,
    "lastCrawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_link_edges" (
    "id" TEXT NOT NULL,
    "crawlRunId" TEXT NOT NULL,
    "sourcePageId" TEXT NOT NULL,
    "targetPageId" TEXT,
    "targetUrl" TEXT NOT NULL,
    "anchor" TEXT,
    "rel" TEXT,
    "statusCode" INTEGER,
    "internal" BOOLEAN NOT NULL DEFAULT true,
    "localeMismatch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_link_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_issues" (
    "id" TEXT NOT NULL,
    "crawlRunId" TEXT NOT NULL,
    "pageId" TEXT,
    "type" TEXT NOT NULL,
    "severity" "SeoIssueSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_link_suggestions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT,
    "sourcePageId" TEXT NOT NULL,
    "targetPageId" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "context" TEXT,
    "reason" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" "SeoSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_link_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_redirects" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "destinationPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "lastHitAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backlink_imports" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'AHREFS_CSV',
    "status" "StudioRunStatus" NOT NULL DEFAULT 'QUEUED',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "mapping" JSONB NOT NULL DEFAULT '{}',
    "error" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "backlink_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backlinks" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceDomain" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchor" TEXT,
    "rel" TEXT,
    "firstSeen" TIMESTAMP(3),
    "lastSeen" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backlinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_entities" (
    "id" TEXT NOT NULL,
    "type" "SeoEntityType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "sameAs" JSONB NOT NULL DEFAULT '[]',
    "credentials" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_image_variants" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "ratio" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'COVER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_image_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_studio_runs_articleId_createdAt_idx" ON "article_studio_runs"("articleId", "createdAt");

-- CreateIndex
CREATE INDEX "article_studio_runs_status_createdAt_idx" ON "article_studio_runs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "article_studio_artifacts_articleId_stage_status_idx" ON "article_studio_artifacts"("articleId", "stage", "status");

-- CreateIndex
CREATE INDEX "article_studio_artifacts_runId_idx" ON "article_studio_artifacts"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "article_studio_artifacts_articleId_stage_version_key" ON "article_studio_artifacts"("articleId", "stage", "version");

-- CreateIndex
CREATE INDEX "article_sources_articleId_status_idx" ON "article_sources"("articleId", "status");

-- CreateIndex
CREATE INDEX "article_sources_artifactId_idx" ON "article_sources"("artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "article_sources_articleId_url_key" ON "article_sources"("articleId", "url");

-- CreateIndex
CREATE INDEX "article_claims_articleId_status_idx" ON "article_claims"("articleId", "status");

-- CreateIndex
CREATE INDEX "article_claims_artifactId_idx" ON "article_claims"("artifactId");

-- CreateIndex
CREATE INDEX "article_claim_sources_sourceId_idx" ON "article_claim_sources"("sourceId");

-- CreateIndex
CREATE INDEX "article_human_evidence_articleId_status_idx" ON "article_human_evidence"("articleId", "status");

-- CreateIndex
CREATE INDEX "article_revisions_articleId_createdAt_idx" ON "article_revisions"("articleId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "article_revisions_articleId_contentHash_key" ON "article_revisions"("articleId", "contentHash");

-- CreateIndex
CREATE INDEX "seo_crawl_runs_status_createdAt_idx" ON "seo_crawl_runs"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "seo_pages_url_key" ON "seo_pages"("url");

-- CreateIndex
CREATE INDEX "seo_pages_locale_pageType_idx" ON "seo_pages"("locale", "pageType");

-- CreateIndex
CREATE INDEX "seo_pages_indexable_statusCode_idx" ON "seo_pages"("indexable", "statusCode");

-- CreateIndex
CREATE INDEX "seo_pages_crawlRunId_idx" ON "seo_pages"("crawlRunId");

-- CreateIndex
CREATE INDEX "seo_link_edges_crawlRunId_sourcePageId_idx" ON "seo_link_edges"("crawlRunId", "sourcePageId");

-- CreateIndex
CREATE INDEX "seo_link_edges_targetPageId_idx" ON "seo_link_edges"("targetPageId");

-- CreateIndex
CREATE INDEX "seo_issues_crawlRunId_severity_idx" ON "seo_issues"("crawlRunId", "severity");

-- CreateIndex
CREATE INDEX "seo_issues_pageId_idx" ON "seo_issues"("pageId");

-- CreateIndex
CREATE INDEX "seo_link_suggestions_articleId_status_idx" ON "seo_link_suggestions"("articleId", "status");

-- CreateIndex
CREATE INDEX "seo_link_suggestions_sourcePageId_targetPageId_idx" ON "seo_link_suggestions"("sourcePageId", "targetPageId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_redirects_sourcePath_key" ON "seo_redirects"("sourcePath");

-- CreateIndex
CREATE INDEX "seo_redirects_active_sourcePath_idx" ON "seo_redirects"("active", "sourcePath");

-- CreateIndex
CREATE INDEX "backlink_imports_status_createdAt_idx" ON "backlink_imports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "backlinks_sourceDomain_idx" ON "backlinks"("sourceDomain");

-- CreateIndex
CREATE INDEX "backlinks_status_lastSeen_idx" ON "backlinks"("status", "lastSeen");

-- CreateIndex
CREATE INDEX "backlinks_importId_idx" ON "backlinks"("importId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_entities_slug_key" ON "seo_entities"("slug");

-- CreateIndex
CREATE INDEX "seo_entities_type_active_idx" ON "seo_entities"("type", "active");

-- CreateIndex
CREATE INDEX "article_image_variants_assetId_idx" ON "article_image_variants"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "article_image_variants_articleId_ratio_kind_key" ON "article_image_variants"("articleId", "ratio", "kind");

-- CreateIndex
CREATE INDEX "articles_authorEntityId_idx" ON "articles"("authorEntityId");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorEntityId_fkey" FOREIGN KEY ("authorEntityId") REFERENCES "seo_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_studio_runs" ADD CONSTRAINT "article_studio_runs_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_studio_artifacts" ADD CONSTRAINT "article_studio_artifacts_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_studio_artifacts" ADD CONSTRAINT "article_studio_artifacts_runId_fkey" FOREIGN KEY ("runId") REFERENCES "article_studio_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sources" ADD CONSTRAINT "article_sources_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sources" ADD CONSTRAINT "article_sources_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "article_studio_artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_claims" ADD CONSTRAINT "article_claims_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_claims" ADD CONSTRAINT "article_claims_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "article_studio_artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_claim_sources" ADD CONSTRAINT "article_claim_sources_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "article_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_claim_sources" ADD CONSTRAINT "article_claim_sources_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "article_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_human_evidence" ADD CONSTRAINT "article_human_evidence_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_pages" ADD CONSTRAINT "seo_pages_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "seo_crawl_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_link_edges" ADD CONSTRAINT "seo_link_edges_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "seo_crawl_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_link_edges" ADD CONSTRAINT "seo_link_edges_sourcePageId_fkey" FOREIGN KEY ("sourcePageId") REFERENCES "seo_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_link_edges" ADD CONSTRAINT "seo_link_edges_targetPageId_fkey" FOREIGN KEY ("targetPageId") REFERENCES "seo_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "seo_crawl_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "seo_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_link_suggestions" ADD CONSTRAINT "seo_link_suggestions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_link_suggestions" ADD CONSTRAINT "seo_link_suggestions_sourcePageId_fkey" FOREIGN KEY ("sourcePageId") REFERENCES "seo_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_link_suggestions" ADD CONSTRAINT "seo_link_suggestions_targetPageId_fkey" FOREIGN KEY ("targetPageId") REFERENCES "seo_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backlinks" ADD CONSTRAINT "backlinks_importId_fkey" FOREIGN KEY ("importId") REFERENCES "backlink_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_image_variants" ADD CONSTRAINT "article_image_variants_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_image_variants" ADD CONSTRAINT "article_image_variants_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
