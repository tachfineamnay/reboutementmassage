import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import { upsertMediaAssetAction, deleteMediaAssetAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Médias — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    type?: string;
    destinationId?: string;
    q?: string;
    editId?: string;
    deleteBlocked?: string;
    deleteError?: string;
    deleted?: string;
  }>;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { type, destinationId, q, editId, deleteBlocked, deleteError, deleted } = await searchParams;

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

  const [items, destinations, editAsset] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        destination: { select: { cityName: true } },
        landingHeroImages: { select: { id: true, heroTitle: true } },
        landingOgImages: { select: { id: true, heroTitle: true } },
        testimonialMedia: { select: { id: true, displayName: true } },
        testimonialPosters: { select: { id: true, displayName: true } },
      },
    }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
    editId ? prisma.mediaAsset.findUnique({ where: { id: editId } }) : null,
  ]);

  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Médiathèque CMS" meta={`${items.length} asset(s) trouvé(s)`} />

      {deleteBlocked === "1" && (
        <p role="alert" style={{ color: "var(--admin-amber)", marginBottom: "16px", fontWeight: "bold" }}>
          Suppression impossible : ce média est encore utilisé par une landing (hero/OG) ou un témoignage. Retirez-le de ces contenus avant de le supprimer.
        </p>
      )}
      {deleteError === "notfound" && (
        <p role="alert" style={{ color: "red", marginBottom: "16px", fontWeight: "bold" }}>
          Média introuvable.
        </p>
      )}
      {deleteError === "db" && (
        <p role="alert" style={{ color: "red", marginBottom: "16px", fontWeight: "bold" }}>
          La suppression en base a échoué. Le fichier n&apos;a pas été supprimé.
        </p>
      )}
      {deleted === "1" && (
        <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px", fontWeight: "bold" }}>
          Média supprimé avec succès.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr", gap: "24px", marginTop: "20px" }}>
        {/* Liste des médias (à gauche) */}
        <div>
          <form className="admin-filters" method="GET" style={{ marginBottom: "16px" }}>
            <input type="text" name="q" defaultValue={q} placeholder="Rechercher par nom..." className="admin-input admin-filters__search" />
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
            <AdminEmptyState message="Aucun média disponible dans la bibliothèque." />
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Aperçu</th>
                    <th>Fichier</th>
                    <th>Type</th>
                    <th>Taille</th>
                    <th>Stats d'usage</th>
                    <th>Alertes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => {
                    const isHeavy = a.size > 2 * 1024 * 1024; // > 2Mo
                    const isMissingAlt = a.assetType === "IMAGE" && !a.altFr && !a.altEn && !a.altEs;
                    const landingsCount = a.landingHeroImages.length + a.landingOgImages.length;
                    const testimonialsCount = a.testimonialMedia.length + a.testimonialPosters.length;

                    return (
                      <tr key={a.id} style={{ background: editId === a.id ? "rgba(255,255,255,0.04)" : "transparent" }}>
                        <td style={{ width: "60px" }}>
                          {a.assetType === "IMAGE" || a.assetType === "POSTER" ? (
                            <img
                              src={a.url}
                              alt=""
                              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--admin-border)" }}
                            />
                          ) : (
                            <span style={{ fontSize: "20px" }}>🎥</span>
                          )}
                        </td>
                        <td className="admin-table__title">
                          <span style={{ fontWeight: "600" }}>{a.originalName}</span>
                          <span className="admin-table__meta" style={{ fontSize: "11px" }}>
                            Destination: {a.destination?.cityName ?? "Globale"} · {fmt.format(a.createdAt)}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge--published" style={{ fontSize: "10px" }}>{a.assetType}</span>
                        </td>
                        <td>{formatBytes(a.size)}</td>
                        <td style={{ fontSize: "12px" }}>
                          📌 Landings: <strong>{landingsCount}</strong><br />
                          💬 Testimonials: <strong>{testimonialsCount}</strong>
                        </td>
                        <td>
                          {isHeavy && <span style={{ color: "var(--admin-amber)", fontSize: "11px", fontWeight: "600", display: "block" }}>⚠️ Fichier lourd</span>}
                          {isMissingAlt && <span style={{ color: "red", fontSize: "11px", fontWeight: "600", display: "block" }}>⚠️ Pas d'Alt</span>}
                          {!isHeavy && !isMissingAlt && <span style={{ color: "var(--admin-green)", fontSize: "11px" }}>Prêt ✓</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <Link href={`/admin/media?editId=${a.id}${q ? `&q=${q}` : ""}${type ? `&type=${type}` : ""}`} className="admin-action">
                              Éditer
                            </Link>
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="admin-action">
                              Voir
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulaire d'action (à droite) */}
        <div style={{ border: "1px solid var(--admin-border)", borderRadius: "8px", padding: "20px", background: "rgba(255,255,255,0.01)", height: "fit-content" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "16px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "8px" }}>
            {editAsset ? `Modifier: ${editAsset.originalName}` : "Ajouter un média"}
          </h2>

          <form action={upsertMediaAssetAction} className="admin-form" method="POST" encType="multipart/form-data">
            {editAsset && <input type="hidden" name="id" value={editAsset.id} />}

            {!editAsset && (
              <>
                <label className="admin-field">
                  <span className="admin-field__label">Fichier (Image, Vidéo, PDF...)</span>
                  <input type="file" name="file" className="admin-input" />
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Supporte JPG, PNG, WebP, GIF, MP4, WebM, PDF.</span>
                </label>

                <div style={{ textAlign: "center", margin: "10px 0", fontWeight: "bold", fontSize: "12px", color: "var(--admin-text-muted)" }}>
                  — OU —
                </div>

                <label className="admin-field">
                  <span className="admin-field__label">URL Média Externe (ex: YouTube, S3)</span>
                  <input name="externalUrl" className="admin-input" placeholder="https://..." />
                </label>
              </>
            )}

            {editAsset && editAsset.externalUrl && (
              <label className="admin-field">
                <span className="admin-field__label">URL Média Externe</span>
                <input name="externalUrl" defaultValue={editAsset.externalUrl} className="admin-input" />
              </label>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
              <label className="admin-field">
                <span className="admin-field__label">Type de média</span>
                <select name="assetType" defaultValue={editAsset?.assetType ?? "IMAGE"} className="admin-input">
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Vidéo</option>
                  <option value="POSTER">Poster</option>
                  <option value="DOCUMENT">Document</option>
                </select>
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Destination liée</span>
                <select name="destinationId" defaultValue={editAsset?.destinationId ?? ""} className="admin-input">
                  <option value="">— Média global —</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.cityName}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="admin-field" style={{ marginTop: "12px" }}>
              <span className="admin-field__label">Alt Text (Français)</span>
              <input name="altFr" defaultValue={editAsset?.altFr ?? ""} className="admin-input" placeholder="ex: Massage relaxant..." />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Alt Text (Anglais)</span>
              <input name="altEn" defaultValue={editAsset?.altEn ?? ""} className="admin-input" />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Alt Text (Espagnol)</span>
              <input name="altEs" defaultValue={editAsset?.altEs ?? ""} className="admin-input" />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Notes d'utilisation / Droits d'auteur</span>
              <textarea name="usageNotes" defaultValue={editAsset?.usageNotes ?? ""} rows={2} className="admin-input" placeholder="ex: Autorisé uniquement sur landing Saint-Barth" />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Notes de consentement client</span>
              <textarea name="consentNotes" defaultValue={editAsset?.consentNotes ?? ""} rows={2} className="admin-input" placeholder="ex: Signature d'autorisation du 12 Juin 2026" />
            </label>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button type="submit" className="admin-btn admin-btn--primary" style={{ flex: 1 }}>
                {editAsset ? "Enregistrer" : "Créer l'asset"}
              </button>
              {editAsset && (
                <Link href="/admin/media" className="admin-btn admin-btn--secondary" style={{ textDecoration: "none" }}>
                  Annuler
                </Link>
              )}
            </div>
          </form>

          {editAsset && (
            <form action={deleteMediaAssetAction} method="POST" style={{ marginTop: "12px", borderTop: "1px solid var(--admin-border)", paddingTop: "12px" }}>
              <input type="hidden" name="id" value={editAsset.id} />
              <button type="submit" className="admin-btn admin-btn--danger" style={{ width: "100%" }}>
                Supprimer de la bibliothèque 🗑️
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
