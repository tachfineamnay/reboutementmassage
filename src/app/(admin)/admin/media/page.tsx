import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";

export const metadata: Metadata = { title: "Médias — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ type?: string; destinationId?: string; q?: string }> };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { type, destinationId, q } = await searchParams;

  const where = {
    ...(type && ["IMAGE", "VIDEO", "POSTER", "DOCUMENT"].includes(type)
      ? { assetType: type as "IMAGE" | "VIDEO" | "POSTER" | "DOCUMENT" }
      : {}),
    ...(destinationId ? { destinationId } : {}),
    ...(q
      ? {
          OR: [
            { originalName: { contains: q, mode: "insensitive" as const } },
            { filename: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.mediaAsset.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Médias" meta={`${total} asset${total !== 1 ? "s" : ""}`} />

      <form className="admin-filters" method="GET">
        <input type="text" name="q" defaultValue={q} placeholder="Rechercher…" className="admin-input admin-filters__search" />
        <select name="type" defaultValue={type ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous types</option>
          <option value="IMAGE">Image</option>
          <option value="VIDEO">Vidéo</option>
          <option value="POSTER">Poster</option>
          <option value="DOCUMENT">Document</option>
        </select>
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes destinations</option>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucun média trouvé. Les uploads passent par l'uploader existant des articles." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fichier</th>
                <th>Type</th>
                <th>Destination</th>
                <th>Taille</th>
                <th>Dimensions</th>
                <th>Alt FR</th>
                <th>Créé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="admin-table__title">
                    <span>{a.originalName}</span>
                    <span className="admin-table__meta"><code>{a.filename}</code></span>
                  </td>
                  <td>{a.assetType}</td>
                  <td>{a.destination?.cityName ?? "—"}</td>
                  <td>{formatBytes(a.size)}</td>
                  <td>{a.width && a.height ? `${a.width}×${a.height}` : "—"}</td>
                  <td>{a.altFr ? "✓" : "—"}</td>
                  <td className="admin-table__date">{fmt.format(a.createdAt)}</td>
                  <td>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="admin-action">Voir</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 100 && (
        <p className="admin-page__meta" style={{ marginTop: "12px" }}>
          Affichage limité aux 100 plus récents sur {total}.
        </p>
      )}
    </div>
  );
}
