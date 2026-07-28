import { describe, expect, it } from "vitest";
import {
  PUBLIC_GHL_CALENDAR_ENV,
  isPublicGhlCalendarEnvVar,
  resolveGhlCalendarUrl,
  type GhlCalendarEnv,
} from "@/lib/ghl/calendar-resolver";

const env: GhlCalendarEnv = {
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_FR_URL: "https://calendar.example/training-fr",
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_EN_URL: "https://calendar.example/training-en",
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_ES_URL: "https://calendar.example/training-es",
  NEXT_PUBLIC_GHL_CALENDAR_WORKSHOP_URL: "https://calendar.example/workshop",
  NEXT_PUBLIC_GHL_CALENDAR_PRIVATE_SESSION_URL: "https://calendar.example/private-session",
};

describe("resolveGhlCalendarUrl", () => {
  it("resolves training calendars by language", () => {
    expect(resolveGhlCalendarUrl("training", "FR", env)).toMatchObject({
      status: "configured",
      url: "https://calendar.example/training-fr",
      envVar: PUBLIC_GHL_CALENDAR_ENV.trainingFr,
    });
    expect(resolveGhlCalendarUrl("training", "EN", env)).toMatchObject({
      status: "configured",
      url: "https://calendar.example/training-en",
      envVar: PUBLIC_GHL_CALENDAR_ENV.trainingEn,
    });
    expect(resolveGhlCalendarUrl("training", "ES", env)).toMatchObject({
      status: "configured",
      url: "https://calendar.example/training-es",
      envVar: PUBLIC_GHL_CALENDAR_ENV.trainingEs,
    });
  });

  it("resolves workshop and explicit private-session calendars", () => {
    expect(resolveGhlCalendarUrl("workshop", "FR", env)).toMatchObject({
      status: "configured",
      url: "https://calendar.example/workshop",
      envVar: PUBLIC_GHL_CALENDAR_ENV.workshop,
    });
    expect(resolveGhlCalendarUrl("private_session", "EN", env)).toMatchObject({
      status: "configured",
      url: "https://calendar.example/private-session",
      envVar: PUBLIC_GHL_CALENDAR_ENV.privateSession,
    });
  });

  it("returns the missing public env var instead of a fake calendar URL", () => {
    expect(resolveGhlCalendarUrl("training", "ES", {})).toEqual({
      status: "missing",
      intent: "training",
      lang: "ES",
      url: null,
      envVar: PUBLIC_GHL_CALENDAR_ENV.trainingEs,
    });
  });

  it("exposes only NEXT_PUBLIC calendar env keys", () => {
    for (const envVar of Object.values(PUBLIC_GHL_CALENDAR_ENV)) {
      expect(envVar.startsWith("NEXT_PUBLIC_GHL_CALENDAR_")).toBe(true);
      expect(isPublicGhlCalendarEnvVar(envVar)).toBe(true);
      expect(envVar).not.toContain("TOKEN");
      expect(envVar).not.toContain("SECRET");
      expect(envVar).not.toContain("LOCATION_ID");
    }
  });
});
