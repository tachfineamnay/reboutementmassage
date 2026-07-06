import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { getLandingPublicPath, getPreviewUrl } from "@/lib/builder/puck-utils";
import { isPuckLanding } from "@/lib/builder/default-puck-data";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import ReadinessScoreBadge from "@/components/admin/growth/ReadinessScoreBadge";

export const metadata: Metadata = { title: "Pages — TMS Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    destinationId?: string;
    locale?: string;
    q?: string;
    readiness?: string;
    noindex?: string;
  }>;
};

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export default async function PagesAdminPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, destinationId, locale, q, readiness, noindex } = await searchParams;

  const where: Prisma.LandingPageWhereInput = {
    ...(status && ["DRAFT", "READY", "LIVE", "PAUSED", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "READY" | "LIVE" | "PAUSED" | "ARCHIVED" }
      : {}),
    ...(destinationId ? { destinationId } : {}),
    ...(locale && ["FR", "EN", "ES"].includes(locale) ? { locale: locale as "FR" | "EN" | "ES" } : {}),
    ...(readiness === "low" ? { readinessScore: { lt: 80 } } : {}),
    ...(noindex === "true" ? { noindex: true } : noindex === "false" ? { noindex: false } : {}),
    ...(q
      ? {
          OR: [
            { heroTitle: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.landingPage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.landingPage.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  const hasFilters = Boolean(status || destinationId || locale || q || readiness || noindex);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Pages"
        meta={`${total} landing${total !== 1 ? "s" : ""}`}
        description="Studio visuel Puck pour les pages locales. Le mode expert historique reste disponible."
        action={{ href: "/admin/pages/new", label: "+ Créer une page" }}
      />

      <form className="admin-filters" method="GET">
        <input type="text" name="q" defaultValue={q} placeholder="Rechercher…" className="admin-input admin-filters__search" />
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.cityName}
            </option>
          ))}
        </select>
        <select name="locale" defaultValue={locale ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes langues</option>
          <option value="FR">FR</option>
          <option value="EN">EN</option>
          <option value="ES">ES</option>
        </select>
        <select name="status" defaultValue={status ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="READY">Prêt</option>
          <option value="LIVE">Live</option>
          <option value="PAUSED">Pause</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
        <select name="readiness" defaultValue={readiness ?? ""} className="admin-input admin-filters__select">
          <option value="">Toute readiness</option>
          <option value="low">Readiness &lt; 80</option>
        </select>
        <select name="noindex" defaultValue={noindex ?? ""} className="admin-input admin-filters__select">
          <option value="">Indexation</option>
          <option value="true">Noindex</option>
          <option value="false">Indexable</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">
          Filtrer
        </button>
        {hasFilters ? (
          <Link href="/admin/pages" className="admin-btn admin-btn--ghost">
            Réinitialiser
          </Link>
        ) : null}
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucune landing." action={{ href: "/admin/pages/new", label: "Créer une page" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Destination</th>
                <th>Langue</th>
                <th>Statut</th>
                <th>Score</th>
                <th>Dernière modif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((landing) => {
                const liveUrl = getLandingPublicPath(landing);
                const previewUrl = getPreviewUrl(landing);
                const hasStudio = isPuckLanding(landing.content);

                return (
                  <tr key={landing.id}>
                    <td className="admin-table__title">
                      <Link href={`/admin/pages/${landing.id}/studio`} className="admin-table__title-link">
                        {landing.heroTitle}
                      </Link>
                      <span className="admin-table__meta">
                        {hasStudio ? "Studio Puck" : "Legacy"} · <code className="admin-table__slug-code">{liveUrl}</code>
                      </span>
                    </td>
                    <td>{landing.destination.cityName}</td>
                    <td>
                      <span className="badge badge--locale">{landing.locale}</span>
                    </td>
                    <td>
                      <AdminStatusBadge status={landing.status} />
                    </td>
                    <td>
                      <ReadinessScoreBadge score={landing.readinessScore} />
                    </td>
                    <td className="admin-table__date">{fmt.format(landing.updatedAt)}</td>
                    <td className="admin-table__actions">
                      <Link href={`/admin/pages/${landing.id}/studio`} className="admin-action">
                        Studio
                      </Link>
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="admin-action">
                        Preview
                      </a>
                      <Link href={`/admin/landings/${landing.id}/edit`} className="admin-action">
                        Expert
                      </Link>
                      {landing.status === "LIVE" ? (
                        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="admin-action admin-action--view">
                          Voir live
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
