import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

export const metadata: Metadata = { title: "Expériences — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string; landingPageId?: string }> };

export default async function ExperimentsPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, landingPageId } = await searchParams;

  const where = {
    ...(status && ["DRAFT", "RUNNING", "PAUSED", "COMPLETED", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED" }
      : {}),
    ...(landingPageId ? { landingPageId } : {}),
  };

  const [items, total, landings] = await Promise.all([
    prisma.experiment.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        landingPage: { select: { heroTitle: true, slug: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.experiment.count({ where }),
    prisma.landingPage.findMany({ select: { id: true, heroTitle: true }, orderBy: { heroTitle: "asc" }, take: 50 }),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Experiments" meta={`${total} experiment${total !== 1 ? "s" : ""}`} action={{ href: "/admin/experiments/new", label: "+ New experiment" }} />

      <form className="admin-filters" method="GET">
        <select name="landingPageId" defaultValue={landingPageId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes landings</option>
          {landings.map((l) => <option key={l.id} value={l.id}>{l.heroTitle}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="RUNNING">En cours</option>
          <option value="PAUSED">Pause</option>
          <option value="COMPLETED">Terminé</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucune expérience." action={{ href: "/admin/experiments/new", label: "Créer une expérience" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Landing</th>
                <th>Variantes</th>
                <th>Métrique</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td className="admin-table__title">
                    <Link href={`/admin/experiments/${e.id}/edit`} className="admin-table__title-link">{e.name}</Link>
                  </td>
                  <td>{e.landingPage.heroTitle}</td>
                  <td>{e._count.variants}</td>
                  <td><code className="admin-table__code">{e.primaryMetric}</code></td>
                  <td><AdminStatusBadge status={e.status} /></td>
                  <td><Link href={`/admin/experiments/${e.id}/edit`} className="admin-action">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
