import ArticleStatusBadge from "@/components/admin/ArticleStatusBadge";
import type { ArticleData } from "./ArticleStudioTypes";

function scoreLabel(score: number) {
  if (score >= 80) return "Bon";
  if (score >= 50) return "À renforcer";
  return "Faible";
}

export default function ArticleStudioContextPanel({ article }: { article: ArticleData }) {
  return (
    <div className="article-studio-context">
      <div className="article-studio-context__row">
        <span>Statut</span>
        <ArticleStatusBadge status={article.status} />
      </div>
      <div className="article-studio-context__grid">
        <div>
          <strong>{article.content.wordCount}</strong>
          <span>mots</span>
        </div>
        <div>
          <strong>{article.content.readingTime || 0}</strong>
          <span>min</span>
        </div>
        <div>
          <strong>{article.seo.score}</strong>
          <span>SEO {scoreLabel(article.seo.score)}</span>
        </div>
        <div>
          <strong>{article.coverImageId ? "OK" : "À faire"}</strong>
          <span>image</span>
        </div>
      </div>
    </div>
  );
}
