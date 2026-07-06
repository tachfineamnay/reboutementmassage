import { describe, expect, it } from "vitest";
import { shouldTrackGrowthEvent } from "./TrackingProvider";

describe("TrackingProvider preview mode", () => {
  it("disables growth event tracking in preview", () => {
    expect(shouldTrackGrowthEvent(true)).toBe(false);
    expect(shouldTrackGrowthEvent(false)).toBe(true);
    expect(shouldTrackGrowthEvent()).toBe(true);
  });
});
