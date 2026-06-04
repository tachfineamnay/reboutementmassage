import {
  absoluteUrl,
  LOCALIZED_ROUTES,
  LOCALES,
  type Locale,
} from "@/lib/seo";

const INTRO_BY_LOCALE: Record<Locale, string> = {
  fr: "Méthode TMS® est le site officiel de Grégory Tordjman, praticien expert en thérapie manuelle, reboutement et massage thérapeutique haut de gamme. Il intervient auprès de clients privés, hôtels de luxe, spas cinq étoiles, villas, yachts et équipes hospitality.",
  en: "Méthode TMS® is the official website of Grégory Tordjman, an expert manual therapy, French bodywork and therapeutic massage practitioner. He supports private clients, luxury hotels, five-star spas, villas, yachts and hospitality teams.",
  es: "Método TMS® es el sitio oficial de Grégory Tordjman, experto en terapia manual, reboutement y masaje terapéutico de alta gama. Atiende a clientes privados, hoteles de lujo, spas cinco estrellas, villas, yates y equipos hospitality.",
};

const NOTES_BY_LOCALE: Record<Locale, string[]> = {
  fr: [
    "Expertise principale : soulagement manuel, lecture corporelle, reboutement TMS®, accompagnement premium et formation d'équipes spa.",
    "Offres B2B : hospitality training, ateliers sur site, protocoles pour spas, sessions VIP et consultations discrètes.",
    "Mobilité : interventions internationales sur demande, notamment Caraïbes, Mexique, villas, yachts et établissements haut de gamme.",
  ],
  en: [
    "Core expertise: manual relief work, body reading, TMS® bodywork, premium support and spa team training.",
    "B2B offers: hospitality training, on-site workshops, spa protocols, VIP sessions and discreet consultations.",
    "Mobility: international interventions on request, including the Caribbean, Mexico, villas, yachts and high-end properties.",
  ],
  es: [
    "Expertise principal: alivio manual, lectura corporal, reboutement TMS®, acompañamiento premium y formación de equipos spa.",
    "Ofertas B2B: hospitality training, talleres in situ, protocolos para spas, sesiones VIP y consultas discretas.",
    "Movilidad: intervenciones internacionales bajo solicitud, especialmente Caribe, México, villas, yates y establecimientos de alta gama.",
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

  const sections = [
    "# Méthode TMS® - Grégory Tordjman",
    "",
    `> ${intro}`,
    "",
    "Important notes:",
    ...notes.map((note) => `- ${note}`),
    "",
    "## Core Pages",
    link("Home", routes.home[lang], "Primary landing page for private sessions, luxury hospitality positioning and direct contact."),
    link("Biography", routes.biography[lang], "Background, authority and expertise of Grégory Tordjman."),
    link("Private sessions", routes.sessions[lang], "Private manual therapy sessions for homes, hotels, villas and yachts."),
    link("Stages and workshops", routes.stagesWorkshops[lang], "Training offers for therapists, spa teams and hospitality professionals."),
    link("Luxury hospitality", routes.luxuryHospitality[lang], "B2B offer for luxury hotels, five-star spas, villas, yachts and VIP guest support."),
    link("Stories", routes.stories[lang], "Published articles and bodywork insights in the selected language."),
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
