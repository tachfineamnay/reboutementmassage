import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { computeSeoScore } from "@/lib/utils";
import { getArticlePublicPath } from "@/lib/routes";
import ArticleStatusBadge from "@/components/admin/ArticleStatusBadge";
import SeoScoreBadge from "@/components/admin/SeoScoreBadge";
import DeleteArticleButton from "./DeleteArticleButton";

export const metadata: Metadata = {
  title: "Articles — GT Dash",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    locale?: string;
    q?: string;
    page?: string;
  }>;
};

const LOCALE_FLAGS: Record<string, string> = {
  FR: "🇫🇷",
  EN: "🇬🇧",
  ES: "🇪🇸",
};

const fmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function ArticlesListPage({ searchParams }: PageProps) {
  await ensureAdminSchema();

  const { status, locale, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const limit = 20;

  const validStatus =
    status === "PUBLISHED" || status === "DRAFT" || status === "READY" || status === "ARCHIVED"
      ? (status as "PUBLISHED" | "DRAFT" | "READY" | "ARCHIVED")
      : undefined;

  const validLocale =
    locale === "FR" || locale === "EN" || locale === "ES"
      ? (locale as "FR" | "EN" | "ES")
      : undefined;

  const where = {
    ...(validStatus ? { status: validStatus } : {}),
    ...(validLocale ? { locale: validLocale } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        locale: true,
        status: true,
        excerpt: true,
        coverImageId: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
        seo: {
          select: {
            seoTitle: true,
            metaDescription: true,
            focusKeyword: true,
            ogImageId: true,
            score: true,
          },
        },
        content: { select: { wordCount: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);
  const hasFilters = !!(status || locale || q);

  const withScore = articles.map((a) => ({
    ...a,
    seoScore: a.seo?.score ?? computeSeoScore({
      title: a.title,
      seoTitle: a.seo?.seoTitle,
      metaDescription: a.seo?.metaDescription,
      focusKeyword: a.seo?.focusKeyword,
      ogImageId: a.seo?.ogImageId,
      coverImageId: a.coverImageId,
      excerpt: a.excerpt,
      wordCount: a.content?.wordCount,
    }),
    aeoScore: 0,
    geoScore: 0,
    atomicAnswerPresent: false,
  }));

  // Build filter URL helper
  function filterUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { status, locale, q, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return `/admin/articles${s ? `?${s}` : ""}`;
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Articles</h1>
          <p className="admin-page__meta">
            {total} article{total !== 1 ? "s" : ""}
            {hasFilters && " (filtrés)"}
          </p>
        </div>
        <Link href="/admin/articles/new" className="admin-btn admin-btn--primary">
          + Nouvel article
        </Link>
      </div>

      {/* Filtres */}
      <form className="admin-filters" method="GET" action="/admin/articles">
        {/* Recherche */}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par titre…"
          className="admin-input admin-filters__search"
        />

        {/* Statut */}
        <select
          name="status"
          defaultValue={status ?? ""}
          className="admin-input admin-filters__select"
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillons</option>
          <option value="READY">Prêts</option>
          <option value="PUBLISHED">Publiés</option>
          <option value="ARCHIVED">Archivés</option>
        </select>

        {/* Langue */}
        <select
          name="locale"
          defaultValue={locale ?? ""}
          className="admin-input admin-filters__select"
        >
          <option value="">Toutes les langues</option>
          <option value="FR">🇫🇷 Français</option>
          <option value="EN">🇬🇧 English</option>
          <option value="ES">🇪🇸 Español</option>
        </select>

        <button type="submit" className="admin-btn admin-btn--ghost">
          Filtrer
        </button>

        {hasFilters && (
          <Link href="/admin/articles" className="admin-btn admin-btn--ghost">
            ✕ Réinitialiser
          </Link>
        )}
      </form>

      {/* Table */}
      {withScore.length === 0 ? (
        <div className="admin-empty">
          {hasFilters ? (
            <>
              <p>Aucun article ne correspond aux filtres.</p>
              <Link href="/admin/articles" className="admin-btn admin-btn--ghost">
                Voir tous les articles
              </Link>
            </>
          ) : (
            <>
              <p>Aucun article pour l&apos;instant.</p>
              <Link href="/admin/articles/new" className="admin-btn admin-btn--primary">
                Créer le premier article
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-title">Titre</th>
                  <th className="col-lang">Langue</th>
                  <th className="col-slug">Slug</th>
                  <th className="col-status">Statut</th>
                  <th className="col-seo">SEO</th>
                  <th className="col-pub">Publication</th>
                  <th className="col-upd">Modifié</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withScore.map((article) => (
                  <tr key={article.id} className={article.status === "ARCHIVED" ? "row--archived" : ""}>
                    {/* Titre */}
                    <td className="admin-table__title">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="admin-table__title-link"
                      >
                        {article.title}
                      </Link>
                      {article.content?.wordCount ? (
                        <span className="admin-table__meta">
                          {article.content.wordCount} mots
                        </span>
                      ) : null}
                    </td>

                    {/* Langue */}
                    <td>
                      <span className="badge badge--locale">
                        {LOCALE_FLAGS[article.locale] ?? ""} {article.locale}
                      </span>
                    </td>

                    {/* Slug */}
                    <td className="admin-table__slug-cell">
                      <code className="admin-table__slug-code">
                        {getArticlePublicPath({ locale: article.locale, slug: article.slug })}
                      </code>
                    </td>

                    {/* Statut */}
                    <td>
                      <ArticleStatusBadge status={article.status} />
                    </td>

                    {/* Score SEO */}
                    <td>
                      <SeoScoreBadge
                        score={article.seoScore}
                        aeoScore={article.aeoScore}
                        geoScore={article.geoScore}
                        atomicAnswerPresent={article.atomicAnswerPresent}
                      />
                    </td>

                    {/* Date publication */}
                    <td className="admin-table__date">
                      {article.publishedAt ? (
                        <time dateTime={article.publishedAt.toISOString()}>
                          {fmt.format(article.publishedAt)}
                        </time>
                      ) : (
                        <span className="admin-table__na">—</span>
                      )}
                    </td>

                    {/* Dernière modif */}
                    <td className="admin-table__date">
                      <time dateTime={article.updatedAt.toISOString()}>
                        {fmt.format(article.updatedAt)}
                      </time>
                    </td>

                    {/* Actions */}
                    <td className="admin-table__actions">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="admin-action"
                        title="Éditer"
                      >
                        Éditer
                      </Link>
                      {article.status === "PUBLISHED" && (
                        <a
                          href={getArticlePublicPath({ locale: article.locale, slug: article.slug })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-action admin-action--view"
                          title="Voir en ligne"
                        >
                          ↗
                        </a>
                      )}
                      <DeleteArticleButton id={article.id} title={article.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="admin-pagination">
              {page > 1 && (
                <Link href={filterUrl({ page: String(page - 1) })} className="admin-btn admin-btn--ghost admin-btn--sm">
                  ← Précédent
                </Link>
              )}
              <span className="admin-pagination__info">
                Page {page} / {pages}
              </span>
              {page < pages && (
                <Link href={filterUrl({ page: String(page + 1) })} className="admin-btn admin-btn--ghost admin-btn--sm">
                  Suivant →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
