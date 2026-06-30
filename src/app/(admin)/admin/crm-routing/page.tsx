import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

export const metadata: Metadata = { title: "CRM Routing — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string; destinationId?: string }> };

export default async function CrmRoutingPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, destinationId } = await searchParams;

  const where = {
    ...(status && ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED" }
      : {}),
    ...(destinationId ? { destinationId } : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.crmRoutingRule.findMany({
      where,
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.crmRoutingRule.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Règles CRM" meta={`${total} règle${total !== 1 ? "s" : ""}`} action={{ href: "/admin/crm-routing/new", label: "+ Nouvelle règle" }} />

      <form className="admin-filters" method="GET">
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes destinations</option>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
          <option value="PAUSED">Pause</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucune règle CRM." action={{ href: "/admin/crm-routing/new", label: "Créer une règle" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Priorité</th>
                <th>Destination</th>
                <th>Locale</th>
                <th>Segment</th>
                <th>Pipeline GHL</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.priority}</td>
                  <td>{r.destination.cityName}</td>
                  <td>{r.locale ?? "—"}</td>
                  <td>{r.leadSegment ?? r.intent ?? "—"}</td>
                  <td><code className="admin-table__code">{r.ghlPipelineId ?? "—"}</code></td>
                  <td><AdminStatusBadge status={r.status} /></td>
                  <td><Link href={`/admin/crm-routing/${r.id}/edit`} className="admin-action">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
