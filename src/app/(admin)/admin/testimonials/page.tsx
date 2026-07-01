import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

export const metadata: Metadata = { title: "Témoignages — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string; locale?: string; destinationId?: string }> };

export default async function TestimonialsPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, locale, destinationId } = await searchParams;

  const where = {
    ...(status && ["DRAFT", "READY", "LIVE", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "READY" | "LIVE" | "ARCHIVED" }
      : {}),
    ...(locale && ["FR", "EN", "ES"].includes(locale) ? { locale: locale as "FR" | "EN" | "ES" } : {}),
    ...(destinationId ? { destinationId } : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.testimonial.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Testimonials" meta={`${total} testimonial${total !== 1 ? "s" : ""}`} action={{ href: "/admin/testimonials/new", label: "+ New testimonial" }} />

      <form className="admin-filters" method="GET">
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes destinations</option>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
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
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucun témoignage." action={{ href: "/admin/testimonials/new", label: "Créer un témoignage" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Locale</th>
                <th>Destination</th>
                <th>Citation</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td className="admin-table__title">
                    <Link href={`/admin/testimonials/${t.id}/edit`} className="admin-table__title-link">{t.displayName}</Link>
                  </td>
                  <td>{t.locale}</td>
                  <td>{t.destination?.cityName ?? "—"}</td>
                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.quoteShort ?? "—"}
                  </td>
                  <td>{t.priority}</td>
                  <td><AdminStatusBadge status={t.status} /></td>
                  <td><Link href={`/admin/testimonials/${t.id}/edit`} className="admin-action">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
