// ─────────────────────────────────────────────────────────────────────────────
// Texte
// ─────────────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Estime le temps de lecture en minutes à partir du texte brut.
 * Base : 200 mots/minute.
 */
export function estimateReadingTime(plainText: string): number {
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Compte les mots dans un texte brut.
 */
export function countWords(plainText: string): number {
  return plainText.trim().split(/\s+/).filter(Boolean).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score SEO — compatible avec le nouveau schéma normalisé
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule un score SEO de 0 à 100 à partir des données normalisées.
 *
 * Peut recevoir :
 *  - un objet article plat (compatibilité partielle)
 *  - des objets seo et content séparés
 */
export function computeSeoScore(params: {
  title?: string | null;
  // SEO normalisé (ArticleSeo)
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogTitle?: string | null;
  ogImageId?: string | null;
  // Couverture (Article.coverImageId ou MediaAsset)
  coverImageId?: string | null;
  coverImage?: string | null; // rétrocompat (ancienne structure plate)
  // Contenu (ArticleContent)
  excerpt?: string | null;
  wordCount?: number | null;
  plainText?: string | null;
}): number {
  let score = 0;

  // Titre article (indispensable)
  if (params.title) score += 15;

  // SEO title
  const seoTitle = params.seoTitle;
  if (seoTitle) {
    score += 20;
    // Longueur idéale 30-60 caractères
    if (seoTitle.length >= 30 && seoTitle.length <= 60) score += 5;
  }

  // Meta description
  const metaDesc = params.metaDescription;
  if (metaDesc) {
    score += 20;
    // Longueur idéale 100-160 caractères
    if (metaDesc.length >= 100 && metaDesc.length <= 160) score += 5;
  }

  // Focus keyword
  if (params.focusKeyword) score += 10;

  // OG image ou cover image
  if (params.ogImageId || params.coverImageId || params.coverImage) score += 10;

  // Extrait / description
  if (params.excerpt) score += 5;

  // Contenu
  const words = params.wordCount ?? 0;
  if (words >= 300) score += 10;

  return Math.min(100, score);
}

/**
 * Sanitizes an HTML string to prevent XSS attacks by removing script tags,
 * event handlers, and javascript: links.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove inline event handlers
    .replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, "")
    .replace(/on\w+\s*=\s*([^\s>]+)/gi, "")
    // Remove javascript: href targets
    .replace(/href\s*=\s*(['"])javascript:(.*?)\1/gi, "")
    .replace(/href\s*=\s*javascript:([^\s>]+)/gi, "");
}
