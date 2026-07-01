"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { parseJsonField } from "@/lib/growth/admin-api";
import { v4 as uuidv4 } from "uuid";
import { writeFile, unlink } from "fs/promises";
import { getLocalPath, getUploadUrl, ensureUploadsDir } from "@/lib/server-utils";
import {
  assertCanPublish,
  computeLandingReadiness,
  PublishBlockedError,
} from "@/lib/growth/landing-readiness";
import { growthLandingInclude, type ExperimentVariantInput, type MediaAssetType } from "@/lib/growth/types";

async function requireGrowthAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié.");
  await ensureAdminSchema();
  return session;
}

function str(formData: FormData, key: string, fallback = ""): string {
  return String(formData.get(key) ?? fallback).trim();
}

function optStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v || null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function intOrNull(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function decimalOrNull(formData: FormData, key: string): Prisma.Decimal | null {
  const v = str(formData, key);
  if (!v) return null;
  return new Prisma.Decimal(v);
}

function revalidateGrowth(...paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

// ── Destinations ─────────────────────────────────────────────────────────────

export async function upsertDestinationAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const data = {
    slug: str(formData, "slug"),
    cityName: str(formData, "cityName"),
    displayNameFr: str(formData, "displayNameFr"),
    displayNameEn: str(formData, "displayNameEn"),
    displayNameEs: str(formData, "displayNameEs"),
    country: str(formData, "country"),
    region: optStr(formData, "region"),
    timezone: str(formData, "timezone", "UTC"),
    currency: str(formData, "currency", "USD"),
    status: str(formData, "status", "DRAFT") as "DRAFT" | "READY" | "LIVE" | "PAUSED" | "ARCHIVED",
    maturity: str(formData, "maturity", "TEST") as "TEST" | "ACTIVE" | "PREMIUM" | "PARTNERSHIP",
    internalNotes: optStr(formData, "internalNotes"),
    publicNotes: optStr(formData, "publicNotes"),
  };

  if (id) {
    await prisma.destination.update({ where: { id }, data });
    revalidateGrowth("/admin/destinations", `/admin/destinations/${id}/edit`);
    redirect(`/admin/destinations/${id}/edit?saved=1`);
  }

  const created = await prisma.destination.create({ data });
  revalidateGrowth("/admin/destinations");
  redirect(`/admin/destinations/${created.id}/edit?saved=1`);
}

export async function archiveDestinationAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.destination.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateGrowth("/admin/destinations", "/admin/growth");
  redirect("/admin/destinations");
}

// ── Offers ───────────────────────────────────────────────────────────────────

export async function upsertOfferAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const data = {
    destinationId: str(formData, "destinationId"),
    type: str(formData, "type", "PRIVATE_SESSION") as Prisma.OfferCreateInput["type"],
    internalName: str(formData, "internalName"),
    publicNameFr: str(formData, "publicNameFr"),
    publicNameEn: str(formData, "publicNameEn"),
    publicNameEs: str(formData, "publicNameEs"),
    shortDescriptionFr: optStr(formData, "shortDescriptionFr"),
    shortDescriptionEn: optStr(formData, "shortDescriptionEn"),
    shortDescriptionEs: optStr(formData, "shortDescriptionEs"),
    durationMinutes: intOrNull(formData, "durationMinutes"),
    priceAmount: decimalOrNull(formData, "priceAmount"),
    currency: optStr(formData, "currency"),
    showPrice: bool(formData, "showPrice"),
    status: str(formData, "status", "DRAFT") as "DRAFT" | "READY" | "LIVE" | "PAUSED" | "ARCHIVED",
    primaryCtaFr: optStr(formData, "primaryCtaFr"),
    primaryCtaEn: optStr(formData, "primaryCtaEn"),
    primaryCtaEs: optStr(formData, "primaryCtaEs"),
  };

  if (id) {
    await prisma.offer.update({ where: { id }, data });
    revalidateGrowth("/admin/offers", `/admin/offers/${id}/edit`);
    redirect(`/admin/offers/${id}/edit?saved=1`);
  }

  const created = await prisma.offer.create({ data });
  revalidateGrowth("/admin/offers");
  redirect(`/admin/offers/${created.id}/edit?saved=1`);
}

export async function archiveOfferAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.offer.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateGrowth("/admin/offers", "/admin/growth");
  redirect("/admin/offers");
}

// ── WhatsApp ─────────────────────────────────────────────────────────────────

