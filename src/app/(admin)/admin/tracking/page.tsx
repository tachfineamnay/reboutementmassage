import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

export const metadata: Metadata = { title: "Tracking — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string; destinationId?: string }> };

export default async function TrackingPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, destinationId } = await searchParams;

  const where = {
    ...(status && ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED" }
      : {}),
    ...(destinationId ? { destinationId } : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.trackingProfile.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.trackingProfile.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Profils tracking" meta={`${total} profil${total !== 1 ? "s" : ""}`} action={{ href: "/admin/tracking/new", label: "+ Nouveau profil" }} />

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
        <AdminEmptyState message="Aucun profil tracking." action={{ href: "/admin/tracking/new", label: "Créer un profil" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Destination</th>
                <th>Meta</th>
                <th>GA4</th>
                <th>TikTok</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const warnings: string[] = [];
                if (p.status === "ACTIVE") {
                  const hasAnyPixel = Boolean(p.metaPixelId || p.tiktokPixelId || p.ga4MeasurementId || p.googleAdsId || p.gtmContainerId);
                  if (!hasAnyPixel) {
                    warnings.push("Profil ACTIVE mais aucun pixel ID configuré");
                  }
                }
                if (p.enableMeta && !p.metaPixelId?.trim()) {
                  warnings.push("Meta activé mais Pixel ID vide");
                }
                if (p.enableTikTok && !p.tiktokPixelId?.trim()) {
                  warnings.push("TikTok activé mais Pixel ID vide");
                }
                if (p.enableGA4 && !p.ga4MeasurementId?.trim()) {
                  warnings.push("GA4 activé mais Measurement ID vide");
                }

                return (
                  <tr key={p.id}>
                    <td className="admin-table__title">
                      <Link href={`/admin/tracking/${p.id}/edit`} className="admin-table__title-link">{p.label}</Link>
                      {warnings.map((w) => (
                        <div key={w} style={{ color: "#d97706", fontSize: "11px", marginTop: "2px", fontWeight: 500 }}>
                          ⚠️ {w}
                        </div>
                      ))}
                    </td>
                    <td>{p.destination.cityName}</td>
                    <td>{p.enableMeta ? (p.metaPixelId ?? "✓") : "—"}</td>
                    <td>{p.enableGA4 ? (p.ga4MeasurementId ?? "✓") : "—"}</td>
                    <td>{p.enableTikTok ? (p.tiktokPixelId ?? "✓") : "—"}</td>
                    <td><AdminStatusBadge status={p.status} /></td>
                    <td><Link href={`/admin/tracking/${p.id}/edit`} className="admin-action">Éditer</Link></td>
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
