import { describe, expect, it } from "vitest";
import {
  GHL_SYSTEM_TAGS,
  isCanonicalGhlSystemTag,
  resolveGhlIntentValue,
} from "@/lib/ghl/crm-contract";

describe("GHL CRM contract", () => {
  it("maps internal intents to exact GHL values", () => {
    expect(resolveGhlIntentValue("training")).toBe("Training");
    expect(resolveGhlIntentValue("private_session")).toBe("Private Session");
  });

  it("preserves canonical system tags", () => {
    expect(GHL_SYSTEM_TAGS.sourceSitePremium).toBe("source-site-premium");
    expect(GHL_SYSTEM_TAGS.training).toBe("intent_training");
    expect(isCanonicalGhlSystemTag("source-site-premium")).toBe(true);
    expect(isCanonicalGhlSystemTag("intent_training")).toBe(true);
  });

  it("rejects unknown intent values", () => {
    expect(() => resolveGhlIntentValue("intent-training")).toThrow("UNKNOWN_GHL_INTENT");
  });
});
