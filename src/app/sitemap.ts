import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates, LOCALES, localePath } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const alternates = {
    languages: languageAlternates(),
  };

  // Pages landing localisées
  const landingPages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: locale === "fr" ? 1 : 0.9,
    alternates,
  }));

  // Page liste des stories
  const storiesPage: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/stories"),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  // Articles publiés
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    articlePages = articles.map((a) => ({
      url: absoluteUrl(`/stories/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB non disponible au build time → sitemap partiel
  }

  return [...landingPages, ...storiesPage, ...articlePages];
}
