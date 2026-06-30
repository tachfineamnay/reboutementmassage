import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

export const metadata: Metadata = { title: "WhatsApp — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string; destinationId?: string }> };

export default async function WhatsappPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, destinationId } = await searchParams;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(destinationId ? { destinationId } : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.whatsappChannel.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.whatsappChannel.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Canaux WhatsApp" meta={`${total} canal${total !== 1 ? "x" : ""}`} action={{ href: "/admin/whatsapp/new", label: "+ Nouveau canal" }} />

      <form className="admin-filters" method="GET">
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes destinations</option>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous statuts</option>
          <option value="NOT_CONFIGURED">Non configuré</option>
          <option value="ACTIVE">Actif</option>
          <option value="CONNECTED_GHL">GHL connecté</option>
          <option value="PAUSED">Pause</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucun canal WhatsApp." action={{ href: "/admin/whatsapp/new", label: "Créer un canal" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Téléphone</th>
                <th>Destination</th>
                <th>Provider</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="admin-table__title">
                    <Link href={`/admin/whatsapp/${c.id}/edit`} className="admin-table__title-link">{c.label}</Link>
                  </td>
                  <td>{c.phoneE164}</td>
                  <td>{c.destination.cityName}</td>
                  <td><code className="admin-table__code">{c.provider}</code></td>
                  <td><AdminStatusBadge status={c.status} /></td>
                  <td><Link href={`/admin/whatsapp/${c.id}/edit`} className="admin-action">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
