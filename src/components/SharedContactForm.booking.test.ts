import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  getGhlCalendarIntent,
  shouldUseGhlCalendarBeforeLocalSubmission,
} from "@/components/SharedContactForm";

const sharedContactFormSource = readFileSync("src/components/SharedContactForm.tsx", "utf8");

describe("SharedContactForm GHL calendar handoff", () => {
  it("routes booking intents to official GHL calendar intents", () => {
    expect(getGhlCalendarIntent("training")).toBe("training");
    expect(getGhlCalendarIntent("workshop")).toBe("workshop");
    expect(getGhlCalendarIntent("private_session", "callback")).toBe("callback");
    expect(getGhlCalendarIntent("hospitality_partner", "callback")).toBe("callback");
    expect(getGhlCalendarIntent("private_session", "ghl")).toBeNull();
  });

  it("opens calendars only when a configured public URL exists", () => {
    expect(
      shouldUseGhlCalendarBeforeLocalSubmission({
        status: "configured",
        intent: "training",
        lang: "FR",
        url: "https://calendar.example/training-fr",
        envVar: "NEXT_PUBLIC_GHL_CALENDAR_TRAINING_FR_URL",
      })
    ).toBe(true);
    expect(
      shouldUseGhlCalendarBeforeLocalSubmission({
        status: "missing",
        intent: "training",
        lang: "FR",
        url: null,
        envVar: "NEXT_PUBLIC_GHL_CALENDAR_TRAINING_FR_URL",
      })
    ).toBe(false);
  });

  it("does not keep simulated slots or local calendar confirmations in SharedContactForm", () => {
    expect(sharedContactFormSource).not.toContain("function generateSlots");
    expect(sharedContactFormSource).not.toContain("BookingExperience");
    expect(sharedContactFormSource).not.toContain("createGoogleCalendarUrl");
    expect(sharedContactFormSource).not.toContain("sf-scheduler");
    expect(sharedContactFormSource).not.toContain("selectedSlotStart");
    expect(sharedContactFormSource).not.toContain("internal_booking");
  });

  it("keeps a clear contact fallback when a public calendar URL is missing", () => {
    expect(sharedContactFormSource).toContain("calendarMissing");
    expect(sharedContactFormSource).toContain("contactFallback");
    expect(sharedContactFormSource).toContain("Missing public GHL calendar URL");
  });
});
