import {
  absoluteUrl,
  LOCALIZED_ROUTES,
  LOCALES,
  type Locale,
} from "@/lib/seo";

const INTRO_BY_LOCALE: Record<Locale, string> = {
  fr: "Méthode TMS® est le site officiel de Grégory Tordjman. Le site présente une approche manuelle de précision inspirée du reboutement, la lecture corporelle, les séances privées, les formations et les interventions pour hôtels, villas, yachts, conciergeries et équipes spa.",
  en: "Méthode TMS® is the official website of Grégory Tordjman. The site presents a precise hands-on approach inspired by traditional French reboutement, body reading, private sessions, training and interventions for hotels, villas, yachts, concierge teams and spa teams.",
  es: "Método TMS® es el sitio oficial de Grégory Tordjman. El sitio presenta un enfoque manual de precisión inspirado en el reboutement tradicional francés, la lectura corporal, las sesiones privadas, las formaciones y las intervenciones para hoteles, villas, yates, conserjerías y equipos spa.",
};

const NOTES_BY_LOCALE: Record<Locale, string[]> = {
  fr: [
    "Entités principales : Grégory Tordjman, Méthode TMS®, Reboutement TMS®, Reboutement et Massage, Formation Reboutement.",
    "Positionnement : accompagnement manuel premium, séances privées, formations, hospitality, villas, yachts et équipes spa.",
    "Lecture conseillée : commencer par la home, puis biographie, séances, formations, hospitality et stories.",
    "Cadre éditorial : contenus people-first, définitions courtes, FAQ visibles, preuves contextualisées et formulations responsables.",
  ],
  en: [
    "Primary entities: Grégory Tordjman, Méthode TMS®, Reboutement TMS®, Reboutement et Massage, Formation Reboutement.",
    "Positioning: premium manual support, private sessions, training, hospitality, villas, yachts and spa teams.",
    "Recommended reading path: start with the home page, then biography, sessions, training, hospitality and stories.",
    "Editorial frame: people-first content, short definitions, visible FAQs, contextual proof and responsible wording.",
  ],
  es: [
    "Entidades principales: Grégory Tordjman, Método TMS®, Reboutement TMS®, Reboutement et Massage, Formation Reboutement.",
    "Posicionamiento: acompañamiento manual premium, sesiones privadas, formaciones, hospitality, villas, yates y equipos spa.",
    "Ruta recomendada: empezar por la home, luego biografía, sesiones, formaciones, hospitality y stories.",
    "Marco editorial: contenidos people-first, definiciones cortas, FAQ visibles, pruebas contextualizadas y formulaciones responsables.",
  ],
};

function link(title: string, href: string, description: string) {
  return `- [${title}](${absoluteUrl(href)}): ${description}`;
}

export function buildLlmsTxt(locale?: Locale) {
  const lang = locale ?? "fr";
  const intro = INTRO_BY_LOCALE[lang];
  const notes = NOTES_BY_LOCALE[lang];
  const routes = LOCALIZED_ROUTES;
  const preferredTargets = [
    routes.home[lang],
    routes.biography[lang],
    routes.sessions[lang],
    routes.stagesWorkshops[lang],
    routes.luxuryHospitality[lang],
    routes.stories[lang],
  ];

  const sections = [
    "# Méthode TMS® - Grégory Tordjman",
    "",
    `> ${intro}`,
    "",
    "Important notes:",
    ...notes.map((note) => `- ${note}`),
    "",
    "## Preferred crawl targets",
    ...preferredTargets.map((href) => `- ${absoluteUrl(href)}`),
    "",
    "## Core Pages",
    link("Home", routes.home[lang], "Primary landing page for the Méthode TMS® entity, premium positioning, private requests and direct answer blocks."),
    link("Biography", routes.biography[lang], "Background, field experience, author authority and entity clarification for Grégory Tordjman."),
    link("Private sessions", routes.sessions[lang], "Private manual sessions for homes, hotels, villas and yachts, including process, settings and request flow."),
    link("Stages and workshops", routes.stagesWorkshops[lang], "Training and workshop offers for practitioners, spa teams and hospitality professionals."),
    link("Luxury hospitality", routes.luxuryHospitality[lang], "B2B page for luxury hotels, villas, yachts, concierge teams and VIP guest support."),
    link("Stories", routes.stories[lang], "Published articles, body-reading insights, FAQs, experience notes and updated editorial content."),
    "",
    "## Language Versions",
    ...LOCALES.map((availableLocale) =>
      link(
        `${availableLocale.toUpperCase()} llms.txt`,
        `/${availableLocale}/llms.txt`,
        `Localized AI-readable overview for ${availableLocale.toUpperCase()} content.`
      )
    ),
    "",
    "## Optional",
    link("Sitemap", "/sitemap.xml", "Complete crawlable sitemap with localized alternates."),
    link("Robots", "/robots.txt", "Crawler permissions for search engines and AI crawlers."),
  ];

  return `${sections.join("\n")}\n`;
}

export function llmsTxtResponse(locale?: Locale) {
  return new Response(buildLlmsTxt(locale), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
