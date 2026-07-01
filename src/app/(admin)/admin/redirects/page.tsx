import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";

export const metadata: Metadata = { title: "Redirects — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ active?: string; q?: string }> };

export default async function RedirectsPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { active, q } = await searchParams;

  const where = {
    ...(active === "true" ? { active: true } : active === "false" ? { active: false } : {}),
    ...(q
      ? {
          OR: [
            { sourcePath: { contains: q, mode: "insensitive" as const } },
            { targetPath: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.redirectRule.findMany({ where, orderBy: { updatedAt: "desc" } }),
    prisma.redirectRule.count({ where }),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Règles de redirection" meta={`${total} règle${total !== 1 ? "s" : ""}`} action={{ href: "/admin/redirects/new", label: "+ Nouvelle redirection" }} />

      <form className="admin-filters" method="GET">
        <input type="text" name="q" defaultValue={q} placeholder="Chemin source ou cible…" className="admin-input admin-filters__search" />
        <select name="active" defaultValue={active ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes</option>
          <option value="true">Actives</option>
          <option value="false">Inactives</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucune redirection." action={{ href: "/admin/redirects/new", label: "Créer une redirection" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Cible</th>
                <th>Code</th>
                <th>Active</th>
                <th>Clics</th>
                <th>Dernier clic</th>
                <th>Raison</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className={!r.active ? "row--archived" : ""}>
                  <td><code className="admin-table__slug-code">{r.sourcePath}</code></td>
                  <td><code className="admin-table__slug-code">{r.targetPath}</code></td>
                  <td>{r.statusCode}</td>
                  <td>{r.active ? "✓" : "—"}</td>
                  <td><strong>{r.hits}</strong></td>
                  <td style={{ fontSize: "12px" }}>
                    {r.lastHitAt
                      ? new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(r.lastHitAt))
                      : "—"}
                  </td>
                  <td>{r.reason ?? "—"}</td>
                  <td><Link href={`/admin/redirects/${r.id}/edit`} className="admin-action">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
