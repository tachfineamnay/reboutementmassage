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
    title: "Grégory Tordjman — Méthode TMS® | Reboutement de précision",
    description:
      "Site officiel de Grégory Tordjman, créateur de la Méthode TMS®. Accompagnement manuel premium inspiré du reboutement pour clients privés, hôtels, villas, yachts, conciergeries et équipes spa.",
  },
  en: {
    title: "Grégory Tordjman — Méthode TMS® | Precise Manual Bodywork",
    description:
      "Official website of Grégory Tordjman, creator of the Méthode TMS®. Premium hands-on support inspired by French reboutement for private clients, hotels, villas, yachts, concierge teams and spa teams.",
  },
  es: {
    title: "Grégory Tordjman — Método TMS® | Reboutement de precisión",
    description:
      "Sitio oficial de Grégory Tordjman, creador del Método TMS®. Acompañamiento manual premium inspirado en el reboutement para clientes privados, hoteles, villas, yates, conserjerías y equipos spa.",
  },
};

export type LocalizedRouteKey =
  | "home"
  | "stories"
  | "biography"
  | "sessions"
  | "stagesWorkshops"
  | "luxuryHospitality";

export const LOCALIZED_ROUTES: Record<LocalizedRouteKey, Record<Locale, string>> = {
  home: { fr: "/fr", en: "/en", es: "/es" },
  stories: { fr: "/fr/stories", en: "/en/stories", es: "/es/stories" },
  biography: { fr: "/fr/biographie", en: "/en/biography", es: "/es/biografia" },
  sessions: { fr: "/fr/seances", en: "/en/sessions", es: "/es/sesiones" },
  stagesWorkshops: { fr: "/fr/stages-workshops", en: "/en/stages-workshops", es: "/es/stages-workshops" },
  luxuryHospitality: { fr: "/fr/hotellerie-luxe", en: "/en/luxury-hospitality", es: "/es/hospitalidad-lujo" },
};

const NON_CANONICAL_ROUTE_MAP = new Map<string, string>(
  Object.entries(LOCALIZED_ROUTES)
    .filter(([routeKey]) => routeKey !== "home")
    .flatMap(([, routes]) =>
      LOCALES.flatMap((targetLocale) =>
        LOCALES
          .filter((sourceLocale) => sourceLocale !== targetLocale)
          .map((sourceLocale) => {
            const sourceSlug = routes[sourceLocale].replace(/^\/(fr|en|es)/, "");
            return [`/${targetLocale}${sourceSlug}`, routes[targetLocale]] as const;
          })
          .filter(([from, to]) => from !== to)
      )
    )
);

export type JsonLd = Record<string, unknown>;

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.CANONICAL_HOST ||
    "http://localhost:3000";

  return normalizeSiteUrl(raw);
}

export function localePath(locale: Locale) {
  return `/${locale}`;
}

