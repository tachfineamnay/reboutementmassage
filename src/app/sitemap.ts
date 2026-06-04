import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  LOCALIZED_ROUTES,
  LOCALES,
  routeAlternates,
  type LocalizedRouteKey,
} from "@/lib/seo";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(LOCALIZED_ROUTES[route.key][locale]),
      lastModified,
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

  return [...staticPages, ...articlePages];
}
