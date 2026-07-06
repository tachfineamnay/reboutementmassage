import { describe, expect, it } from "vitest";
import { computeLoginLock, getSafeAdminRedirect, normalizeAdminEmail } from "./auth-policy";

describe("admin auth policy", () => {
  it("normalizes admin email", () => {
    expect(normalizeAdminEmail(" Admin@Example.COM ")).toBe("admin@example.com");
  });

  it("sanitizes post-login redirects", () => {
    expect(getSafeAdminRedirect("/admin/dashboard")).toBe("/admin/dashboard");
    expect(getSafeAdminRedirect("/admin/login")).toBe("/admin/dashboard");
    expect(getSafeAdminRedirect("https://example.com/admin")).toBe("/admin/dashboard");
    expect(getSafeAdminRedirect("/fr")).toBe("/admin/dashboard");
  });

  it("locks after too many recent failures", () => {
    const now = new Date("2026-07-06T12:00:00.000Z");
    const attempts = [
      new Date("2026-07-06T11:59:00.000Z"),
      new Date("2026-07-06T11:58:00.000Z"),
      new Date("2026-07-06T11:57:00.000Z"),
    ];

    expect(
      computeLoginLock(attempts, { maxAttempts: 3, windowMs: 15 * 60_000, lockMs: 15 * 60_000 }, now)
    ).toEqual({ locked: true, retryAfterSeconds: 840 });
  });
});
