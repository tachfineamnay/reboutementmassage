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
    title: "Grégory Tordjman — Méthode TMS® | Reboutement & thérapie manuelle",
    description:
      "Demande privée pour reboutement TMS®, thérapie manuelle de précision et massage thérapeutique avec Grégory Tordjman. Intervention discrète pour hôtels, villas, yachts, équipes et clients privés.",
  },
  en: {
    title: "Grégory Tordjman — TMS® Manual Therapy | French Bonesetting",
    description:
      "Private request for TMS® Manual Therapy, a precise hands-on approach inspired by traditional French bonesetting, therapeutic bodywork and deep body reading. Discreet support for hotels, villas, yachts, teams and private clients.",
  },
  es: {
    title: "Grégory Tordjman — Método TMS® | Terapia manual privada",
    description:
      "Solicitud privada de Terapia manual TMS®, inspirada en el reboutement tradicional francés, la lectura corporal y el masaje terapéutico profundo. Intervención discreta para hoteles, villas, yates, equipos y clientes privados.",
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

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
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
        name: "Méthode TMS®",
        url: absoluteUrl(),
        inLanguage: locale,
        publisher: { "@id": entityId("organization") },
      },
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": entityId("organization"),
        name: "Méthode TMS®",
        legalName: "Grégory Tordjman - Méthode TMS®",
        url: absoluteUrl(),
        logo: { "@type": "ImageObject", url: logoUrl },
        image: imageUrl,
        priceRange: "$$$",
        areaServed: ["France", "Caribbean", "Mexico", "International"],
        founder: { "@id": entityId("gregory-tordjman") },
      },
      {
        "@type": "Person",
        "@id": entityId("gregory-tordjman"),
        name: "Grégory Tordjman",
        url: homeUrl,
        image: imageUrl,
        jobTitle: "Manual therapy practitioner and creator of the Méthode TMS®",
        brand: { "@id": entityId("organization") },
        knowsAbout: [
          "Méthode TMS®",
          "Reboutement TMS®",
          "Reboutement",
          "Traditional French bonesetting",
          "TMS® Manual Therapy",
          "Terapia manual TMS®",
          "Manual therapy",
          "Therapeutic massage",
          "Luxury hospitality",
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
    "@type": "ProfessionalService",
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
    name: "Luxury hospitality manual therapy and spa team training",
    description:
      "Bespoke Méthode TMS® support for luxury hotels, five-star spas, villas, yachts, concierge teams and VIP guests.",
    url,
    provider: { "@id": entityId("gregory-tordjman") },
    serviceType: ["Hospitality training", "Spa team workshops", "VIP manual therapy sessions", "On-site private consultations"],
    areaServed: ["Caribbean", "Mexico", "Europe", "International"],
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Luxury hotels, five-star spas, villas, yachts and concierge teams",
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
      "Manual therapy training for therapists, spa practitioners and hospitality teams, with body reading, reboutement-inspired precision and therapeutic bodywork protocols.",
    url,
    provider: { "@id": entityId("gregory-tordjman") },
    teaches: [
      "Manual assessment",
      "Reboutement TMS®",
      "Traditional French bonesetting principles",
      "Therapeutic bodywork",
      "Spa team intervention protocols",
      "Guest-centered relief techniques",
    ],
    audience: { "@type": "BusinessAudience", audienceType: "Therapists, spa teams and hospitality professionals" },
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
      "On-site training event for spa teams and therapists working with high-end guests, focused on manual therapy, body reading and reboutement-inspired precision.",
    url,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: { "@id": entityId("gregory-tordjman") },
    audience: { "@type": "BusinessAudience", audienceType: "Spa and hospitality teams" },
    teaches: "Méthode TMS® manual therapy protocols",
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
}): JsonLd {
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
