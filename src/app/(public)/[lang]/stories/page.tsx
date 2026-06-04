import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import ArticleCard from "@/components/stories/ArticleCard";
import StoriesPageShell from "@/components/stories/StoriesPageShell";
import "@/app/globals.css";

type PageProps = {
  params: Promise<{
    lang: string;
  }>;
};

const LOCALIZED_CONTENT = {
  fr: {
    h1: "Stories",
    desc: "Lectures du corps, situations de terrain et récits autour de la Méthode TMS®.",
    back: "← Retour",
    empty: "Aucun article publié pour le moment."
  },
  en: {
    h1: "Stories",
    desc: "Body insights, field situations and stories around the TMS Method®.",
    back: "← Back",
    empty: "No articles published yet."
  },
  es: {
    h1: "Stories",
    desc: "Lecturas del cuerpo, situaciones de terreno y relatos en torno al Método TMS®.",
    back: "← Volver",
    empty: "No hay artículos publicados todavía."
  }
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "fr" && lang !== "en" && lang !== "es") {
    return {};
  }
  
  const content = LOCALIZED_CONTENT[lang];
  const url = `/${lang}/stories`;

  return {
    title: `${content.h1} — Méthode TMS®`,
    description: content.desc,
    alternates: {
      canonical: absoluteUrl(url),
      languages: {
        fr: absoluteUrl("/fr/stories"),
        en: absoluteUrl("/en/stories"),
        es: absoluteUrl("/es/stories"),
      }
    },
    openGraph: {
      type: "website",
      title: `${content.h1} — Méthode TMS®`,
      description: content.desc,
      url: absoluteUrl(url),
      siteName: "Méthode TMS®",
      images: [{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  };
}

function storiesStructuredData(lang: "fr" | "en" | "es") {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${LOCALIZED_CONTENT[lang].h1} — Méthode TMS®`,
    url: absoluteUrl(`/${lang}/stories`),
    publisher: {
      "@type": "Organization",
      name: "Méthode TMS®",
      url: absoluteUrl(),
    },
  };
}

export const revalidate = 60;

export default async function StoriesIndexPage({ params }: PageProps) {
  const { lang } = await params;

  if (lang !== "fr" && lang !== "en" && lang !== "es") {
    notFound();
  }

  const validLocale = lang.toUpperCase() as "FR" | "EN" | "ES";
  const content = LOCALIZED_CONTENT[lang];

  let articles: (Parameters<typeof ArticleCard>[0]["article"] & { id: string })[] = [];
  try {
    articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        locale: validLocale,
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
    console.error("Prisma error in StoriesIndexPage:", error);
  }

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storiesStructuredData(lang)),
        }}
      />

      <StoriesPageShell lang={lang}>
        <main className="stories-page">
          {/* Stories Hero */}
          <section className="stories-hero">
            <div className="stories-hero__inner">
              <span className="eyebrow eyebrow--gold stories-hero__eyebrow">{content.h1}</span>
              <h1 className="stories-hero__h1">
                {lang === "en" ? (
                  <>Body <em>insights</em>,<br />field stories.</>
                ) : lang === "es" ? (
                  <>Lecturas del <em>cuerpo</em>,<br />relatos de terreno.</>
                ) : (
                  <>Lectures du <em>corps</em>,<br />récits de terrain.</>
                )}
              </h1>
              <p className="stories-hero__desc">
                {content.desc}
              </p>
            </div>
          </section>

          {/* Grid Section */}
          <section className="stories-grid-section" style={{ paddingTop: "32px" }}>
            <div className="stories-grid-section__head">
              <span className="stories-grid-section__count">
                {articles.length} {lang === "en" ? "articles" : lang === "es" ? "artículos" : "articles"}
              </span>
            </div>
            <div className="stories-grid">
              {articles.length === 0 ? (
                <p className="stories-empty">{content.empty}</p>
              ) : (
                articles.map((article) => (
                  <ArticleCard key={article.id} article={article as Parameters<typeof ArticleCard>[0]["article"]} />
                ))
              )}
            </div>
          </section>
        </main>
      </StoriesPageShell>
    </>
  );
}
