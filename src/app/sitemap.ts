import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  LOCALIZED_ROUTES,
  LOCALES,
  routeAlternates,
  type LocalizedRouteKey,
} from "@/lib/seo";
import {
  CDMX_PRIVATE_SESSION_CAMPAIGNS,
  getCdmxCampaignAlternates,
} from "@/data/campaign-landings";
import { prisma } from "@/lib/prisma";
import { getArticleCanonicalUrl } from "@/lib/routes";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{
  key: LocalizedRouteKey;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { key: "home", changeFrequency: "monthly", priority: 1 },
  { key: "stories", changeFrequency: "weekly", priority: 0.8 },
  { key: "biography", changeFrequency: "monthly", priority: 0.8 },
  { key: "sessions", changeFrequency: "monthly", priority: 0.9 },
  { key: "stagesWorkshops", changeFrequency: "monthly", priority: 0.85 },
  { key: "luxuryHospitality", changeFrequency: "monthly", priority: 0.9 },
];

const STATIC_ROUTE_LASTMOD: Record<LocalizedRouteKey, string> = {
  home: "2026-06-05",
  stories: "2026-06-05",
  biography: "2026-06-05",
  sessions: "2026-06-05",
  stagesWorkshops: "2026-06-05",
  luxuryHospitality: "2026-06-05",
};

const CDMX_CAMPAIGN_ALTERNATES = Object.fromEntries(
  Object.entries(getCdmxCampaignAlternates()).map(([locale, route]) => [
    locale,
    absoluteUrl(route),
  ])
);

const CAMPAIGN_ROUTES: MetadataRoute.Sitemap = Object.values(
  CDMX_PRIVATE_SESSION_CAMPAIGNS
).map((campaign) => ({
  url: absoluteUrl(campaign.route),
  lastModified: new Date("2026-06-30T00:00:00.000Z"),
  changeFrequency: "weekly",
  priority: campaign.htmlLang === "es" ? 0.85 : 0.8,
  alternates: {
    languages: CDMX_CAMPAIGN_ALTERNATES,
  },
}));

function staticLastModified(routeKey: LocalizedRouteKey) {
  return new Date(`${STATIC_ROUTE_LASTMOD[routeKey]}T00:00:00.000Z`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(LOCALIZED_ROUTES[route.key][locale]),
      lastModified: staticLastModified(route.key),
      changeFrequency: route.changeFrequency,
      priority: locale === "fr" ? route.priority : Math.max(route.priority - 0.05, 0.5),
      alternates: {
        languages: routeAlternates(route.key),
      },
    }))
  );

  // Articles publiés
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, locale: true, updatedAt: true, translationGroupId: true },
    });

    const grouped = new Map<string, typeof articles>();
    for (const article of articles) {
      if (!article.translationGroupId) continue;
      const group = grouped.get(article.translationGroupId) ?? [];
      group.push(article);
      grouped.set(article.translationGroupId, group);
    }

    articlePages = articles.map((a) => ({
      url: getArticleCanonicalUrl({ locale: a.locale, slug: a.slug }),
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: (() => {
          const group = a.translationGroupId ? grouped.get(a.translationGroupId) : null;
          if (!group || group.length === 0) {
            const locale = a.locale.toLowerCase();
            return {
              [locale]: getArticleCanonicalUrl({ locale: a.locale, slug: a.slug }),
              ...(locale === "fr"
                ? { "x-default": getArticleCanonicalUrl({ locale: a.locale, slug: a.slug }) }
                : {}),
            };
          }

          const languages: Record<string, string> = {};
          for (const translation of group) {
            languages[translation.locale.toLowerCase()] = getArticleCanonicalUrl({
              locale: translation.locale,
              slug: translation.slug,
            });
          }
          languages["x-default"] = languages.fr ?? languages.en ?? languages.es ?? getArticleCanonicalUrl(a);
          return languages;
        })(),
      },
    }));
  } catch {
    // DB non disponible au build time → sitemap partiel
  }

  return [...staticPages, ...CAMPAIGN_ROUTES, ...articlePages, ...(await getGrowthLandingPages())];
}

async function getGrowthLandingPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const landings = await prisma.landingPage.findMany({
      where: { status: "LIVE", noindex: false },
      select: {
        slug: true,
        locale: true,
        updatedAt: true,
        hreflangGroupId: true,
        xDefault: true,
      },
    });

    const grouped = new Map<string, typeof landings>();
    for (const landing of landings) {
      if (!landing.hreflangGroupId) continue;
      const group = grouped.get(landing.hreflangGroupId) ?? [];
      group.push(landing);
      grouped.set(landing.hreflangGroupId, group);
    }

    return landings.map((landing) => {
      const path = `/${landing.locale.toLowerCase()}/${landing.slug}`;
      const group = landing.hreflangGroupId ? grouped.get(landing.hreflangGroupId) : null;

      const languages: Record<string, string> = {};
      if (group && group.length > 0) {
        for (const item of group) {
          languages[item.locale.toLowerCase()] = absoluteUrl(
            `/${item.locale.toLowerCase()}/${item.slug}`
          );
        }
        const xDefault = group.find((item) => item.xDefault) ?? group[0];
        languages["x-default"] = absoluteUrl(
          `/${xDefault.locale.toLowerCase()}/${xDefault.slug}`
        );
      } else {
        languages[landing.locale.toLowerCase()] = absoluteUrl(path);
      }

      return {
        url: absoluteUrl(path),
        lastModified: landing.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.82,
        alternates: { languages },
      };
    });
  } catch {
    return [];
  }
}