export function localizedPath(routeKey: LocalizedRouteKey, locale: Locale) {
  return LOCALIZED_ROUTES[routeKey][locale];
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

export function routeAlternates(routeKey: LocalizedRouteKey) {
  const routes = LOCALIZED_ROUTES[routeKey];
  return {
    "x-default": absoluteUrl(routes[DEFAULT_LOCALE]),
    fr: absoluteUrl(routes.fr),
    en: absoluteUrl(routes.en),
    es: absoluteUrl(routes.es),
  };
}

export function getCanonicalLocalizedPath(pathname: string) {
  const normalized = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
  return NON_CANONICAL_ROUTE_MAP.get(normalized) ?? null;
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const [, maybeLocale] = pathname.split("/");
  return maybeLocale && isLocale(maybeLocale) ? maybeLocale : null;
}

function entityId(fragment: string) {
  return `${absoluteUrl()}#${fragment}`;
}

export function renderJsonLd(data: JsonLd) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function createIdentityJsonLd(locale: Locale): JsonLd {
  const homeUrl = absoluteUrl(localizedPath("home", locale));
  const logoUrl = absoluteUrl("/logo-badge.png");
  const imageUrl = absoluteUrl("/portrait.webp");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": entityId("website"),
        name: "Méthode TMS® - Grégory Tordjman",
        url: absoluteUrl(),
        inLanguage: locale,
        publisher: { "@id": entityId("organization") },
      },
      {
        "@type": "Organization",
        "@id": entityId("organization"),
        name: "Méthode TMS®",
        legalName: "Grégory Tordjman - Méthode TMS®",
        alternateName: ["Reboutement TMS®", "Reboutement et Massage", "Formation Reboutement"],
        url: absoluteUrl(),
        logo: { "@type": "ImageObject", url: logoUrl },
        image: imageUrl,
        areaServed: ["France", "Caribbean", "Mexico", "International"],
        founder: { "@id": entityId("gregory-tordjman") },
        sameAs: [
          "https://formationreboutement.fr/",
          "https://reboutementmassage.fr/",
          "https://go.formationreboutement.fr/",
        ],
      },
      {
        "@type": "Person",
        "@id": entityId("gregory-tordjman"),
        name: "Grégory Tordjman",
        url: homeUrl,
        image: imageUrl,
        jobTitle: "Creator of the Méthode TMS® and manual bodywork practitioner",
        brand: { "@id": entityId("organization") },
        knowsAbout: [
          "Méthode TMS®",
          "Reboutement TMS®",
          "Reboutement",
          "Traditional French reboutement",
          "Manual bodywork",
          "Body reading",
          "Luxury hospitality",
          "Private client sessions",
          "Spa team training",
        ],
      },
    ],
  };
}

export function createWebPageJsonLd(params: {
  locale: Locale;
  routeKey: LocalizedRouteKey;
  title: string;
  description: string;
  aboutId?: string;
}): JsonLd {
  const url = absoluteUrl(localizedPath(params.routeKey, params.locale));
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: params.title,
    description: params.description,
    inLanguage: params.locale,
    isPartOf: { "@id": entityId("website") },
    ...(params.aboutId ? { about: { "@id": params.aboutId } } : {}),
  };
}

export function createArticleWebPageJsonLd(params: {
  locale: Locale;
  url: string;
  title: string;
  description?: string | null;
  aboutId?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": params.url,
    url: params.url,
    name: params.title,
    description: params.description ?? undefined,
    inLanguage: params.locale,
    isPartOf: { "@id": entityId("website") },
    ...(params.aboutId ? { about: { "@id": params.aboutId } } : {}),
  };
}

export function createProfessionalServiceJsonLd(params: {
  locale: Locale;
  routeKey: LocalizedRouteKey;
  name: string;
  description: string;
  serviceType: string[];
}): JsonLd {
  const url = absoluteUrl(localizedPath(params.routeKey, params.locale));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: params.name,
    description: params.description,
    url,
    image: absoluteUrl("/portrait.webp"),
    provider: { "@id": entityId("gregory-tordjman") },
    areaServed: ["France", "Caribbean", "Mexico", "International"],
    serviceType: params.serviceType,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      businessFunction: "http://purl.org/goodrelations/v1#ProvideService",
    },
  };
}

export function createB2BServiceJsonLd(locale: Locale): JsonLd {
  const url = absoluteUrl(localizedPath("luxuryHospitality", locale));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#b2b-service`,
    name: "Luxury hospitality manual bodywork and spa team training",
    description:
      "Bespoke Méthode TMS® support for luxury hotels, spas, villas, yachts, concierge teams and VIP guests.",
    url,
    provider: { "@id": entityId("gregory-tordjman") },
    serviceType: ["Hospitality training", "Spa team workshops", "VIP guest sessions", "On-site private consultations"],
    areaServed: ["Caribbean", "Mexico", "Europe", "International"],
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Luxury hotels, spas, villas, yachts and concierge teams",
      geographicArea: ["Caribbean", "Mexico", "International"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "B2B hospitality offers",
      itemListElement: [
        { "@type": "Offer", name: "Hospitality team training", businessFunction: "http://purl.org/goodrelations/v1#ProvideService" },
        { "@type": "Offer", name: "VIP guest sessions", businessFunction: "http://purl.org/goodrelations/v1#ProvideService" },
        { "@type": "Offer", name: "On-site spa protocol consultation", businessFunction: "http://purl.org/goodrelations/v1#ProvideService" },
      ],
    },
  };
}

