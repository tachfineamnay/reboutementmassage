import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { localeToLang } from "@/lib/growth/types";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import ReadinessScoreBadge from "@/components/admin/growth/ReadinessScoreBadge";

export const metadata: Metadata = { title: "Landings — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string; destinationId?: string; locale?: string; q?: string }> };

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export default async function LandingsPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const { status, destinationId, locale, q } = await searchParams;

  const where = {
    ...(status && ["DRAFT", "READY", "LIVE", "PAUSED", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "READY" | "LIVE" | "PAUSED" | "ARCHIVED" }
      : {}),
    ...(destinationId ? { destinationId } : {}),
    ...(locale && ["FR", "EN", "ES"].includes(locale) ? { locale: locale as "FR" | "EN" | "ES" } : {}),
    ...(q
      ? {
          OR: [
            { heroTitle: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.landingPage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.landingPage.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  const hasFilters = !!(status || destinationId || locale || q);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Landing pages" meta={`${total} landing${total !== 1 ? "s" : ""}`} action={{ href: "/admin/landings/new", label: "+ Nouvelle landing" }} />

      <form className="admin-filters" method="GET">
        <input type="text" name="q" defaultValue={q} placeholder="Rechercher…" className="admin-input admin-filters__search" />
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
          <option value="PAUSED">Pause</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
        {hasFilters && <Link href="/admin/landings" className="admin-btn admin-btn--ghost">Réinitialiser</Link>}
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucune landing." action={{ href: "/admin/landings/new", label: "Créer une landing" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Slug</th>
                <th>Destination</th>
                <th>Locale</th>
                <th>Readiness</th>
                <th>Statut</th>
                <th>Modifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id}>
                  <td className="admin-table__title">
                    <Link href={`/admin/landings/${l.id}/edit`} className="admin-table__title-link">{l.heroTitle}</Link>
                    <span className="admin-table__meta">{l.template}</span>
                  </td>
                  <td>
                    <code className="admin-table__slug-code">/{localeToLang(l.locale)}/{l.slug}</code>
                  </td>
                  <td>{l.destination.cityName}</td>
                  <td><span className="badge badge--locale">{l.locale}</span></td>
                  <td><ReadinessScoreBadge score={l.readinessScore} /></td>
                  <td><AdminStatusBadge status={l.status} /></td>
                  <td className="admin-table__date">{fmt.format(l.updatedAt)}</td>
                  <td className="admin-table__actions">
                    <Link href={`/admin/landings/${l.id}/edit`} className="admin-action">Éditer</Link>
                    {l.status === "LIVE" && (
                      <a href={`/${localeToLang(l.locale)}/${l.slug}`} target="_blank" rel="noopener noreferrer" className="admin-action admin-action--view">↗</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
