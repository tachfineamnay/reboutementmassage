import "server-only";

import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import {
  computeLoginLock,
  getSafeAdminRedirect,
  normalizeAdminEmail,
} from "@/lib/admin/auth-policy";
import { getLoginRateLimitConfig } from "@/lib/admin/date-windows";
import { prisma } from "@/lib/prisma";

export { getSafeAdminRedirect, normalizeAdminEmail };

export async function ensureBootstrapAdminUser() {
  const existing = await prisma.adminUser.count();
  if (existing > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  await prisma.adminUser.create({
    data: {
      email: normalizeAdminEmail(email),
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
}

export async function isAdminLoginLocked(email: string, ipAddress: string, now = new Date()) {
  const config = getLoginRateLimitConfig();
  const lookbackMs = Math.max(config.windowMs, config.lockMs);
  const lookback = new Date(now.getTime() - lookbackMs);
  const attempts = await prisma.adminLoginAttempt.findMany({
    where: {
      success: false,
      createdAt: { gte: lookback },
      OR: [{ email }, { ipAddress }],
    },
    orderBy: { createdAt: "desc" },
    take: config.maxAttempts,
  });

  return computeLoginLock(
    attempts.map((attempt) => attempt.createdAt),
    config,
    now
  );
}

export async function recordAdminLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean
) {
  await prisma.adminLoginAttempt.create({
    data: {
      email,
      ipAddress,
      success,
    },
  });
}

export async function authenticateAdminUser(email: string, password: string) {
  await ensureBootstrapAdminUser();
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return null;

  const ok = await bcrypt.compare(password, admin.passwordHash);
  return ok ? admin : null;
}

export async function recordAdminAuditLog({
  actorId,
  actorEmail,
  action,
  resource,
  resourceId,
  ipAddress,
  metadata,
}: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  resource?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.adminAuditLog.create({
    data: {
      actorId: actorId ?? undefined,
      actorEmail: actorEmail ?? undefined,
      action,
      resource: resource ?? undefined,
      resourceId: resourceId ?? undefined,
      ipAddress: ipAddress ?? undefined,
      metadata: metadata ?? {},
    },
  });
}