export function createCourseJsonLd(locale: Locale): JsonLd {
  const url = absoluteUrl(localizedPath("stagesWorkshops", locale));
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: "Formation Méthode TMS®",
    description:
      "Manual training for practitioners, spa teams and hospitality professionals, with body reading, reboutement-inspired precision and responsible guest-centered practice.",
    url,
    provider: {
      "@type": "Person",
      "@id": entityId("gregory-tordjman"),
      name: "Grégory Tordjman",
      url: absoluteUrl(localizedPath("home", locale)),
    },
    teaches: [
      "Body reading",
      "Reboutement TMS®",
      "Traditional French reboutement principles",
      "Manual precision",
      "Spa team intervention protocols",
      "Guest-centered practice",
    ],
    audience: { "@type": "BusinessAudience", audienceType: "Practitioners, spa teams and hospitality professionals" },
    offers: {
      "@type": "Offer",
      url,
      availability: "https://schema.org/InStock",
      businessFunction: "http://purl.org/goodrelations/v1#ProvideService",
    },
    hasCourseInstance: [
      { "@type": "CourseInstance", name: "Online foundation training", courseMode: "online", inLanguage: locale },
      { "@type": "CourseInstance", name: "On-site hospitality workshop", courseMode: "onsite", inLanguage: locale },
    ],
  };
}

export function createEducationEventJsonLd(locale: Locale): JsonLd {
  const url = absoluteUrl(localizedPath("stagesWorkshops", locale));
  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    "@id": `${url}#education-event`,
    name: "Méthode TMS® hospitality workshop",
    description:
      "On-site training event for spa teams and practitioners working with high-end guests, focused on body reading, manual precision and reboutement-inspired practice.",
    url,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: { "@id": entityId("gregory-tordjman") },
    audience: { "@type": "BusinessAudience", audienceType: "Spa and hospitality teams" },
    teaches: "Méthode TMS® manual practice protocols",
    inLanguage: locale,
  };
}

export function createFaqJsonLd(faqs: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function createArticleJsonLd(params: {
  locale: Locale;
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | null;
  dateModified: string;
  wordCount?: number | null;
  keywords?: string[];
  about?: string[];
  mentions?: string[];
}): JsonLd {
  const toThings = (values?: string[]) =>
    values?.filter(Boolean).map((name) => ({ "@type": "Thing", name }));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${params.url}#article`,
    headline: params.title,
    description: params.description ?? undefined,
    url: params.url,
    image: params.image ?? undefined,
    datePublished: params.datePublished ?? undefined,
    dateModified: params.dateModified,
    inLanguage: params.locale,
    wordCount: params.wordCount ?? undefined,
    keywords: params.keywords?.length ? params.keywords : undefined,
    about: params.about?.length ? toThings(params.about) : undefined,
    mentions: params.mentions?.length ? toThings(params.mentions) : undefined,
    author: { "@id": entityId("gregory-tordjman") },
    publisher: { "@id": entityId("organization") },
    mainEntityOfPage: { "@type": "WebPage", "@id": params.url },
  };
}

export function graphJsonLd(nodes: JsonLd[]): JsonLd {
  const graph = nodes.flatMap((node) => {
    if (Array.isArray(node["@graph"])) return node["@graph"] as JsonLd[];
    return [node];
  });

  return {
    "@context": "https://schema.org",
    "@graph": graph.map((node) => {
      const nodeWithoutContext = { ...node };
      delete nodeWithoutContext["@context"];
      return nodeWithoutContext;
    }),
  };
}
