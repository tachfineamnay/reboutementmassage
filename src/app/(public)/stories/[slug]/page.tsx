import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/utils";
import ArticleContent from "@/components/stories/ArticleContent";
import "@/app/globals.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const ARTICLE_INCLUDE = {
  seo: {
    include: { ogImage: { select: { url: true } } },
  },
  content: { select: { html: true, editorJson: true, wordCount: true, readingTime: true } },
  coverImage: { select: { url: true, altFr: true, altEn: true, altEs: true } },
} as const;

async function getArticle(slug: string) {
  try {
    return await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: ARTICLE_INCLUDE,
    });
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return articles.map((a) => ({
      slug: a.slug,
    }));
  } catch (error) {
    console.error("Prisma error during generateStaticParams for stories/[slug]:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return {};

  const title = article.seo?.seoTitle ?? article.title;
  const description = article.seo?.metaDescription ?? article.excerpt ?? "";
  const imageUrl = article.seo?.ogImage?.url
    ? absoluteUrl(article.seo.ogImage.url)
    : article.coverImage?.url
    ? absoluteUrl(article.coverImage.url)
    : absoluteUrl("/og-image.png");

  const canonical = absoluteUrl(`/stories/${slug}`);
  const noindex = article.seo?.noindex ?? false;

  return {
    title: `${title} — Méthode TMS®`,
    description,
    alternates: { canonical },
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
    btn: "Prendre contact",
  },
  EN: {
    title: "A question or need for support?",
    text: "Grégory Tordjman operates with utmost discretion worldwide for bespoke manual therapy and French bodywork sessions.",
    btn: "Get in touch",
  },
  ES: {
    title: "¿Una pregunta, una necesidad de acompañamiento?",
    text: "Grégory Tordjman interviene con total discreción a nivel internacional para sesiones de terapia manual y reboutement a medida.",
    btn: "Póngase en contacto",
  },
};

function articleStructuredData(article: {
  title: string;
  excerpt?: string | null;
  slug: string;
  locale: string;
  coverImage?: { url: string } | null;
  publishedAt?: Date | null;
  updatedAt: Date;
}) {
  const href = absoluteUrl(`/stories/${article.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Stories", item: absoluteUrl("/stories") },
          { "@type": "ListItem", position: 2, name: article.title, item: href },
        ],
      },
      {
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        url: href,
        image: article.coverImage?.url ? absoluteUrl(article.coverImage.url) : undefined,
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        author: {
          "@type": "Person",
          name: "Grégory Tordjman",
          url: absoluteUrl("/fr"),
        },
        publisher: {
          "@type": "Organization",
          name: "Méthode TMS®",
          url: absoluteUrl(),
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": href,
        },
      },
    ],
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
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

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData(article)) }}
      />

      <main className="article-page">
        {/* Breadcrumb */}
        <nav className="article-breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/stories" className="article-breadcrumb__link">
            Stories
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
              ? new Intl.DateTimeFormat("fr-FR", {
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
              {article.content.wordCount} mots · {article.content.readingTime} min de lecture
            </p>
          )}
        </header>

        {/* Body */}
        <ArticleContent
          content={article.content?.editorJson ?? null}
          html={sanitizedHtml}
        />

        {/* Dynamic Premium CTA Block */}
        <section className="article-cta-section" style={{ margin: "48px 0", padding: "40px 32px", background: "var(--forest-light)", borderLeft: "4px solid var(--forest)", borderRadius: "2px" }}>
          <div className="article-cta-card" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <h3 className="article-cta-card__title" style={{ fontFamily: "var(--serif)", fontSize: "22px", fontWeight: 300, color: "var(--ink)", margin: 0 }}>
              {cta.title}
            </h3>
            <p className="article-cta-card__text" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--mid)", margin: 0 }}>
              {cta.text}
            </p>
            <Link href={`/${article.locale.toLowerCase()}#contact`} className="btn-primary" style={{ marginTop: "8px" }}>
              {cta.btn}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "8px" }}>
                <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer nav */}
        <footer className="article-footer">
          <Link href="/stories" className="article-footer__back">
            ← Tous les articles
          </Link>
        </footer>
      </main>
    </>
  );
}
