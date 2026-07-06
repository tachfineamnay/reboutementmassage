"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import {
  authenticateAdminUser,
  getSafeAdminRedirect,
  isAdminLoginLocked,
  normalizeAdminEmail,
  recordAdminAuditLog,
  recordAdminLoginAttempt,
} from "@/lib/admin/auth-hardening";
import { getClientIp } from "@/lib/rate-limit";
import { LoginSchema } from "@/lib/schemas";

type LoginState = { error: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const safeRedirect = getSafeAdminRedirect(formData.get("from"));
  const requestHeaders = await headers();
  const ipAddress = getClientIp(requestHeaders);

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Email ou mot de passe invalide." };
  }

  const email = normalizeAdminEmail(parsed.data.email);
  const { password } = parsed.data;
  const lock = await isAdminLoginLocked(email, ipAddress);

  if (lock.locked) {
    await recordAdminAuditLog({
      actorEmail: email,
      action: "admin.login.locked",
      resource: "admin_session",
      ipAddress,
      metadata: { retryAfterSeconds: lock.retryAfterSeconds },
    }).catch((error) => console.error("[auth] audit log failed", error));
    return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  const admin = await authenticateAdminUser(email, password);
  await recordAdminLoginAttempt(email, ipAddress, Boolean(admin));

  if (!admin) {
    await recordAdminAuditLog({
      actorEmail: email,
      action: "admin.login.failed",
      resource: "admin_session",
      ipAddress,
    }).catch((error) => console.error("[auth] audit log failed", error));
    return { error: "Identifiants incorrects." };
  }

  await recordAdminAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "admin.login.succeeded",
    resource: "admin_session",
    ipAddress,
  }).catch((error) => console.error("[auth] audit log failed", error));
  await createSession(admin.id, admin.email);

  redirect(safeRedirect);
}