export async function upsertWhatsappChannelAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const data = {
    destinationId: str(formData, "destinationId"),
    label: str(formData, "label"),
    phoneE164: str(formData, "phoneE164"),
    provider: str(formData, "provider", "WHATSAPP_APP") as Prisma.WhatsappChannelCreateInput["provider"],
    status: str(formData, "status", "NOT_CONFIGURED") as Prisma.WhatsappChannelCreateInput["status"],
    defaultLocale: str(formData, "defaultLocale", "FR") as "FR" | "EN" | "ES",
    prefilledMessageFr: str(formData, "prefilledMessageFr"),
    prefilledMessageEn: str(formData, "prefilledMessageEn"),
    prefilledMessageEs: str(formData, "prefilledMessageEs"),
    ghlWorkflowHotLeadId: optStr(formData, "ghlWorkflowHotLeadId"),
    ghlWorkflowInfoNeededId: optStr(formData, "ghlWorkflowInfoNeededId"),
    ghlWorkflowBookingId: optStr(formData, "ghlWorkflowBookingId"),
    fallbackUrl: optStr(formData, "fallbackUrl"),
    ownerName: optStr(formData, "ownerName"),
    businessHours: (() => {
      const bh = optStr(formData, "businessHours");
      if (!bh) return {};
      try {
        return JSON.parse(bh);
      } catch {
        return {};
      }
    })(),
    notes: optStr(formData, "notes"),
  };

  if (id) {
    await prisma.whatsappChannel.update({ where: { id }, data });
    revalidateGrowth("/admin/whatsapp", `/admin/whatsapp/${id}/edit`);
    redirect(`/admin/whatsapp/${id}/edit?saved=1`);
  }

  const created = await prisma.whatsappChannel.create({ data });
  revalidateGrowth("/admin/whatsapp");
  redirect(`/admin/whatsapp/${created.id}/edit?saved=1`);
}

export async function archiveWhatsappChannelAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.whatsappChannel.update({ where: { id }, data: { status: "PAUSED" } });
  revalidateGrowth("/admin/whatsapp");
  redirect("/admin/whatsapp");
}

// ── Tracking ─────────────────────────────────────────────────────────────────

export async function upsertTrackingProfileAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const data = {
    destinationId: str(formData, "destinationId"),
    label: str(formData, "label"),
    metaPixelId: optStr(formData, "metaPixelId"),
    tiktokPixelId: optStr(formData, "tiktokPixelId"),
    ga4MeasurementId: optStr(formData, "ga4MeasurementId"),
    googleAdsId: optStr(formData, "googleAdsId"),
    gtmContainerId: optStr(formData, "gtmContainerId"),
    consentMode: str(formData, "consentMode", "basic"),
    enableMeta: bool(formData, "enableMeta"),
    enableTikTok: bool(formData, "enableTikTok"),
    enableGA4: bool(formData, "enableGA4"),
    enableGTM: bool(formData, "enableGTM"),
    enableGoogleAds: bool(formData, "enableGoogleAds"),
    status: str(formData, "status", "DRAFT") as "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED",
    notes: optStr(formData, "notes"),
  };

  if (id) {
    await prisma.trackingProfile.update({ where: { id }, data });
    revalidateGrowth("/admin/tracking", `/admin/tracking/${id}/edit`);
    redirect(`/admin/tracking/${id}/edit?saved=1`);
  }

  const created = await prisma.trackingProfile.create({ data });
  revalidateGrowth("/admin/tracking");
  redirect(`/admin/tracking/${created.id}/edit?saved=1`);
}

export async function archiveTrackingProfileAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.trackingProfile.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateGrowth("/admin/tracking");
  redirect("/admin/tracking");
}

// ── CRM Routing ──────────────────────────────────────────────────────────────

export async function upsertCrmRoutingRuleAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const localeRaw = str(formData, "locale");
  const offerTypeRaw = str(formData, "offerType");
  const data = {
    destinationId: str(formData, "destinationId"),
    locale: localeRaw ? (localeRaw as "FR" | "EN" | "ES") : null,
    offerType: offerTypeRaw ? (offerTypeRaw as Prisma.CrmRoutingRuleCreateInput["offerType"]) : null,
    source: optStr(formData, "source"),
    intent: optStr(formData, "intent"),
    leadSegment: optStr(formData, "leadSegment"),
    ghlPipelineId: optStr(formData, "ghlPipelineId"),
    ghlPipelineStageId: optStr(formData, "ghlPipelineStageId"),
    ghlWorkflowId: optStr(formData, "ghlWorkflowId"),
    ghlAssignedUserId: optStr(formData, "ghlAssignedUserId"),
    tags: (() => {
      const t = optStr(formData, "tags");
      if (!t) return [];
      try {
        if (t.trim().startsWith("[")) return JSON.parse(t);
      } catch {}
      return t.split(",").map(x => x.trim()).filter(Boolean);
    })(),
    customFields: (() => {
      const c = optStr(formData, "customFields");
      if (!c) return {};
      try {
        return JSON.parse(c);
      } catch {
        return {};
      }
    })(),
    priority: intOrNull(formData, "priority") ?? 100,
    status: str(formData, "status", "DRAFT") as "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED",
    notes: optStr(formData, "notes"),
  };

  if (id) {
    await prisma.crmRoutingRule.update({ where: { id }, data });
    revalidateGrowth("/admin/crm-routing", `/admin/crm-routing/${id}/edit`);
    redirect(`/admin/crm-routing/${id}/edit?saved=1`);
  }

  const created = await prisma.crmRoutingRule.create({ data });
  revalidateGrowth("/admin/crm-routing");
  redirect(`/admin/crm-routing/${created.id}/edit?saved=1`);
}

export async function archiveCrmRoutingRuleAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.crmRoutingRule.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateGrowth("/admin/crm-routing");
  redirect("/admin/crm-routing");
}

// ── Landings ─────────────────────────────────────────────────────────────────

export async function upsertLandingAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const baseData = {
    destinationId: str(formData, "destinationId"),
    offerId: optStr(formData, "offerId"),
    locale: str(formData, "locale", "FR") as "FR" | "EN" | "ES",
    template: str(formData, "template", "MOBILE_WHATSAPP_FIRST") as Prisma.LandingPageCreateInput["template"],
    slug: str(formData, "slug"),
    status: str(formData, "status", "DRAFT") as "DRAFT" | "READY" | "LIVE" | "PAUSED" | "ARCHIVED",
    heroTitle: str(formData, "heroTitle"),
    heroSubtitle: optStr(formData, "heroSubtitle"),
    microNote: optStr(formData, "microNote"),
    primaryCta: optStr(formData, "primaryCta"),
    secondaryCta: optStr(formData, "secondaryCta"),
    heroImageId: optStr(formData, "heroImageId"),
    ogImageId: optStr(formData, "ogImageId"),
    whatsappChannelId: optStr(formData, "whatsappChannelId"),
    trackingProfileId: optStr(formData, "trackingProfileId"),
    crmRoutingRuleId: optStr(formData, "crmRoutingRuleId"),
    seoTitle: optStr(formData, "seoTitle"),
    metaDescription: optStr(formData, "metaDescription"),
    canonical: optStr(formData, "canonical"),
    noindex: bool(formData, "noindex"),
    areaServed: optStr(formData, "areaServed"),
    complianceText: optStr(formData, "complianceText"),
    publishOverride: bool(formData, "publishOverride"),
    hreflangGroupId: optStr(formData, "hreflangGroupId"),
    xDefault: bool(formData, "xDefault"),
    painChips: parseJsonField(formData.get("painChips"), []),
    proofBadges: parseJsonField(formData.get("proofBadges"), []),
    processSteps: parseJsonField(formData.get("processSteps"), []),
    faq: parseJsonField(formData.get("faq"), []),
    content: parseJsonField(formData.get("content"), {}),
  };

  let landingId = id;
  if (id) {
    await prisma.landingPage.update({ where: { id }, data: baseData });
  } else {
    const created = await prisma.landingPage.create({ data: baseData });
    landingId = created.id;
  }

  const landing = await prisma.landingPage.findUniqueOrThrow({
    where: { id: landingId },
    include: growthLandingInclude,
  });
  const readiness = computeLandingReadiness(landing);
  await prisma.landingPage.update({
    where: { id: landingId },
    data: { readinessScore: readiness.score, readinessIssues: readiness.issues },
  });

  revalidateGrowth("/admin/landings", `/admin/landings/${landingId}/edit`, "/admin/growth");
  redirect(`/admin/landings/${landingId}/edit?saved=1`);
}

export async function publishLandingAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) throw new Error("ID manquant.");

  const landing = await prisma.landingPage.findUniqueOrThrow({
    where: { id },
    include: growthLandingInclude,
  });

  const override = bool(formData, "override") || landing.publishOverride;

  try {
    const readiness = assertCanPublish(landing, override);
    await prisma.landingPage.update({
      where: { id },
      data: {
        status: "LIVE",
        publishedAt: new Date(),
        readinessScore: readiness.score,
        readinessIssues: readiness.issues,
      },
    });
  } catch (err) {
    if (err instanceof PublishBlockedError) {
      redirect(`/admin/landings/${id}/edit?publishBlocked=1`);
    }
    throw err;
  }

  revalidateGrowth("/admin/landings", `/admin/landings/${id}/edit`, "/admin/growth");
  redirect(`/admin/landings/${id}/edit?published=1`);
}

