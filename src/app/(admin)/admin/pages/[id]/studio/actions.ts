"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { recordAdminAuditLog } from "@/lib/admin/auth-hardening";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { getSession } from "@/lib/auth";
import { parsePuckData } from "@/lib/builder/puck-data-schema";
import { computePuckReadiness, type PuckReadinessResult } from "@/lib/builder/puck-readiness";
import { revalidateLandingStudioPaths } from "@/lib/builder/puck-utils";
import { growthLandingInclude, type LandingPageWithRelations } from "@/lib/growth/types";
import { prisma } from "@/lib/prisma";

export type StudioActionResult =
  | { ok: true; readiness: PuckReadinessResult; previewToken?: string }
  | { ok: false; message: string; readiness?: PuckReadinessResult };

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié.");
  return session;
}

async function getLanding(landingId: string) {
  const landing = await prisma.landingPage.findUnique({
    where: { id: landingId },
    include: growthLandingInclude,
  });
  if (!landing) throw new Error("Landing introuvable.");
  return landing;
}

function mergeContent(content: unknown, data: unknown) {
  const base =
    typeof content === "object" && content !== null && !Array.isArray(content)
      ? (content as Record<string, unknown>)
      : {};
  return {
    ...base,
    editor: "puck",
    builderVersion: 1,
    puckData: data,
  } as Prisma.InputJsonValue;
}

async function audit(
  session: Awaited<ReturnType<typeof requireSession>>,
  action: string,
  landingId: string,
  metadata?: Prisma.InputJsonValue
) {
  await recordAdminAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action,
    resource: "landingPage",
    resourceId: landingId,
    metadata,
  }).catch((error) => console.error("[landing-studio] audit log failed", error));
}

export async function savePuckDataAction(landingId: string, payload: unknown): Promise<StudioActionResult> {
  const session = await requireSession();
  await ensureAdminSchema();
  const data = parsePuckData(payload);
  const landing = await getLanding(landingId);
  const content = mergeContent(landing.content, data);
  const nextLanding = { ...landing, content } as LandingPageWithRelations;
  const readiness = computePuckReadiness(nextLanding);

  await prisma.landingPage.update({
    where: { id: landingId },
    data: {
      content,
      readinessScore: readiness.score,
      readinessIssues: readiness.issues as Prisma.InputJsonValue,
      status: landing.status === "LIVE" ? "LIVE" : "DRAFT",
    },
  });

  await audit(session, "growth.landing.studio.save", landingId, {
    readinessScore: readiness.score,
    issueCount: readiness.issues.length,
  });

  revalidateLandingStudioPaths(landing);
  return { ok: true, readiness };
}

export async function publishLandingAction(landingId: string): Promise<StudioActionResult> {
  const session = await requireSession();
  await ensureAdminSchema();
  const landing = await getLanding(landingId);
  const readiness = computePuckReadiness(landing);

  if (!readiness.canPublish) {
    await audit(session, "growth.landing.studio.publish_blocked", landingId, {
      readinessScore: readiness.score,
      issues: readiness.issues,
    });
    return {
      ok: false,
      message: "Publication bloquée : readiness < 80 ou issue critique.",
      readiness,
    };
  }

  await prisma.landingPage.update({
    where: { id: landingId },
    data: {
      status: "LIVE",
      noindex: false,
      publishedAt: new Date(),
      readinessScore: readiness.score,
      readinessIssues: readiness.issues as Prisma.InputJsonValue,
    },
  });

  await audit(session, "growth.landing.studio.publish", landingId, {
    readinessScore: readiness.score,
  });

  revalidateLandingStudioPaths(landing);
  return { ok: true, readiness };
}

export async function unpublishLandingAction(landingId: string): Promise<StudioActionResult> {
  const session = await requireSession();
  await ensureAdminSchema();
  const landing = await getLanding(landingId);
  const readiness = computePuckReadiness(landing);

  await prisma.landingPage.update({
    where: { id: landingId },
    data: {
      status: "PAUSED",
      noindex: true,
      readinessScore: readiness.score,
      readinessIssues: readiness.issues as Prisma.InputJsonValue,
    },
  });

  await audit(session, "growth.landing.studio.unpublish", landingId, {
    readinessScore: readiness.score,
  });

  revalidateLandingStudioPaths(landing);
  return { ok: true, readiness };
}

export async function archiveLandingAction(landingId: string): Promise<StudioActionResult> {
  const session = await requireSession();
  await ensureAdminSchema();
  const landing = await getLanding(landingId);
  const readiness = computePuckReadiness(landing);

  await prisma.landingPage.update({
    where: { id: landingId },
    data: {
      status: "ARCHIVED",
      noindex: true,
      readinessScore: readiness.score,
      readinessIssues: readiness.issues as Prisma.InputJsonValue,
    },
  });

  await audit(session, "growth.landing.studio.archive", landingId, {
    readinessScore: readiness.score,
  });

  revalidateLandingStudioPaths(landing);
  return { ok: true, readiness };
}

export async function generatePreviewTokenAction(landingId: string): Promise<StudioActionResult> {
  const session = await requireSession();
  await ensureAdminSchema();
  const landing = await getLanding(landingId);
  const previewToken = randomUUID();
  const readiness = computePuckReadiness(landing);

  await prisma.landingPage.update({
    where: { id: landingId },
    data: { previewToken },
  });

  await audit(session, "growth.landing.studio.preview_token", landingId);

  revalidatePath(`/admin/pages/${landingId}/studio`);
  revalidateLandingStudioPaths(landing);
  return { ok: true, readiness, previewToken };
}
