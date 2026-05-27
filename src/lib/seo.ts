import type { Language } from "@/data/copy";

export const DEFAULT_LOCALE = "fr";
export const LOCALES = ["fr", "en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_TO_LANGUAGE: Record<Locale, Language> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

export const LANGUAGE_TO_LOCALE: Record<Language, Locale> = {
  FR: "fr",
  EN: "en",
  ES: "es",
};

export const LOCALE_LABELS: Record<Language, string> = {
  FR: "FR",
  EN: "EN",
  ES: "ES",
};

export const META_BY_LOCALE: Record<Locale, { title: string; description: string }> = {
  fr: {
    title: "Grégory Tordjman — Méthode TMS® | Thérapie manuelle privée",
    description:
      "Demande privée pour thérapie manuelle, reboutement et massage thérapeutique avec Grégory Tordjman. Intervention discrète pour hôtels, villas, yachts, équipes et clients privés.",
  },
  en: {
    title: "Grégory Tordjman — TMS Method | Private Manual Therapy",
    description:
      "Private request for manual therapy, French bodywork and therapeutic massage with Grégory Tordjman. Discreet support for hotels, villas, yachts, teams and private clients.",
  },
  es: {
    title: "Grégory Tordjman — Método TMS® | Terapia manual privada",
    description:
      "Solicitud privada de terapia manual, reboutement y masaje terapéutico con Grégory Tordjman. Intervención discreta para hoteles, villas, yates, equipos y clientes privados.",
  },
};

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function localePath(locale: Locale) {
  return `/${locale}`;
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function languageAlternates() {
  return {
    "x-default": absoluteUrl(localePath(DEFAULT_LOCALE)),
    fr: absoluteUrl("/fr"),
    en: absoluteUrl("/en"),
    es: absoluteUrl("/es"),
  };
}