export async function archiveLandingAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.landingPage.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateGrowth("/admin/landings", "/admin/growth");
  redirect("/admin/landings");
}

// ── Testimonials ─────────────────────────────────────────────────────────────

export async function upsertTestimonialAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const data = {
    displayName: str(formData, "displayName"),
    firstName: optStr(formData, "firstName"),
    locale: str(formData, "locale", "FR") as "FR" | "EN" | "ES",
    country: optStr(formData, "country"),
    city: optStr(formData, "city"),
    profile: optStr(formData, "profile"),
    occupation: optStr(formData, "occupation"),
    destinationId: optStr(formData, "destinationId"),
    offerId: optStr(formData, "offerId"),
    mediaAssetId: optStr(formData, "mediaAssetId"),
    posterImageId: optStr(formData, "posterImageId"),
    quoteShort: optStr(formData, "quoteShort"),
    quoteLong: optStr(formData, "quoteLong"),
    transcript: optStr(formData, "transcript"),
    subtitlesUrl: optStr(formData, "subtitlesUrl"),
    consentWebsite: bool(formData, "consentWebsite"),
    consentAds: bool(formData, "consentAds"),
    consentOrganic: bool(formData, "consentOrganic"),
    emotionalScore: intOrNull(formData, "emotionalScore") ?? 0,
    credibilityScore: intOrNull(formData, "credibilityScore") ?? 0,
    priority: intOrNull(formData, "priority") ?? 0,
    status: str(formData, "status", "DRAFT") as "DRAFT" | "READY" | "LIVE" | "ARCHIVED",
    notes: optStr(formData, "notes"),
  };

  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
    revalidateGrowth("/admin/testimonials", `/admin/testimonials/${id}/edit`);
    redirect(`/admin/testimonials/${id}/edit?saved=1`);
  }

  const created = await prisma.testimonial.create({ data });
  revalidateGrowth("/admin/testimonials");
  redirect(`/admin/testimonials/${created.id}/edit?saved=1`);
}

export async function archiveTestimonialAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.testimonial.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateGrowth("/admin/testimonials");
  redirect("/admin/testimonials");
}

// ── Experiments ──────────────────────────────────────────────────────────────

export async function upsertExperimentAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const startAtRaw = str(formData, "startAt");
  const endAtRaw = str(formData, "endAt");
  const data = {
    landingPageId: str(formData, "landingPageId"),
    name: str(formData, "name"),
    hypothesis: optStr(formData, "hypothesis"),
    status: str(formData, "status", "DRAFT") as "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED",
    primaryMetric: str(formData, "primaryMetric", "whatsapp_clicks"),
    startAt: startAtRaw ? new Date(startAtRaw) : null,
    endAt: endAtRaw ? new Date(endAtRaw) : null,
    notes: optStr(formData, "notes"),
  };

  const variantsRaw = formData.get("variants");
  const variantsList = parseJsonField(variantsRaw, []) as ExperimentVariantInput[];

  let experimentId = id;
  if (id) {
    await prisma.experiment.update({ where: { id }, data });
  } else {
    const created = await prisma.experiment.create({ data });
    experimentId = created.id;
  }

  // Gérer la synchronisation des variantes
  const existingVariants = await prisma.experimentVariant.findMany({
    where: { experimentId },
    select: { id: true },
  });
  const existingIds = existingVariants.map((v) => v.id);

  const keptIds = variantsList.map((v) => v.id).filter(Boolean);
  const deleteIds = existingIds.filter((x) => !keptIds.includes(x));

  if (deleteIds.length > 0) {
    await prisma.experimentVariant.deleteMany({
      where: { id: { in: deleteIds } },
    });
  }

  for (const v of variantsList) {
    const vData = {
      experimentId,
      name: v.name,
      trafficSplit: Number(v.trafficSplit || 50),
      heroTitle: v.heroTitle || null,
      heroSubtitle: v.heroSubtitle || null,
      primaryCta: v.primaryCta || null,
      testimonialId: v.testimonialId || null,
      contentOverrides:
        v.contentOverrides && typeof v.contentOverrides === "object"
          ? (v.contentOverrides as Prisma.InputJsonValue)
          : {},
    };

    if (v.id) {
      await prisma.experimentVariant.update({
        where: { id: v.id },
        data: vData,
      });
    } else {
      await prisma.experimentVariant.create({
        data: vData,
      });
    }
  }

  revalidateGrowth("/admin/experiments", `/admin/experiments/${experimentId}/edit`);
  redirect(`/admin/experiments/${experimentId}/edit?saved=1`);
}

