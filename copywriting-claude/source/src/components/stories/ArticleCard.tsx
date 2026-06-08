import Link from "next/link";
import { getArticlePublicPath } from "@/lib/routes";

type ArticleCardProps = {
  article: {
    slug: string;
    locale: string;
    title: string;
    excerpt?: string | null;
    coverImage?: { url: string } | null;
    publishedAt?: Date | null;
    content?: { readingTime: number } | null;
    seo?: { seoTitle?: string | null } | null;
  };
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const displayTitle = article.seo?.seoTitle ?? article.title;
  const date = article.publishedAt
    ? new Intl.DateTimeFormat(article.locale === "EN" ? "en-US" : article.locale === "ES" ? "es-ES" : "fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(article.publishedAt)
    : null;

  const readingTime = article.content?.readingTime;
  const href = getArticlePublicPath({ locale: article.locale || "FR", slug: article.slug });

  const ctaText = article.locale === "EN" ? "Read story →" : article.locale === "ES" ? "Leer artículo →" : "Lire l'article →";
  const readingTimeText = article.locale === "EN" ? "min read" : article.locale === "ES" ? "min de lectura" : "min de lecture";

  return (
    <article className="article-card">
      <Link href={href} className="article-card__link">
        {article.coverImage?.url ? (
          <div className="article-card__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage.url}
              alt={displayTitle}
              className="article-card__img"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="article-card__cover article-card__cover--placeholder" />
        )}

        <div className="article-card__body">
          <div className="article-card__meta-row" style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "11px", color: "var(--gold)" }}>
            {date && <time className="article-card__date">{date}</time>}
            {date && readingTime && <span className="article-card__separator" style={{ opacity: 0.5 }}>·</span>}
            {readingTime && (
              <span className="article-card__reading-time" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {readingTime} {readingTimeText}
              </span>
            )}
          </div>
          <h2 className="article-card__title" style={{ marginTop: "4px" }}>{displayTitle}</h2>
          {article.excerpt && (
            <p className="article-card__excerpt">{article.excerpt}</p>
          )}
          <span className="article-card__cta">{ctaText}</span>
        </div>
      </Link>
    </article>
  );
}
