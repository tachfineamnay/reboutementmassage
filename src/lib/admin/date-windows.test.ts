import { afterEach, describe, expect, it, vi } from "vitest";
import { getReportingWindows, getUtcDateOnly } from "./date-windows";

describe("admin date windows", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds UTC date-only values for LandingMetricDaily", () => {
    expect(getUtcDateOnly(new Date("2026-07-06T17:45:00.000Z")).toISOString()).toBe(
      "2026-07-06T00:00:00.000Z"
    );
  });

  it("uses configured reporting timezone for DateTime windows", () => {
    vi.stubEnv("ADMIN_REPORTING_TIMEZONE", "UTC");
    const windows = getReportingWindows(new Date("2026-07-06T12:00:00.000Z"));

    expect(windows.today.start.toISOString()).toBe("2026-07-06T00:00:00.000Z");
    expect(windows.today.end.toISOString()).toBe("2026-07-07T00:00:00.000Z");
    expect(windows.currentWeek.start.toISOString()).toBe("2026-07-06T00:00:00.000Z");
    expect(windows.last7Days.metricStartDate.toISOString()).toBe("2026-06-30T00:00:00.000Z");
    expect(windows.last7Days.metricEndDate.toISOString()).toBe("2026-07-07T00:00:00.000Z");
  });
});
