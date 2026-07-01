import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Landing Sections — Platform Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const LOCALE_LABELS: Record<string, string> = {
  FR: "🇫🇷 FR",
  EN: "🇬🇧 EN",
  ES: "🇪🇸 ES",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "badge badge--draft",
  PUBLISHED: "badge badge--published",
  ARCHIVED: "badge badge--archived",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export default async function SectionsPage() {
  const sections = await prisma.landingSection.findMany({
    orderBy: [{ locale: "asc" }, { placement: "asc" }],
    select: {
      id: true,
      type: true,
      locale: true,
      status: true,
      placement: true,
      title: true,
      updatedAt: true,
    },
  });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Landing Sections</h1>
        <Link
          href="/admin/sections/new"
          className="admin-btn admin-btn--primary"
        >
          + Nouvelle section
        </Link>
      </div>

      <p className="admin-page__desc">
        Blocs dynamiques affichés sur la landing page, par locale et ordre de placement.
      </p>

      {sections.length === 0 ? (
        <div className="admin-empty">
          <p>Aucune section configurée.</p>
          <Link
            href="/admin/sections/new"
            className="admin-btn admin-btn--primary"
          >
            Créer la première section
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Titre</th>
                <th>Langue</th>
                <th>Statut</th>
                <th>Mis à jour</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id}>
                  <td className="admin-table__placement">{s.placement}</td>
                  <td>
                    <code className="admin-table__code">{s.type}</code>
                  </td>
                  <td className="admin-table__title">
                    <span>{s.title ?? <em>Sans titre</em>}</span>
                  </td>
                  <td>
                    <span className="badge badge--locale">
                      {LOCALE_LABELS[s.locale] ?? s.locale}
                    </span>
                  </td>
                  <td>
                    <span className={STATUS_CLASS[s.status] ?? "badge"}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="admin-table__date">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(s.updatedAt)}
                  </td>
                  <td className="admin-table__actions">
                    <Link
                      href={`/admin/sections/${s.id}/edit`}
                      className="admin-action"
                    >
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="admin-count">
        {sections.length} section{sections.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
