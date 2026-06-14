import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  absoluteUrl,
  createArticleJsonLd,
  createFaqJsonLd,
  createIdentityJsonLd,
  createArticleWebPageJsonLd,
  graphJsonLd,
  renderJsonLd,
  type JsonLd,
} from "@/lib/seo";
import {
  isTermVisible,
  normalizeEntityTargets,
  normalizeEvidenceNotes,
  normalizeFaqItems,
} from "@/lib/geo";
import { getArticleCanonicalUrl, getStoriesIndexPath } from "@/lib/routes";
import { sanitizeHtml } from "@/lib/utils";
import ArticleContent from "@/components/stories/ArticleContent";
import StoriesPageShell from "@/components/stories/StoriesPageShell";
import "@/app/globals.css";

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export const revalidate = 60;

const ARTICLE_INCLUDE = {
  seo: {
    include: { ogImage: { select: { url: true } } },
  },
  content: {
    select: {
      html: true,
      editorJson: true,
      plainText: true,
      wordCount: true,
      readingTime: true,
    },
  },
  coverImage: { select: { url: true, altFr: true, altEn: true, altEs: true } },
} as const;

async function getArticle(slug: string, lang: string) {
  const localeUpper = lang.toUpperCase() as "FR" | "EN" | "ES";
  try {
    return await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED", locale: localeUpper },
      include: ARTICLE_INCLUDE,
    });
  } catch (error) {
    console.error("Error fetching article by slug and locale:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (lang !== "fr" && lang !== "en" && lang !== "es") return {};

  const article = await getArticle(slug, lang);
  if (!article) return {};

  const title = article.seo?.seoTitle ?? article.title;
  const description = article.seo?.metaDescription ?? article.excerpt ?? "";
  const imageUrl = article.seo?.ogImage?.url
    ? absoluteUrl(article.seo.ogImage.url)
    : article.coverImage?.url
    ? absoluteUrl(article.coverImage.url)
    : absoluteUrl("/og-image.png");

  const canonical = getArticleCanonicalUrl({ locale: article.locale, slug: article.slug });
  const noindex = article.seo?.noindex ?? false;

  const translations = await prisma.article.findMany({
    where: article.translationGroupId
      ? { translationGroupId: article.translationGroupId, status: "PUBLISHED" }
      : { slug: article.slug, status: "PUBLISHED" },
    select: { locale: true, slug: true }
  });

  const languages: Record<string, string> = {};
  for (const t of translations) {
    const localeLower = t.locale.toLowerCase();
    languages[localeLower] = absoluteUrl(`/${localeLower}/stories/${t.slug}`);
  }
  
  if (languages["fr"]) {
    languages["x-default"] = languages["fr"];
  } else if (languages[lang]) {
    languages["x-default"] = languages[lang];
  }

  return {
    title: `${title} — Méthode TMS®`,
    description,
    alternates: { 
      canonical,
      languages
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "Méthode TMS®",
      publishedTime: article.publishedAt?.toISOString(),
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: !noindex,
      follow: true,
    },
  };
}

const CTA_TRANSLATIONS = {
  FR: {
    title: "Une question, un besoin d'accompagnement ?",
    text: "Grégory Tordjman intervient en toute discrétion à l'international pour des séances de thérapie manuelle et de reboutement sur mesure.",
    btn: "Transmettre une demande privée",
    contactHref: "/fr#contact",
    storiesLink: "Stories",
    allArticles: "← Tous les articles",
    byline: "Par Grégory Tordjman",
    faqTitle: "Questions fréquentes",
    experienceTitle: "Repères issus de l'expérience",
    precautionsTitle: "Limites et précautions",
  },
  EN: {
    title: "A question or need for support?",
    text: "Grégory Tordjman operates with utmost discretion worldwide for bespoke manual therapy and French bodywork sessions.",
    btn: "Send a private request",
    contactHref: "/en#contact",
    storiesLink: "Stories",
    allArticles: "← All articles",
    byline: "By Grégory Tordjman",
    faqTitle: "Frequently asked questions",
    experienceTitle: "Experience-based perspective",
    precautionsTitle: "Limits and precautions",
  },
  ES: {
    title: "¿Una pregunta, una necesidad de acompañamiento?",
    text: "Grégory Tordjman interviene con total discreción a nivel internacional para sesiones de terapia manual y reboutement a medida.",
    btn: "Enviar una solicitud privada",
    contactHref: "/es#contact",
    storiesLink: "Stories",
    allArticles: "← Todos los artículos",
    byline: "Por Grégory Tordjman",
    faqTitle: "Preguntas frecuentes",
    experienceTitle: "Perspectiva basada en la experiencia",
    precautionsTitle: "Límites y precauciones",
  },
};

function isJsonLdObject(value: unknown): value is JsonLd {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function customJsonLdNodes(value: unknown): JsonLd[] {
  if (Array.isArray(value)) {
    return value.filter(isJsonLdObject);
  }

  if (!isJsonLdObject(value)) return [];

  const graph = value["@graph"];
  if (Array.isArray(graph)) {
    return graph.filter(isJsonLdObject);
  }

  return [value];
}

function articleStructuredData(article: NonNullable<Awaited<ReturnType<typeof getArticle>>>, lang: string) {
  const canonical = getArticleCanonicalUrl({ locale: article.locale, slug: article.slug });
  const storiesIndexUrl = absoluteUrl(getStoriesIndexPath(article.locale));
  const langUrl = absoluteUrl(`/${lang}`);
  const locale = lang as "fr" | "en" | "es";
  const faqItems = normalizeFaqItems(article.seo?.faqItems);
  const evidenceNotes = normalizeEvidenceNotes(article.seo?.evidenceNotes);
  const entityTargets = normalizeEntityTargets(article.seo?.entityTargets);
  const visibleParts = [
    article.title,
    article.excerpt,
    article.content?.plainText,
    ...faqItems.flatMap((item) => [item.question, item.answer]),
    evidenceNotes.experience,
    evidenceNotes.precautions,
    "Grégory Tordjman",
  ];
  const visibleEntities = entityTargets.filter((entity) =>
    isTermVisible(entity, visibleParts)
  );
  const visibleFocusKeyword =
    article.seo?.focusKeyword &&
    isTermVisible(article.seo.focusKeyword, visibleParts)
      ? article.seo.focusKeyword
      : null;
  const keywords = Array.from(
    new Set([visibleFocusKeyword, ...visibleEntities].filter((value): value is string => Boolean(value)))
  );
  const customNodes = customJsonLdNodes(article.seo?.customJsonLd);

  const nodes: JsonLd[] = [
    createIdentityJsonLd(locale),
    createArticleWebPageJsonLd({
      locale,
      url: canonical,
      title: article.title,
      description: article.excerpt ?? article.title,
      aboutId: `${canonical}#article`,
    }),
    createArticleJsonLd({
      locale,
      url: canonical,
      title: article.title,
      description: article.excerpt,
      image: article.coverImage?.url ? absoluteUrl(article.coverImage.url) : null,
      datePublished: article.publishedAt?.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      wordCount: article.content?.wordCount,
      keywords,
      about: visibleEntities.slice(0, 1),
      mentions: visibleEntities.slice(1),
    }),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang.toUpperCase(),
        item: langUrl,
      },
      { "@type": "ListItem", position: 2, name: "Stories", item: storiesIndexUrl },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
      ],
    },
  ];

  if (faqItems.length > 0) {
    nodes.push(createFaqJsonLd(faqItems));
  }

  if (customNodes.length > 0) {
    nodes.push(...customNodes);
  }

  return graphJsonLd(nodes);
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  if (lang !== "fr" && lang !== "en" && lang !== "es") notFound();

  const article = await getArticle(slug, lang);
  if (!article) notFound();

  const localeKey = (article.locale || "FR") as "FR" | "EN" | "ES";
  const coverAlt =
    localeKey === "EN"
      ? (article.coverImage?.altEn ?? article.title)
      : localeKey === "ES"
      ? (article.coverImage?.altEs ?? article.title)
      : (article.coverImage?.altFr ?? article.title);

  const cta = CTA_TRANSLATIONS[localeKey] || CTA_TRANSLATIONS.FR;
  const sanitizedHtml = article.content?.html ? sanitizeHtml(article.content.html) : null;
  const storiesIndexUrl = getStoriesIndexPath(article.locale);
  const faqItems = normalizeFaqItems(article.seo?.faqItems);
  const evidenceNotes = normalizeEvidenceNotes(article.seo?.evidenceNotes);
  const hasEvidence = Boolean(evidenceNotes.experience || evidenceNotes.precautions);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderJsonLd(articleStructuredData(article, lang)) }}
      />

      <StoriesPageShell lang={lang as "fr" | "en" | "es"}>
        <main className="article-page">
          {/* Breadcrumb */}
          <nav className="article-breadcrumb" aria-label="Fil d'Ariane">
            <Link href={`/${lang}`} className="article-breadcrumb__link">
              {lang.toUpperCase()}
            </Link>
            <span className="article-breadcrumb__sep" aria-hidden="true">/</span>
            <Link href={storiesIndexUrl} className="article-breadcrumb__link">
              {cta.storiesLink}
            </Link>
            <span className="article-breadcrumb__sep" aria-hidden="true">/</span>
            <span className="article-breadcrumb__current">{article.title}</span>
          </nav>

          {/* Hero image */}
          {article.coverImage?.url && (
            <div className="article-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage.url}
                alt={coverAlt}
                className="article-hero__img"
              />
            </div>
          )}

          {/* Article header */}
          <header className="article-header">
            <p className="article-header__date">
              {article.publishedAt
                ? new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(article.publishedAt)
                : ""}
            </p>
            <h1 className="article-header__title">{article.title}</h1>
            {article.excerpt && (
              <p className="article-header__excerpt">{article.excerpt}</p>
            )}
            {article.content && (
              <p className="article-header__meta">
                {article.content.wordCount} {lang === "en" ? "words" : lang === "es" ? "palabras" : "mots"} · {article.content.readingTime} min {lang === "en" ? "read" : lang === "es" ? "de lectura" : "de lecture"}
              </p>
            )}
            <p className="article-header__author">{cta.byline}</p>
          </header>

          {/* Direct Answer AEO */}
          {article.seo?.primaryQuestion && article.excerpt && (
            <section className="article-direct-answer" aria-labelledby="direct-answer-title">
              <h2 id="direct-answer-title">{article.seo.primaryQuestion}</h2>
              <p>{article.excerpt}</p>
            </section>
          )}

          {/* Body */}
          <ArticleContent
            content={article.content?.editorJson ?? null}
            html={sanitizedHtml}
          />

          {hasEvidence && (
            <section className="article-evidence" aria-label={cta.experienceTitle}>
              {evidenceNotes.experience && (
                <div className="article-evidence__block">
                  <p className="article-evidence__eyebrow">Who / How</p>
                  <h2>{cta.experienceTitle}</h2>
                  <p>{evidenceNotes.experience}</p>
                </div>
              )}
              {evidenceNotes.precautions && (
                <div className="article-evidence__block article-evidence__block--precautions">
                  <p className="article-evidence__eyebrow">Why / Limits</p>
                  <h2>{cta.precautionsTitle}</h2>
                  <p>{evidenceNotes.precautions}</p>
                </div>
              )}
            </section>
          )}

          {faqItems.length > 0 && (
            <section className="article-faq" aria-labelledby="article-faq-title">
              <p className="article-faq__eyebrow">AEO</p>
              <h2 id="article-faq-title">{cta.faqTitle}</h2>
              <div className="article-faq__list">
                {faqItems.map((item, index) => (
                  <div className="article-faq__item" key={`${item.question}-${index}`}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Premium CTA Block */}
          <section className="article-cta-section" style={{ margin: "48px 0", padding: "40px 32px", background: "var(--forest-light)", borderLeft: "4px solid var(--forest)", borderRadius: "2px" }}>
            <div className="article-cta-card" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
              <h3 className="article-cta-card__title" style={{ fontFamily: "var(--serif)", fontSize: "22px", fontWeight: 300, color: "var(--ink)", margin: 0 }}>
                {cta.title}
              </h3>
              <p className="article-cta-card__text" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--mid)", margin: 0 }}>
                {cta.text}
              </p>
              <Link href={cta.contactHref} className="btn-primary" style={{ marginTop: "8px" }}>
                {cta.btn}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "8px" }}>
                  <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </section>

          {/* Footer nav */}
          <footer className="article-footer">
            <Link href={storiesIndexUrl} className="article-footer__back">
              {cta.allArticles}
            </Link>
          </footer>
        </main>
      </StoriesPageShell>
    </>
  );
}
