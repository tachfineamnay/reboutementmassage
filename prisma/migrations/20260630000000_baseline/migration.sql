-- Growth CMS baseline: idempotent core schema (pre-Growth tables)
-- Generated from prisma schema introspection

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$ BEGIN CREATE TYPE "Locale" AS ENUM ('FR', 'EN', 'ES'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "LandingSectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "LeadStatus" AS ENUM ('CAPTURED', 'MOCKED', 'SENT_TO_GHL', 'FAILED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "TranscreationStatus" AS ENUM ('DRAFT', 'AI_GENERATED', 'REVIEWED', 'PUBLISHED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "AudioProvider" AS ENUM ('ELEVENLABS', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "StudioStage" AS ENUM ('RESEARCH', 'BRIEF', 'OUTLINE', 'DRAFT', 'FACT_CHECK', 'SEO', 'TRANSLATION', 'IMAGE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "StudioRunStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "StudioArtifactStatus" AS ENUM ('GENERATED', 'APPROVED', 'REJECTED', 'SUPERSEDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "StudioClaimStatus" AS ENUM ('VERIFIED', 'NEEDS_NUANCE', 'UNSUPPORTED', 'HUMAN_EVIDENCE_REQUIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "StudioSourceStatus" AS ENUM ('CANDIDATE', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "HumanEvidenceStatus" AS ENUM ('DRAFT', 'VERIFIED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "SeoIssueSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "SeoSuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'APPLIED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "SeoEntityType" AS ENUM ('PERSON', 'ORGANIZATION', 'LOCAL_BUSINESS'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "admin_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "lead_submissions" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "context" TEXT,
    "locale" "Locale" NOT NULL DEFAULT 'FR',
    "companyName" TEXT,
    "jobTitle" TEXT,
    "propertyType" TEXT,
    "destination" TEXT,
    "leadSegment" TEXT,
    "intent" TEXT,
    "preferredChannel" TEXT,
    "routedToUrl" TEXT,
    "urgency" TEXT,
    "needType" TEXT,
    "volumePotential" TEXT,
    "participantCount" TEXT,
    "currentLocation" TEXT,
    "selectedDayLabel" TEXT,
    "selectedTime" TEXT,
    "selectedAt" TIMESTAMP(3),
    "timezone" TEXT,
    "pageUrl" TEXT,
    "utm" JSONB NOT NULL DEFAULT '{}',
    "branchData" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "LeadStatus" NOT NULL DEFAULT 'CAPTURED',
    "ghlContactId" TEXT,
    "errorMessage" TEXT,
    "resendEmailId" TEXT,
    "notificationSentAt" TIMESTAMP(3),
    "notificationError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "media_assets" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "localPath" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER NOT NULL,
    "altFr" TEXT,
    "altEn" TEXT,
    "altEs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "articles" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'FR',
    "translationGroupId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "coverImageId" TEXT,
    "authorEntityId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_contents" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "editorJson" JSONB,
    "html" TEXT,
    "plainText" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_seo" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "focusKeyword" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "canonical" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageId" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "issues" JSONB NOT NULL DEFAULT '[]',
    "llmReadabilityScore" INTEGER NOT NULL DEFAULT 0,
    "atomicAnswerPresent" BOOLEAN NOT NULL DEFAULT false,
    "schemaValidation" JSONB NOT NULL DEFAULT '{}',
    "geoChecklist" JSONB NOT NULL DEFAULT '[]',
    "answerCoverageScore" INTEGER NOT NULL DEFAULT 0,
    "lastGeoAuditAt" TIMESTAMP(3),
    "primaryQuestion" TEXT,
    "answerIntent" TEXT,
    "targetAudience" TEXT,
    "geoLocation" TEXT,
    "businessGoal" TEXT,
    "entityTargets" JSONB NOT NULL DEFAULT '[]',
    "faqItems" JSONB NOT NULL DEFAULT '[]',
    "evidenceNotes" JSONB NOT NULL DEFAULT '{}',
    "customJsonLd" JSONB NOT NULL DEFAULT '[]',
    "schemaConfig" JSONB NOT NULL DEFAULT '{}',
    "aeoScore" INTEGER NOT NULL DEFAULT 0,
    "geoScore" INTEGER NOT NULL DEFAULT 0,
    "eeatScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_transcreations" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "sourceLocale" "Locale" NOT NULL,
    "targetLocale" "Locale" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'GOOGLE_AI_PRO',
    "model" TEXT,
    "title" TEXT,
    "excerpt" TEXT,
    "editorJson" JSONB,
    "html" TEXT,
    "plainText" TEXT,
    "promptVersion" TEXT,
    "reviewStatus" "TranscreationStatus" NOT NULL DEFAULT 'AI_GENERATED',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_transcreations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_audio_assets" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "provider" "AudioProvider" NOT NULL DEFAULT 'ELEVENLABS',
    "providerVoiceId" TEXT,
    "voiceName" TEXT,
    "audioUrl" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "transcript" TEXT,
    "status" "TranscreationStatus" NOT NULL DEFAULT 'AI_GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_audio_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_metrics" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organicSessions" INTEGER NOT NULL DEFAULT 0,
    "storyViews" INTEGER NOT NULL DEFAULT 0,
    "ctaClicks" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_pagespeed_audits" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "strategy" TEXT NOT NULL DEFAULT 'mobile',
    "performanceScore" INTEGER NOT NULL,
    "seoScore" INTEGER NOT NULL,
    "accessibilityScore" INTEGER NOT NULL,
    "lcp" TEXT,
    "cls" TEXT,
    "raw" JSONB,
    "auditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_pagespeed_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_url_inspections" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "indexStatus" TEXT,
    "verdict" TEXT,
    "coverageState" TEXT,
    "lastCrawlTime" TIMESTAMP(3),
    "userCanonical" TEXT,
    "googleCanonical" TEXT,
    "raw" JSONB,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_url_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_studio_runs" (
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
CREATE TABLE IF NOT EXISTS "article_studio_artifacts" (
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
CREATE TABLE IF NOT EXISTS "article_sources" (
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
CREATE TABLE IF NOT EXISTS "article_claims" (
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
CREATE TABLE IF NOT EXISTS "article_claim_sources" (
    "claimId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "article_claim_sources_pkey" PRIMARY KEY ("claimId","sourceId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_human_evidence" (
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
CREATE TABLE IF NOT EXISTS "article_revisions" (
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
CREATE TABLE IF NOT EXISTS "seo_crawl_runs" (
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
CREATE TABLE IF NOT EXISTS "seo_pages" (
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
CREATE TABLE IF NOT EXISTS "seo_link_edges" (
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
CREATE TABLE IF NOT EXISTS "seo_issues" (
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
CREATE TABLE IF NOT EXISTS "seo_link_suggestions" (
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
CREATE TABLE IF NOT EXISTS "seo_redirects" (
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
CREATE TABLE IF NOT EXISTS "backlink_imports" (
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
CREATE TABLE IF NOT EXISTS "backlinks" (
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
CREATE TABLE IF NOT EXISTS "seo_entities" (
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
CREATE TABLE IF NOT EXISTS "article_image_variants" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "ratio" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'COVER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_image_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "landing_sections" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'FR',
    "status" "LandingSectionStatus" NOT NULL DEFAULT 'DRAFT',
    "placement" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "subtitle" TEXT,
    "body" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "imageId" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
