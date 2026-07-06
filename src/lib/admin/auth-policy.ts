export type LoginRateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
  lockMs: number;
};

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getSafeAdminRedirect(value: unknown) {
  if (typeof value !== "string") return "/admin/dashboard";
  if (!value.startsWith("/admin")) return "/admin/dashboard";
  if (value.startsWith("/admin/login")) return "/admin/dashboard";
  if (value.startsWith("//") || value.includes("://")) return "/admin/dashboard";
  return value;
}

export function computeLoginLock(
  failedAttemptDates: Date[],
  config: LoginRateLimitConfig,
  now = new Date()
) {
  const windowStart = new Date(now.getTime() - config.windowMs);
  const attemptsInWindow = failedAttemptDates
    .filter((createdAt) => createdAt >= windowStart)
    .sort((a, b) => b.getTime() - a.getTime());

  if (attemptsInWindow.length < config.maxAttempts) {
    return { locked: false, retryAfterSeconds: 0 };
  }

  const lockedUntil = new Date(attemptsInWindow[0].getTime() + config.lockMs);
  if (lockedUntil <= now) {
    return { locked: false, retryAfterSeconds: 0 };
  }

  return {
    locked: true,
    retryAfterSeconds: Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000),
  };
}
