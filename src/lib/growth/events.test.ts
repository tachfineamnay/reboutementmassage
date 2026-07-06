import { describe, expect, it } from "vitest";
import {
  getExperimentVariantMetricUpdate,
  getLandingMetricField,
  normalizeGrowthLocale,
  toPublicGrowthEventName,
} from "./events";

describe("growth events", () => {
  it("normalizes public locale variants", () => {
    expect(normalizeGrowthLocale("fr")).toBe("FR");
    expect(normalizeGrowthLocale("en-US")).toBe("EN");
    expect(normalizeGrowthLocale("ES")).toBe("ES");
    expect(normalizeGrowthLocale("de")).toBeUndefined();
  });

  it("allowlists event names", () => {
    expect(toPublicGrowthEventName("landing_viewed")).toBe("landing_viewed");
    expect(toPublicGrowthEventName("page_view")).toBeUndefined();
  });

  it("keeps form submissions separate from true leads", () => {
    expect(getLandingMetricField("form_submitted")).toBe("formSubmits");
    expect(getLandingMetricField("lead_created")).toBe("leads");
  });

  it("does not increment variant leads for form submissions", () => {
    expect(getExperimentVariantMetricUpdate("form_submitted")).toEqual({
      formSubmits: { increment: 1 },
    });
  });
});
