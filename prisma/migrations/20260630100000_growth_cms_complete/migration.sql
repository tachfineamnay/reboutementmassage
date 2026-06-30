-- Growth CMS complete migration

-- CreateEnum
DO $$ BEGIN CREATE TYPE "DestinationStatus" AS ENUM ('DRAFT', 'READY', 'LIVE', 'PAUSED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DestinationMaturity" AS ENUM ('TEST', 'ACTIVE', 'PREMIUM', 'PARTNERSHIP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "OfferType" AS ENUM ('PRIVATE_SESSION', 'FOUNDER_SESSION', 'HOTEL_EXPERIENCE', 'HOSPITALITY_PARTNER', 'WORKSHOP', 'TRAINING', 'RETREAT', 'CORPORATE', 'VIP_SIGNATURE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'READY', 'LIVE', 'PAUSED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "LandingTemplate" AS ENUM ('MOBILE_WHATSAPP_FIRST', 'PREMIUM_PRIVATE_SESSION', 'B2B_HOSPITALITY', 'FORMATION_LEADGEN', 'SEO_LOCAL_SERVICE', 'EVENT_WORKSHOP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "LandingStatus" AS ENUM ('DRAFT', 'READY', 'LIVE', 'PAUSED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "WhatsappProvider" AS ENUM ('WHATSAPP_APP', 'GHL_WHATSAPP_PLATFORM', 'META_CLOUD_API'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "WhatsappChannelStatus" AS ENUM ('NOT_CONFIGURED', 'APP_ONLY', 'CONNECTED_GHL', 'ACTIVE', 'PAUSED', 'BLOCKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TrackingProfileStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CrmRoutingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TestimonialStatus" AS ENUM ('DRAFT', 'READY', 'LIVE', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CampaignPlatform" AS ENUM ('META', 'TIKTOK', 'GOOGLE', 'ORGANIC', 'DIRECT', 'PARTNER', 'EMAIL', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CampaignSourceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "MediaAssetType" AS ENUM ('IMAGE', 'VIDEO', 'POSTER', 'DOCUMENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "NormalizedNeedType" AS ENUM ('back', 'neck', 'stress', 'fatigue', 'travel', 'mobility', 'recovery', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable media_assets
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "assetType" "MediaAssetType" NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "externalUrl" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "consentNotes" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "usageNotes" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "destinationId" TEXT;

-- AlterTable lead_submissions
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "landingPageId" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "destinationId" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "offerId" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "medium" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "campaign" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "creativeAngle" TEXT;
ALTER TABLE "lead_submissions" ADD COLUMN IF NOT EXISTS "ctaLocation" TEXT;

-- CreateTable destinations
CREATE TABLE IF NOT EXISTS "destinations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "displayNameFr" TEXT NOT NULL,
    "displayNameEn" TEXT NOT NULL,
    "displayNameEs" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "locales" "Locale"[] DEFAULT ARRAY['FR', 'EN', 'ES']::"Locale"[],
    "neighborhoods" JSONB NOT NULL DEFAULT '[]',
    "targetSegments" JSONB NOT NULL DEFAULT '[]',
    "status" "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
    "maturity" "DestinationMaturity" NOT NULL DEFAULT 'TEST',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "defaultWhatsappChannelId" TEXT,
    "defaultTrackingProfileId" TEXT,
    "defaultOfferId" TEXT,
    "internalNotes" TEXT,
    "publicNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");
CREATE UNIQUE INDEX "destinations_defaultWhatsappChannelId_key" ON "destinations"("defaultWhatsappChannelId");
CREATE UNIQUE INDEX "destinations_defaultTrackingProfileId_key" ON "destinations"("defaultTrackingProfileId");
CREATE UNIQUE INDEX "destinations_defaultOfferId_key" ON "destinations"("defaultOfferId");
CREATE INDEX "destinations_status_idx" ON "destinations"("status");
CREATE INDEX "destinations_country_idx" ON "destinations"("country");

-- CreateTable offers
CREATE TABLE IF NOT EXISTS "offers" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "type" "OfferType" NOT NULL,
    "internalName" TEXT NOT NULL,
    "publicNameFr" TEXT NOT NULL,
    "publicNameEn" TEXT NOT NULL,
    "publicNameEs" TEXT NOT NULL,
    "shortDescriptionFr" TEXT,
    "shortDescriptionEn" TEXT,
    "shortDescriptionEs" TEXT,
    "durationMinutes" INTEGER,
    "priceAmount" DECIMAL(10,2),
    "currency" TEXT,
    "showPrice" BOOLEAN NOT NULL DEFAULT false,
    "priceNoteFr" TEXT,
    "priceNoteEn" TEXT,
    "priceNoteEs" TEXT,
    "bookingUrl" TEXT,
    "paymentUrl" TEXT,
    "primaryCtaFr" TEXT,
    "primaryCtaEn" TEXT,
    "primaryCtaEs" TEXT,
    "secondaryCtaFr" TEXT,
    "secondaryCtaEn" TEXT,
    "secondaryCtaEs" TEXT,
    "conditionsFr" TEXT,
    "conditionsEn" TEXT,
    "conditionsEs" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "offers_destinationId_status_idx" ON "offers"("destinationId", "status");
CREATE INDEX "offers_type_idx" ON "offers"("type");

-- CreateTable whatsapp_channels
CREATE TABLE IF NOT EXISTS "whatsapp_channels" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "provider" "WhatsappProvider" NOT NULL DEFAULT 'WHATSAPP_APP',
    "status" "WhatsappChannelStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "defaultLocale" "Locale" NOT NULL DEFAULT 'FR',
    "prefilledMessageFr" TEXT NOT NULL,
    "prefilledMessageEn" TEXT NOT NULL,
    "prefilledMessageEs" TEXT NOT NULL,
    "ghlWorkflowHotLeadId" TEXT,
    "ghlWorkflowInfoNeededId" TEXT,
    "ghlWorkflowBookingId" TEXT,
    "fallbackUrl" TEXT,
    "ownerName" TEXT,
    "businessHours" JSONB NOT NULL DEFAULT '{}',
    "lastVerifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "whatsapp_channels_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "whatsapp_channels_destinationId_status_idx" ON "whatsapp_channels"("destinationId", "status");

-- CreateTable tracking_profiles
CREATE TABLE IF NOT EXISTS "tracking_profiles" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metaPixelId" TEXT,
    "tiktokPixelId" TEXT,
    "ga4MeasurementId" TEXT,
    "googleAdsId" TEXT,
    "gtmContainerId" TEXT,
    "consentMode" TEXT NOT NULL DEFAULT 'basic',
    "enableMeta" BOOLEAN NOT NULL DEFAULT true,
    "enableTikTok" BOOLEAN NOT NULL DEFAULT false,
    "enableGA4" BOOLEAN NOT NULL DEFAULT true,
    "enableGTM" BOOLEAN NOT NULL DEFAULT false,
    "enableGoogleAds" BOOLEAN NOT NULL DEFAULT false,
    "status" "TrackingProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tracking_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tracking_profiles_destinationId_status_idx" ON "tracking_profiles"("destinationId", "status");

-- CreateTable crm_routing_rules
CREATE TABLE IF NOT EXISTS "crm_routing_rules" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "locale" "Locale",
    "offerType" "OfferType",
    "source" TEXT,
    "intent" TEXT,
    "leadSegment" TEXT,
    "ghlPipelineId" TEXT,
    "ghlPipelineStageId" TEXT,
    "ghlWorkflowId" TEXT,
    "ghlAssignedUserId" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" "CrmRoutingStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "crm_routing_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "crm_routing_rules_destinationId_status_priority_idx" ON "crm_routing_rules"("destinationId", "status", "priority");

-- CreateTable landing_pages
CREATE TABLE IF NOT EXISTS "landing_pages" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "offerId" TEXT,
    "locale" "Locale" NOT NULL,
    "template" "LandingTemplate" NOT NULL DEFAULT 'MOBILE_WHATSAPP_FIRST',
    "slug" TEXT NOT NULL,
    "status" "LandingStatus" NOT NULL DEFAULT 'DRAFT',
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT,
    "microNote" TEXT,
    "primaryCta" TEXT,
    "secondaryCta" TEXT,
    "painChips" JSONB NOT NULL DEFAULT '[]',
    "proofBadges" JSONB NOT NULL DEFAULT '[]',
    "processSteps" JSONB NOT NULL DEFAULT '[]',
    "faq" JSONB NOT NULL DEFAULT '[]',
    "content" JSONB NOT NULL DEFAULT '{}',
    "complianceText" TEXT,
    "heroImageId" TEXT,
    "ogImageId" TEXT,
    "testimonialIds" JSONB NOT NULL DEFAULT '[]',
    "whatsappChannelId" TEXT,
    "trackingProfileId" TEXT,
    "crmRoutingRuleId" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "canonical" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT true,
    "hreflangGroupId" TEXT,
    "xDefault" BOOLEAN NOT NULL DEFAULT false,
    "areaServed" TEXT,
    "schemaConfig" JSONB NOT NULL DEFAULT '{}',
    "readinessScore" INTEGER NOT NULL DEFAULT 0,
    "readinessIssues" JSONB NOT NULL DEFAULT '[]',
    "previewToken" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "landing_pages_locale_slug_key" ON "landing_pages"("locale", "slug");
CREATE UNIQUE INDEX "landing_pages_previewToken_key" ON "landing_pages"("previewToken");
CREATE INDEX "landing_pages_destinationId_locale_status_idx" ON "landing_pages"("destinationId", "locale", "status");
CREATE INDEX "landing_pages_hreflangGroupId_idx" ON "landing_pages"("hreflangGroupId");
CREATE INDEX "landing_pages_status_noindex_idx" ON "landing_pages"("status", "noindex");

-- CreateTable pixel_event_logs
CREATE TABLE IF NOT EXISTS "pixel_event_logs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "landingPageId" TEXT,
    "destinationId" TEXT,
    "locale" "Locale",
    "offerId" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "content" TEXT,
    "creativeAngle" TEXT,
    "ctaLocation" TEXT,
    "needType" "NormalizedNeedType",
    "pageUrl" TEXT,
    "sessionId" TEXT,
    "sentToMeta" BOOLEAN NOT NULL DEFAULT false,
    "sentToTikTok" BOOLEAN NOT NULL DEFAULT false,
    "sentToGA4" BOOLEAN NOT NULL DEFAULT false,
    "sentToGTM" BOOLEAN NOT NULL DEFAULT false,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pixel_event_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pixel_event_logs_eventName_createdAt_idx" ON "pixel_event_logs"("eventName", "createdAt");
CREATE INDEX "pixel_event_logs_landingPageId_createdAt_idx" ON "pixel_event_logs"("landingPageId", "createdAt");
CREATE INDEX "pixel_event_logs_destinationId_createdAt_idx" ON "pixel_event_logs"("destinationId", "createdAt");
CREATE INDEX "pixel_event_logs_eventId_idx" ON "pixel_event_logs"("eventId");

-- CreateTable testimonials
CREATE TABLE IF NOT EXISTS "testimonials" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "displayName" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "profile" TEXT,
    "ageRange" TEXT,
    "occupation" TEXT,
    "destinationId" TEXT,
    "offerId" TEXT,
    "mediaAssetId" TEXT,
    "posterImageId" TEXT,
    "transcript" TEXT,
    "subtitlesUrl" TEXT,
    "quoteShort" TEXT,
    "quoteLong" TEXT,
    "consentWebsite" BOOLEAN NOT NULL DEFAULT false,
    "consentAds" BOOLEAN NOT NULL DEFAULT false,
    "consentOrganic" BOOLEAN NOT NULL DEFAULT true,
    "emotionalScore" INTEGER NOT NULL DEFAULT 0,
    "credibilityScore" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "testimonials_destinationId_locale_status_idx" ON "testimonials"("destinationId", "locale", "status");
CREATE INDEX "testimonials_priority_idx" ON "testimonials"("priority");

-- CreateTable campaign_sources
CREATE TABLE IF NOT EXISTS "campaign_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "platform" "CampaignPlatform" NOT NULL,
    "destinationId" TEXT,
    "landingPageId" TEXT,
    "offerId" TEXT,
    "locale" "Locale",
    "campaignName" TEXT,
    "adsetName" TEXT,
    "adName" TEXT,
    "creativeAngle" TEXT,
    "utmTemplate" TEXT,
    "status" "CampaignSourceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "campaign_sources_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campaign_sources_destinationId_platform_idx" ON "campaign_sources"("destinationId", "platform");
CREATE INDEX "campaign_sources_landingPageId_idx" ON "campaign_sources"("landingPageId");

-- CreateTable experiments
CREATE TABLE IF NOT EXISTS "experiments" (
    "id" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hypothesis" TEXT,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "primaryMetric" TEXT NOT NULL DEFAULT 'whatsapp_clicks',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "experiments_landingPageId_status_idx" ON "experiments"("landingPageId", "status");

-- CreateTable experiment_variants
CREATE TABLE IF NOT EXISTS "experiment_variants" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trafficSplit" INTEGER NOT NULL DEFAULT 50,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "primaryCta" TEXT,
    "testimonialId" TEXT,
    "contentOverrides" JSONB NOT NULL DEFAULT '{}',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "formSubmits" INTEGER NOT NULL DEFAULT 0,
    "bookingClicks" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "experiment_variants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "experiment_variants_experimentId_idx" ON "experiment_variants"("experimentId");

-- CreateTable redirect_rules
CREATE TABLE IF NOT EXISTS "redirect_rules" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "redirect_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "redirect_rules_sourcePath_key" ON "redirect_rules"("sourcePath");
CREATE INDEX "redirect_rules_active_idx" ON "redirect_rules"("active");

-- CreateTable landing_metric_daily
CREATE TABLE IF NOT EXISTS "landing_metric_daily" (
    "id" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "stickyClicks" INTEGER NOT NULL DEFAULT 0,
    "formStarts" INTEGER NOT NULL DEFAULT 0,
    "formSubmits" INTEGER NOT NULL DEFAULT 0,
    "bookingClicks" INTEGER NOT NULL DEFAULT 0,
    "paymentClicks" INTEGER NOT NULL DEFAULT 0,
    "videoPlays" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "landing_metric_daily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "landing_metric_daily_landingPageId_date_key" ON "landing_metric_daily"("landingPageId", "date");
CREATE INDEX "landing_metric_daily_date_idx" ON "landing_metric_daily"("date");

-- ForeignKeys
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "whatsapp_channels" ADD CONSTRAINT "whatsapp_channels_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tracking_profiles" ADD CONSTRAINT "tracking_profiles_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_routing_rules" ADD CONSTRAINT "crm_routing_rules_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_whatsappChannelId_fkey" FOREIGN KEY ("whatsappChannelId") REFERENCES "whatsapp_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_trackingProfileId_fkey" FOREIGN KEY ("trackingProfileId") REFERENCES "tracking_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_crmRoutingRuleId_fkey" FOREIGN KEY ("crmRoutingRuleId") REFERENCES "crm_routing_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pixel_event_logs" ADD CONSTRAINT "pixel_event_logs_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pixel_event_logs" ADD CONSTRAINT "pixel_event_logs_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_posterImageId_fkey" FOREIGN KEY ("posterImageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "campaign_sources" ADD CONSTRAINT "campaign_sources_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "campaign_sources" ADD CONSTRAINT "campaign_sources_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "campaign_sources" ADD CONSTRAINT "campaign_sources_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "experiment_variants" ADD CONSTRAINT "experiment_variants_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "experiment_variants" ADD CONSTRAINT "experiment_variants_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "testimonials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "landing_metric_daily" ADD CONSTRAINT "landing_metric_daily_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_submissions" ADD CONSTRAINT "lead_submissions_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_submissions" ADD CONSTRAINT "lead_submissions_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_submissions" ADD CONSTRAINT "lead_submissions_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_defaultWhatsappChannelId_fkey" FOREIGN KEY ("defaultWhatsappChannelId") REFERENCES "whatsapp_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_defaultTrackingProfileId_fkey" FOREIGN KEY ("defaultTrackingProfileId") REFERENCES "tracking_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_defaultOfferId_fkey" FOREIGN KEY ("defaultOfferId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "lead_submissions_landingPageId_idx" ON "lead_submissions"("landingPageId");
CREATE INDEX IF NOT EXISTS "lead_submissions_destinationId_idx" ON "lead_submissions"("destinationId");
CREATE INDEX IF NOT EXISTS "lead_submissions_offerId_idx" ON "lead_submissions"("offerId");
CREATE INDEX IF NOT EXISTS "lead_submissions_eventId_idx" ON "lead_submissions"("eventId");
CREATE INDEX IF NOT EXISTS "media_assets_destinationId_idx" ON "media_assets"("destinationId");
CREATE INDEX IF NOT EXISTS "media_assets_assetType_idx" ON "media_assets"("assetType");
