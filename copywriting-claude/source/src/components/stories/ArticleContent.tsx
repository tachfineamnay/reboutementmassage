"use client";

type ArticleContentProps = {
  /** HTML pré-rendu côté serveur (stocké dans ArticleContent.html) */
  html?: string | null;
  /** JSON Tiptap brut (fallback si html absent) */
  content?: unknown;
};

export default function ArticleContent({ html, content }: ArticleContentProps) {
  // Priorité au HTML pré-rendu
  const renderHtml = html ?? (typeof content === "string" ? content : null);

  if (!renderHtml) {
    return (
      <div className="article-content">
        <p className="article-content__empty">Contenu en cours de rédaction…</p>
      </div>
    );
  }

  return (
    <div
      className="article-content prose"
      dangerouslySetInnerHTML={{ __html: renderHtml }}
    />
  );
}
