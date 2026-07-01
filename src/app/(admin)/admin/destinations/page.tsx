import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

export const metadata: Metadata = {
  title: "Destinations — Platform Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export default async function DestinationsPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, q } = await searchParams;

  type DestinationStatus = "DRAFT" | "READY" | "LIVE" | "PAUSED" | "ARCHIVED";
  const validStatus: DestinationStatus | undefined =
    status === "DRAFT" || status === "READY" || status === "LIVE" || status === "PAUSED" || status === "ARCHIVED"
      ? status
      : undefined;

  const where = {
    ...(validStatus ? { status: validStatus as DestinationStatus } : {}),
    ...(q
      ? {
          OR: [
            { cityName: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
            { country: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { landingPages: true, offers: true } } },
    }),
    prisma.destination.count({ where }),
  ]);

  const hasFilters = !!(status || q);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Destinations"
        meta={`${total} destination${total !== 1 ? "s" : ""}${hasFilters ? " (filtrées)" : ""}`}
        action={{ href: "/admin/destinations/new", label: "+ Nouvelle destination" }}
      />

      <form className="admin-filters" method="GET">
        <input type="text" name="q" defaultValue={q} placeholder="Rechercher…" className="admin-input admin-filters__search" />
        <select name="status" defaultValue={status ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="READY">Prêt</option>
          <option value="LIVE">Live</option>
          <option value="PAUSED">En pause</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
        {hasFilters && (
          <Link href="/admin/destinations" className="admin-btn admin-btn--ghost">Réinitialiser</Link>
        )}
      </form>

      {items.length === 0 ? (
        <AdminEmptyState
          message={hasFilters ? "Aucune destination ne correspond." : "Aucune destination configurée."}
          action={hasFilters ? undefined : { href: "/admin/destinations/new", label: "Créer une destination" }}
        />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ville</th>
                <th>Slug</th>
                <th>Pays</th>
                <th>Maturité</th>
                <th>Statut</th>
                <th>Offres</th>
                <th>Pages</th>
                <th>Modifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className={d.status === "ARCHIVED" ? "row--archived" : ""}>
                  <td className="admin-table__title">
                    <Link href={`/admin/destinations/${d.id}/edit`} className="admin-table__title-link">
                      {d.displayNameFr || d.cityName}
                    </Link>
                    <span className="admin-table__meta">{d.cityName}</span>
                  </td>
                  <td><code className="admin-table__slug-code">{d.slug}</code></td>
                  <td>{d.country}</td>
                  <td>{d.maturity}</td>
                  <td><AdminStatusBadge status={d.status} /></td>
                  <td>{d._count.offers}</td>
                  <td>{d._count.landingPages}</td>
                  <td className="admin-table__date">{fmt.format(d.updatedAt)}</td>
                  <td className="admin-table__actions">
                    <Link href={`/admin/destinations/${d.id}/edit`} className="admin-action">Éditer</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
