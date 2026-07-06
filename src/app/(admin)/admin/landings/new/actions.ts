"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { recordAdminAuditLog } from "@/lib/admin/auth-hardening";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeLandingBuilderReadiness } from "@/lib/admin/builder/landing-builder-readiness";
import { mapBuilderToLandingDraft } from "@/lib/admin/builder/landing-builder-mapper";
import { LandingBuilderSchema } from "@/lib/admin/builder/landing-builder-schema";
import { computePuckReadiness } from "@/lib/builder/puck-readiness";
import { growthLandingInclude } from "@/lib/growth/types";

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function bool(formData: FormData, key: string, fallback = false) {
  const value = formData.get(key);
  if (value == null) return fallback;
  return value === "on" || value === "true" || value === "1";
}

function lines(formData: FormData, key: string) {
  return text(formData, key)
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function selectedValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function badgeRows(formData: FormData) {
  return [1, 2, 3]
    .map((index) => ({
      value: text(formData, `proofBadge${index}Value`),
      label: text(formData, `proofBadge${index}Label`),
    }))
    .filter((badge) => badge.value && badge.label);
}

function optionsFromTextarea(formData: FormData, key: string) {
  return text(formData, key)
    .split(/\r?\n/)
    .map((line) => {
      const [value, ...labelParts] = line.split("|");
      const cleanValue = value?.trim() ?? "";
      const label = labelParts.join("|").trim() || cleanValue;
      return { value: cleanValue, label };
    })
    .filter((option) => option.value && option.label);
}

function payloadFromFormData(formData: FormData) {
  const testimonialIds = selectedValues(formData, "testimonialIds");

  return {
    market: {
      destinationId: text(formData, "destinationId"),
      locale: text(formData, "locale", "FR"),
      slug: text(formData, "slug"),
      template: text(formData, "template", "MOBILE_WHATSAPP_FIRST"),
    },
    offer: {
      offerId: text(formData, "offerId"),
      whatsappChannelId: text(formData, "whatsappChannelId"),
      trackingProfileId: text(formData, "trackingProfileId"),
      crmRoutingRuleId: text(formData, "crmRoutingRuleId"),
    },
    hero: {
      heroTitle: text(formData, "heroTitle"),
      heroSubtitle: text(formData, "heroSubtitle"),
      microNote: text(formData, "microNote"),
      primaryCta: text(formData, "primaryCta", "WhatsApp"),
      secondaryCta: text(formData, "secondaryCta", "Réserver"),
      heroImageId: text(formData, "heroImageId"),
      imageAlt: text(formData, "imageAlt"),
    },
    proof: {
      badges: badgeRows(formData),
      painChips: lines(formData, "painChips"),
      processSteps: lines(formData, "processSteps"),
      testimonialIds,
    },
    conversion: {
      leadSegment: text(formData, "leadSegment", "b2c_premium"),
      formHeadline: text(formData, "formHeadline", "Demande rapide"),
      urgencyOptions: optionsFromTextarea(formData, "urgencyOptions"),
      complianceText: text(formData, "complianceText"),
    },
    seo: {
      seoTitle: text(formData, "seoTitle"),
      metaDescription: text(formData, "metaDescription"),
      canonical: text(formData, "canonical"),
      noindex: bool(formData, "noindex", true),
      xDefault: bool(formData, "xDefault"),
      hreflangGroupId: text(formData, "hreflangGroupId"),
    },
  };
}

export async function createLandingFromBuilderAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Non authentifié.");
  }

  await ensureAdminSchema();

  const input = LandingBuilderSchema.parse(payloadFromFormData(formData));
  const readiness = computeLandingBuilderReadiness(input);
  const data = mapBuilderToLandingDraft(input);

  let landingId: string | null = null;
  let duplicateSlug = false;

  try {
    const created = await prisma.landingPage.create({
      data: {
        ...data,
        noindex: true,
        readinessScore: readiness.score,
        readinessIssues: readiness.issues as Prisma.InputJsonValue,
      },
      include: growthLandingInclude,
    });
    landingId = created.id;
    const puckReadiness = computePuckReadiness(created);
    await prisma.landingPage.update({
      where: { id: created.id },
      data: {
        readinessScore: puckReadiness.score,
        readinessIssues: puckReadiness.issues as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      duplicateSlug = true;
    } else {
      throw error;
    }
  }

  if (duplicateSlug || !landingId) {
    redirect("/admin/pages/new?error=duplicate");
  }

  await recordAdminAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: "growth.landing.builder.create",
    resource: "landingPage",
    resourceId: landingId,
  }).catch((error) => console.error("[landing-builder] audit log failed", error));

  revalidatePath("/admin/landings");
  revalidatePath("/admin/pages");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/landings/${landingId}/edit`);
  revalidatePath(`/admin/pages/${landingId}/studio`);
  redirect(`/admin/pages/${landingId}/studio?created=1`);
}
