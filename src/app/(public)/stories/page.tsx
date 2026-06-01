import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import ArticleCard from "@/components/stories/ArticleCard";
import "@/app/globals.css";

type PageProps = {
  searchParams: Promise<{
    lang?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Stories — Méthode TMS® | Articles & conseils",
  description:
    "Découvrez nos articles sur la thérapie manuelle, le reboutement et la méthode TMS® par Grégory Tordjman.",
  alternates: {
    canonical: absoluteUrl("/stories"),
  },
  openGraph: {
    type: "website",
    title: "Stories — Méthode TMS®",
    description:
      "Articles sur la thérapie manuelle, le reboutement et la méthode TMS®.",
    url: absoluteUrl("/stories"),
    siteName: "Méthode TMS®",
    images: [{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

function storiesStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Stories — Méthode TMS®",
    url: absoluteUrl("/stories"),
    publisher: {
      "@type": "Organization",
      name: "Méthode TMS®",
      url: absoluteUrl(),
    },
  };
}

export const revalidate = 60;

export default async function StoriesPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;

  const localeUpper = lang ? lang.toUpperCase() : null;
  const validLocale =
    localeUpper === "FR" || localeUpper === "EN" || localeUpper === "ES"
      ? (localeUpper as "FR" | "EN" | "ES")
      : undefined;

  interface ArticleListItem {
    id: string;
    slug: string;
    locale: "FR" | "EN" | "ES";
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    coverImage: { url: string } | null;
    content: { readingTime: number } | null;
    seo: { seoTitle: string | null } | null;
  }

  let articles: ArticleListItem[] = [];
  try {
    articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(validLocale ? { locale: validLocale } : {}),
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        locale: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        coverImage: {
          select: { url: true },
        },
        content: {
          select: { readingTime: true },
        },
        seo: {
          select: { seoTitle: true },
        },
      },
    });
  } catch (error) {
    console.error("Prisma error in StoriesPage:", error);
  }

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storiesStructuredData()),
        }}
      />

      <main className="stories-page">
        {/* Header */}
        <header className="stories-header">
          <nav className="stories-nav">
            <Link href="/fr" className="stories-nav__back">
              ← Retour
            </Link>
          </nav>
          <div className="stories-header__content">
            <span className="stories-header__label">Stories</span>
            <h1 className="stories-header__title">
              Méthode TMS® — Articles &amp; Conseils
            </h1>
            <p className="stories-header__desc">
              Thérapie manuelle, reboutement, bien-être : les perspectives de
              Grégory Tordjman.
            </p>
          </div>
        </header>

        {/* Filter Section */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 48px 0" }}>
          <div style={{ display: "flex", gap: "24px", borderBottom: "1.5px solid var(--line)", paddingBottom: "12px" }}>
            <Link
              href="/stories"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textDecoration: "none",
                fontWeight: 500,
                color: !validLocale ? "var(--forest)" : "var(--mid)",
                borderBottom: !validLocale ? "2px solid var(--forest)" : "2px solid transparent",
                paddingBottom: "13px",
                marginBottom: "-14px",
                transition: "all 0.2s ease"
              }}
            >
              Tous
            </Link>
            <Link
              href="/stories?lang=fr"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textDecoration: "none",
                fontWeight: 500,
                color: validLocale === "FR" ? "var(--forest)" : "var(--mid)",
                borderBottom: validLocale === "FR" ? "2px solid var(--forest)" : "2px solid transparent",
                paddingBottom: "13px",
                marginBottom: "-14px",
                transition: "all 0.2s ease"
              }}
            >
              Français
            </Link>
            <Link
              href="/stories?lang=en"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textDecoration: "none",
                fontWeight: 500,
                color: validLocale === "EN" ? "var(--forest)" : "var(--mid)",
                borderBottom: validLocale === "EN" ? "2px solid var(--forest)" : "2px solid transparent",
                paddingBottom: "13px",
                marginBottom: "-14px",
                transition: "all 0.2s ease"
              }}
            >
              English
            </Link>
            <Link
              href="/stories?lang=es"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textDecoration: "none",
                fontWeight: 500,
                color: validLocale === "ES" ? "var(--forest)" : "var(--mid)",
                borderBottom: validLocale === "ES" ? "2px solid var(--forest)" : "2px solid transparent",
                paddingBottom: "13px",
                marginBottom: "-14px",
                transition: "all 0.2s ease"
              }}
            >
              Español
            </Link>
          </div>
        </section>

        {/* Grid */}
        <section className="stories-grid-section" style={{ paddingTop: "32px" }}>
          <div className="stories-grid">
            {articles.length === 0 ? (
              <p className="stories-empty">Aucun article publié pour cette sélection.</p>
            ) : (
              articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
