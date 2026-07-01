import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

export const metadata: Metadata = { title: "Offres — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string; destinationId?: string; q?: string }> };

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export default async function OffersPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, destinationId, q } = await searchParams;

  const where = {
    ...(status && ["DRAFT", "READY", "LIVE", "PAUSED", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "READY" | "LIVE" | "PAUSED" | "ARCHIVED" }
      : {}),
    ...(destinationId ? { destinationId } : {}),
    ...(q ? { internalName: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.offer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { destination: { select: { cityName: true, slug: true } } },
    }),
    prisma.offer.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  const hasFilters = !!(status || destinationId || q);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Offers" meta={`${total} offer${total !== 1 ? "s" : ""}`} action={{ href: "/admin/offers/new", label: "+ New offer" }} />

      <form className="admin-filters" method="GET">
        <input type="text" name="q" defaultValue={q} placeholder="Rechercher…" className="admin-input admin-filters__search" />
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>{d.cityName}</option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="READY">Prêt</option>
          <option value="LIVE">Live</option>
          <option value="PAUSED">Pause</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
        {hasFilters && <Link href="/admin/offers" className="admin-btn admin-btn--ghost">Réinitialiser</Link>}
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucune offre." action={{ href: "/admin/offers/new", label: "Créer une offre" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom interne</th>
                <th>Type</th>
                <th>Destination</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Modifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td className="admin-table__title">
                    <Link href={`/admin/offers/${o.id}/edit`} className="admin-table__title-link">{o.internalName}</Link>
                    <span className="admin-table__meta">{o.publicNameFr}</span>
                  </td>
                  <td><code className="admin-table__code">{o.type}</code></td>
                  <td>{o.destination.cityName}</td>
                  <td>{o.durationMinutes ? `${o.durationMinutes} min` : "—"}</td>
                  <td><AdminStatusBadge status={o.status} /></td>
                  <td className="admin-table__date">{fmt.format(o.updatedAt)}</td>
                  <td><Link href={`/admin/offers/${o.id}/edit`} className="admin-action">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
