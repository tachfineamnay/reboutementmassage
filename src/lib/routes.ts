import { absoluteUrl } from "./seo";

/**
 * Normalise une locale pour l'URL (ex: "FR" -> "fr", "fr" -> "fr").
 */
export function normalizeArticleLocale(locale: string): "fr" | "en" | "es" {
  const l = locale.toLowerCase();
  if (l === "en" || l === "es") return l;
  return "fr"; // Fallback
}

/**
 * Convertit une Locale (Prisma, ex: "FR") vers son chemin public ("fr").
 */
export function articleLocaleToPath(locale: string): string {
  return normalizeArticleLocale(locale);
}

/**
 * Renvoie le chemin public absolu pour un article (ex: "/fr/stories/mon-slug").
 */
export function getArticlePublicPath(article: { locale: string; slug: string }): string {
  const lang = articleLocaleToPath(article.locale);
  return `/${lang}/stories/${article.slug}`;
}

/**
 * Renvoie le chemin public pour l'index des stories (ex: "/fr/stories").
 */
export function getStoriesIndexPath(locale: string): string {
  const lang = articleLocaleToPath(locale);
  return `/${lang}/stories`;
}

/**
 * Renvoie l'URL canonique (absolue) pour un article.
 */
export function getArticleCanonicalUrl(article: { locale: string; slug: string }): string {
  return absoluteUrl(getArticlePublicPath(article));
}