export async function archiveExperimentAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.experiment.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateGrowth("/admin/experiments");
  redirect("/admin/experiments");
}

// ── Redirects ────────────────────────────────────────────────────────────────

export async function upsertRedirectRuleAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  const data = {
    sourcePath: str(formData, "sourcePath"),
    targetPath: str(formData, "targetPath"),
    statusCode: intOrNull(formData, "statusCode") ?? 301,
    active: bool(formData, "active"),
    reason: optStr(formData, "reason"),
  };

  if (id) {
    await prisma.redirectRule.update({ where: { id }, data });
    revalidateGrowth("/admin/redirects", `/admin/redirects/${id}/edit`);
    redirect(`/admin/redirects/${id}/edit?saved=1`);
  }

  const created = await prisma.redirectRule.create({ data });
  revalidateGrowth("/admin/redirects");
  redirect(`/admin/redirects/${created.id}/edit?saved=1`);
}

export async function archiveRedirectRuleAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.redirectRule.update({ where: { id }, data: { active: false } });
  revalidateGrowth("/admin/redirects");
  redirect("/admin/redirects");
}

export async function upsertMediaAssetAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = optStr(formData, "id");
  const assetTypeRaw = str(formData, "assetType", "IMAGE");
  const assetType: MediaAssetType = ["IMAGE", "VIDEO", "POSTER", "DOCUMENT"].includes(assetTypeRaw)
    ? (assetTypeRaw as MediaAssetType)
    : "IMAGE";
  const destinationId = optStr(formData, "destinationId");
  const altFr = optStr(formData, "altFr");
  const altEn = optStr(formData, "altEn");
  const altEs = optStr(formData, "altEs");
  const consentNotes = optStr(formData, "consentNotes");
  const usageNotes = optStr(formData, "usageNotes");
  const externalUrl = optStr(formData, "externalUrl");

  const baseData = {
    assetType,
    destinationId,
    altFr,
    altEn,
    altEs,
    consentNotes,
    usageNotes,
    externalUrl,
  };

  if (id) {
    await prisma.mediaAsset.update({
      where: { id },
      data: baseData,
    });
  } else {
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      const mimeTypes: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "application/pdf": "pdf",
      };
      const ext = mimeTypes[file.type] || "bin";
      const filename = `${uuidv4()}.${ext}`;

      await ensureUploadsDir();
      const localPath = getLocalPath(filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(localPath, buffer);
      const url = getUploadUrl(filename);

      await prisma.mediaAsset.create({
        data: {
          ...baseData,
          filename,
          originalName: file.name,
          mimeType: file.type,
          url,
          localPath,
          size: file.size,
        },
      });
    } else if (externalUrl) {
      const filename = `ext-${uuidv4()}`;
      await prisma.mediaAsset.create({
        data: {
          ...baseData,
          filename,
          originalName: "Lien externe",
          mimeType: "text/html",
          url: externalUrl,
          localPath: "",
          size: 0,
        },
      });
    } else {
      throw new Error("Veuillez fournir un fichier ou une URL externe.");
    }
  }

  revalidateGrowth("/admin/media");
  redirect("/admin/media");
}

export async function deleteMediaAssetAction(formData: FormData) {
  await requireGrowthAdmin();
  const id = str(formData, "id");
  if (!id) return;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: {
      landingHeroImages: { select: { id: true, heroTitle: true, slug: true, locale: true } },
      landingOgImages: { select: { id: true, heroTitle: true, slug: true, locale: true } },
      testimonialMedia: { select: { id: true, displayName: true } },
      testimonialPosters: { select: { id: true, displayName: true } },
    },
  });

  if (!asset) {
    redirect("/admin/media?deleteError=notfound");
    return;
  }

  const inUse =
    asset.landingHeroImages.length > 0 ||
    asset.landingOgImages.length > 0 ||
    asset.testimonialMedia.length > 0 ||
    asset.testimonialPosters.length > 0;

  if (inUse) {
    redirect(`/admin/media?deleteBlocked=1&editId=${id}`);
    return;
  }

  try {
    await prisma.mediaAsset.delete({ where: { id } });
  } catch {
    redirect(`/admin/media?deleteError=db&editId=${id}`);
    return;
  }

  if (asset.localPath) {
    await unlink(asset.localPath).catch(() => null);
  }

  revalidateGrowth("/admin/media");
  redirect("/admin/media?deleted=1");
}
