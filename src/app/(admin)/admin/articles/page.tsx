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
  title: "Studio Articles — Platform Admin",
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

const PRODUCTION_STATUS: Record<string, string> = {
  DRAFT: "À écrire",
  READY: "À valider",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

function getSuspectedLocale(title: string): "EN" | "ES" | null {
  const normalizedTitle = title.toLowerCase();
  const englishSignals = [
    "manual therapy",
    "when the body",
    "experience must continue",
  ];
  const spanishSignals = ["terapia manual", "cuerpo", "experiencia"];

  if (englishSignals.some((signal) => normalizedTitle.includes(signal))) return "EN";
  if (spanishSignals.some((signal) => normalizedTitle.includes(signal))) return "ES";
  return null;
}

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
            aeoScore: true,
            geoScore: true,
            atomicAnswerPresent: true,
          },
        },
        content: { select: { wordCount: true, readingTime: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);
  const hasFilters = !!(status || locale || q);

  const withScore = articles.map((a) => ({
    ...a,
    suspectedLocale: a.locale === "FR" ? getSuspectedLocale(a.title) : null,
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
    aeoScore: a.seo?.aeoScore ?? 0,
    geoScore: a.seo?.geoScore ?? 0,
    atomicAnswerPresent: a.seo?.atomicAnswerPresent ?? false,
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
          <h1 className="admin-page__title">Studio Articles</h1>
          <p className="admin-page__meta">
            {total} studio{total !== 1 ? "s" : ""}
            {hasFilters && " (filtrés)"}
          </p>
        </div>
        <Link href="/admin/articles/new" className="admin-btn admin-btn--primary">
          + Nouveau Studio
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
          <option value="DRAFT">À écrire</option>
          <option value="READY">À valider</option>
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
                Créer le premier Studio
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
                  <th className="col-status">Production</th>
                  <th className="col-seo">SEO</th>
                  <th className="col-pub">Image</th>
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
                          {article.content.readingTime ? ` · ${article.content.readingTime} min` : ""}
                        </span>
                      ) : null}
                    </td>

                    {/* Langue */}
                    <td>
                      <span className="badge badge--locale">
                        {LOCALE_FLAGS[article.locale] ?? ""} {article.locale}
                      </span>
                      {article.suspectedLocale && (
                        <span
                          className="locale-suspect"
                          title={`Le titre semble être en ${article.suspectedLocale}, mais la locale enregistrée est FR.`}
                        >
                          Locale suspecte : {article.suspectedLocale}
                        </span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="admin-table__slug-cell">
                      <code className="admin-table__slug-code">
                        {getArticlePublicPath({ locale: article.locale, slug: article.slug })}
                      </code>
                    </td>

                    {/* Statut */}
                    <td>
                      <span className="production-status">
                        <ArticleStatusBadge status={article.status} />
                        <span>{PRODUCTION_STATUS[article.status] ?? article.status}</span>
                      </span>
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

                    {/* Image */}
                    <td>
                      <span
                        className={`image-status ${
                          article.coverImageId ? "image-status--ok" : "image-status--todo"
                        }`}
                      >
                        {article.coverImageId ? "Image OK" : "Image à faire"}
                      </span>
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
                        title="Ouvrir Studio"
                      >
                        Ouvrir Studio
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
