import type { Language } from "@/data/copy";
import type { ConversionIntent } from "@/config/conversionRoutes";

export type GhlCalendarIntent = Extract<ConversionIntent, "training" | "workshop" | "private_session">;

export type GhlCalendarResolution =
  | {
      status: "configured";
      intent: GhlCalendarIntent;
      lang: Language;
      url: string;
      envVar: string;
    }
  | {
      status: "missing";
      intent: GhlCalendarIntent;
      lang: Language;
      url: null;
      envVar: string;
    };

export type GhlCalendarEnv = {
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_FR_URL?: string;
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_EN_URL?: string;
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_ES_URL?: string;
  NEXT_PUBLIC_GHL_CALENDAR_WORKSHOP_URL?: string;
  NEXT_PUBLIC_GHL_CALENDAR_PRIVATE_SESSION_URL?: string;
};

export const PUBLIC_GHL_CALENDAR_ENV = {
  trainingFr: "NEXT_PUBLIC_GHL_CALENDAR_TRAINING_FR_URL",
  trainingEn: "NEXT_PUBLIC_GHL_CALENDAR_TRAINING_EN_URL",
  trainingEs: "NEXT_PUBLIC_GHL_CALENDAR_TRAINING_ES_URL",
  workshop: "NEXT_PUBLIC_GHL_CALENDAR_WORKSHOP_URL",
  privateSession: "NEXT_PUBLIC_GHL_CALENDAR_PRIVATE_SESSION_URL",
} as const;

export const bundledPublicGhlCalendarEnv: GhlCalendarEnv = {
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_FR_URL: process.env.NEXT_PUBLIC_GHL_CALENDAR_TRAINING_FR_URL,
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_EN_URL: process.env.NEXT_PUBLIC_GHL_CALENDAR_TRAINING_EN_URL,
  NEXT_PUBLIC_GHL_CALENDAR_TRAINING_ES_URL: process.env.NEXT_PUBLIC_GHL_CALENDAR_TRAINING_ES_URL,
  NEXT_PUBLIC_GHL_CALENDAR_WORKSHOP_URL: process.env.NEXT_PUBLIC_GHL_CALENDAR_WORKSHOP_URL,
  NEXT_PUBLIC_GHL_CALENDAR_PRIVATE_SESSION_URL: process.env.NEXT_PUBLIC_GHL_CALENDAR_PRIVATE_SESSION_URL,
};

function trimUrl(value: string | undefined) {
  const url = value?.trim();
  return url || null;
}

function resolveEnvVar(intent: GhlCalendarIntent, lang: Language): keyof GhlCalendarEnv {
  if (intent === "workshop") return PUBLIC_GHL_CALENDAR_ENV.workshop;
  if (intent === "private_session") return PUBLIC_GHL_CALENDAR_ENV.privateSession;
  if (lang === "EN") return PUBLIC_GHL_CALENDAR_ENV.trainingEn;
  if (lang === "ES") return PUBLIC_GHL_CALENDAR_ENV.trainingEs;
  return PUBLIC_GHL_CALENDAR_ENV.trainingFr;
}

export function resolveGhlCalendarUrl(
  intent: GhlCalendarIntent,
  lang: Language,
  env: GhlCalendarEnv = bundledPublicGhlCalendarEnv
): GhlCalendarResolution {
  const envVar = resolveEnvVar(intent, lang);
  const url = trimUrl(env[envVar]);

  if (!url) {
    return {
      status: "missing",
      intent,
      lang,
      url: null,
      envVar,
    };
  }

  return {
    status: "configured",
    intent,
    lang,
    url,
    envVar,
  };
}

export function isPublicGhlCalendarEnvVar(value: string) {
  return (Object.values(PUBLIC_GHL_CALENDAR_ENV) as string[]).includes(value);
}
