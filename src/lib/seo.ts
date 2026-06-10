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
    title: "Grégory Tordjman — Méthode TMS® | Reboutement & thérapie manuelle de précision",
    description:
      "Grégory Tordjman, créateur de la Méthode TMS® et praticien manuel depuis 2006. Reboutement, massage et thérapie manuelle de précision : séances privées pour particuliers, hôtels, villas et yachts. Formations pour thérapeutes et praticiens spa.",
  },
  en: {
    title: "Grégory Tordjman — Méthode TMS® | Manual therapy & French bonesetting",
    description:
      "Grégory Tordjman, creator of the Méthode TMS® and hands-on practitioner since 2006. Reboutement, massage and precise manual therapy: private sessions for individuals, hotels, villas and yachts. Training for therapists and spa practitioners.",
  },
  es: {
    title: "Grégory Tordjman — Método TMS® | Terapia manual y reboutement",
    description:
      "Grégory Tordjman, creador del Método TMS® y practicante manual desde 2006. Reboutement, masaje y terapia manual de precisión: sesiones privadas para particulares, hoteles, villas y yates. Formaciones para terapeutas y profesionales spa.",
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
        name: "Grégory Tordjman — Méthode TMS®",
        alternateName: "Méthode TMS®",
        url: absoluteUrl(),
        inLanguage: locale,
        publisher: { "@id": entityId("organization") },
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl()}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": entityId("organization"),
        name: "Méthode TMS®",
        legalName: "Grégory Tordjman - Méthode TMS®",
        url: absoluteUrl(),
        foundingDate: "2014",
        logo: { "@type": "ImageObject", url: logoUrl, width: 300, height: 300 },
        image: imageUrl,
        description:
          "Méthode TMS® est une marque et une méthode d'accompagnement manuel créée par Grégory Tordjman en 2014, issue d'une pratique professionnelle du reboutement, du massage et de la thérapie manuelle de précision.",
        areaServed: ["France", "Caribbean", "Mexico", "International"],
        founder: { "@id": entityId("gregory-tordjman") },
        sameAs: [
          "https://www.formationreboutement.fr",
          "https://www.reboutementmassage.fr",
        ],
      },
      {
        "@type": "Person",
        "@id": entityId("gregory-tordjman"),
        name: "Grégory Tordjman",
        givenName: "Grégory",
        familyName: "Tordjman",
        url: homeUrl,
        image: {
          "@type": "ImageObject",
          url: imageUrl,
          caption: "Grégory Tordjman, créateur de la Méthode TMS®",
        },
        jobTitle: [
          "Créateur de la Méthode TMS®",
          "Praticien en reboutement et thérapie manuelle",
          "Creator of the Méthode TMS®",
          "Manual therapy practitioner",
        ],
        description:
          "Grégory Tordjman est un praticien manuel en activité depuis 2006, créateur de la Méthode TMS® en 2014. Il accompagne des particuliers, des équipes hospitality et des praticiens en formation grâce à une approche du reboutement, du massage et de la thérapie manuelle de précision.",
        brand: { "@id": entityId("organization") },
        foundingDate: "2014",
        knowsAbout: [
          "Méthode TMS®",
          "Reboutement TMS®",
          "Reboutement",
          "Reboutement traditionnel",
          "Traditional French bonesetting",
          "Thérapie manuelle de précision",
          "TMS® Manual Therapy",
          "Terapia manual TMS®",
          "Massage thérapeutique",
          "Accompagnement corporel",
          "Lecture corporelle",
          "Tensions musculaires",
          "Blocages corporels",
          "Mobilité articulaire",
          "Luxury hospitality",
          "Spa team training",
          "Formation reboutement",
          "Reconversion praticien bien-être",
        ],
        sameAs: [
          "https://www.formationreboutement.fr",
          "https://www.reboutementmassage.fr",
        ],
        worksFor: { "@id": entityId("organization") },
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
    areaServed: ["France", "International"],
    serviceType: params.serviceType,
  };
}

export function createB2BServiceJsonLd(locale: Locale): JsonLd {
  const url = absoluteUrl(localizedPath("luxuryHospitality", locale));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#b2b-service`,
    name: "Luxury hospitality hands-on support and spa team workshops",
    description:
      "Bespoke Méthode TMS® support for luxury hotels, five-star spas, villas, yachts, concierge teams and VIP guests.",
    url,
    provider: { "@id": entityId("gregory-tordjman") },
    serviceType: ["Hospitality workshops", "Spa team training", "Private guest sessions", "On-site consulting"],
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
        { "@type": "Offer", name: "Hospitality training", businessFunction: "http://purl.org/goodrelations/v1#ProvideService" },
        { "@type": "Offer", name: "VIP sessions", businessFunction: "http://purl.org/goodrelations/v1#ProvideService" },
        { "@type": "Offer", name: "Spa consulting", businessFunction: "http://purl.org/goodrelations/v1#ProvideService" },
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
      "Practical Méthode TMS® workshops for hands-on practitioners, spa professionals and hospitality teams, focused on observation, precise gesture, consent, boundaries and adaptation to context.",
    url,
    provider: {
      "@type": "Person",
      "@id": entityId("gregory-tordjman"),
      name: "Grégory Tordjman",
      url: absoluteUrl(localizedPath("home", locale)),
    },
    teaches: [
      "Body observation",
      "Adapted hands-on gestures",
      "Consent and professional boundaries",
      "Hospitality context and discretion",
    ],
    audience: { "@type": "BusinessAudience", audienceType: "Therapists, spa teams and hospitality professionals" },
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
