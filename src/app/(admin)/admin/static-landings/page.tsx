import type { Metadata } from "next";
import Link from "next/link";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { STATIC_LANDINGS_REGISTRY } from "@/data/static-landings-registry";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import StaticLandingHealthBadge from "@/components/admin/growth/StaticLandingHealthBadge";

export const metadata: Metadata = {
  title: "Landings statiques — TMS Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

function formatLastModified(date: string) {
  return fmt.format(new Date(`${date}T00:00:00.000Z`));
}

export default async function StaticLandingsPage() {
  await ensureAdminSchema();

  const landings = STATIC_LANDINGS_REGISTRY;

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Landings statiques"
        meta={`${landings.length} landing${landings.length !== 1 ? "s" : ""}`}
        description="Console de visibilité des pages premium codées à la main. Lecture seule — aucune modification depuis cette page."
      />

      {landings.length === 0 ? (
        <AdminEmptyState message="Aucune landing statique enregistrée." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Marché</th>
                <th>Langue</th>
                <th>Offre</th>
                <th>Statut</th>
                <th>Santé</th>
                <th>Indexable</th>
                <th>Sitemap</th>
                <th>Dernière modif.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {landings.map((landing) => (
                <tr key={landing.id}>
                  <td className="admin-table__title">
                    <span className="admin-table__title-link">{landing.title}</span>
                    <span className="admin-table__meta">{landing.route}</span>
                  </td>
                  <td>{landing.market}</td>
                  <td>
                    <span className="badge badge--locale">{landing.locale.toUpperCase()}</span>
                  </td>
                  <td>{landing.offer}</td>
                  <td>
                    <AdminStatusBadge status={landing.status} />
                  </td>
                  <td>
                    <StaticLandingHealthBadge landing={landing} />
                  </td>
                  <td>{landing.indexable ? "Oui" : "Non"}</td>
                  <td>{landing.sitemap ? "Oui" : "Non"}</td>
                  <td className="admin-table__date">{formatLastModified(landing.lastModified)}</td>
                  <td className="admin-table__actions">
                    <a
                      href={landing.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-action admin-action--view"
                    >
                      Voir live
                    </a>
                    <a
                      href={landing.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-action"
                    >
                      Preview
                    </a>
                    <span className="admin-action admin-action--muted" title={landing.componentPath}>
                      Fichier: <code className="admin-table__slug-code">{landing.componentPath}</code>
                    </span>
                    <span className="admin-action admin-action--muted" title={landing.configPath}>
                      Config: <code className="admin-table__slug-code">{landing.configPath}</code>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="admin-page__meta" style={{ marginTop: "1.5rem" }}>
        Les landings premium (ex. CDMX) restent statiques dans le code.{" "}
        <Link href="/admin/pages">Builder legacy</Link> ne doit pas être utilisé pour ces pages.
      </p>
    </div>
  );
}
