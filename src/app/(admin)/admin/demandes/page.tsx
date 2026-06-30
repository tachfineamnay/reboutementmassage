import type { Metadata } from "next";
import type { Locale, Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import {
  formatBookingFormat,
  formatLeadChannel,
  formatLeadSlot,
  formatSourcePage,
  isEmailContact,
  isLeadStatus,
  LEAD_STATUS_CLASSES,
  LEAD_STATUS_LABELS,
  normalizePhoneContact,
} from "@/lib/admin-leads";
import { archiveLeadAction } from "./actions";

export const metadata: Metadata = {
  title: "Demandes — GT Dash",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    locale?: string;
    type?: string;
    q?: string;
    period?: string;
    page?: string;
  }>;
};

const LOCALES: Locale[] = ["FR", "EN", "ES"];
const LIMIT = 25;

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPeriodStart(period: string | undefined) {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return start;
  }
  if (period === "month") {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    return start;
  }
  return undefined;
}

function filterUrl(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return `/admin/demandes${query ? `?${query}` : ""}`;
}

export default async function DemandesPage({ searchParams }: PageProps) {
  await ensureAdminSchema();

  const params = await searchParams;
  const status = one(params.status);
  const locale = one(params.locale);
  const type = one(params.type);
  const q = one(params.q);
  const period = one(params.period);
  const page = Math.max(1, Number(one(params.page) ?? "1"));

  const validStatus = isLeadStatus(status) ? status : undefined;
  const validLocale = LOCALES.includes(locale as Locale) ? (locale as Locale) : undefined;
  const periodStart = getPeriodStart(period);

  const where: Prisma.LeadSubmissionWhereInput = {
    ...(validStatus ? { status: validStatus } : {}),
    ...(validLocale ? { locale: validLocale } : {}),
    ...(type ? { type } : {}),
    ...(periodStart ? { createdAt: { gte: periodStart } } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { contact: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [legacyLeads, total, typeRows] = await Promise.all([
    prisma.leadSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      select: {
        id: true,
        firstName: true,
        contact: true,
        type: true,
        locale: true,
        intent: true,
        preferredChannel: true,
        leadSegment: true,
        branchData: true,
        selectedDayLabel: true,
        selectedTime: true,
        timezone: true,
        pageUrl: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.leadSubmission.count({ where }),
    prisma.leadSubmission.findMany({
      distinct: ["type"],
      orderBy: { type: "asc" },
      select: { type: true },
    }),
  ]);
  const leads = legacyLeads;

  const pages = Math.ceil(total / LIMIT);
  const hasFilters = !!(validStatus || validLocale || type || q || period);

  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Demandes</h1>
          <p className="admin-page__meta">
            {total} demande{total !== 1 ? "s" : ""}
            {hasFilters ? " filtrée(s)" : " reçue(s)"}
          </p>
        </div>
      </div>

      <form className="admin-filters" method="GET" action="/admin/demandes">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Prénom ou contact"
          className="admin-input admin-filters__search"
        />
        <select name="status" defaultValue={validStatus ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous les statuts</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="locale" defaultValue={validLocale ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes langues</option>
          <option value="FR">FR</option>
          <option value="EN">EN</option>
          <option value="ES">ES</option>
        </select>
        <select name="type" defaultValue={type ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous types</option>
          {typeRows.map((row) => (
            <option key={row.type} value={row.type}>
              {row.type}
            </option>
          ))}
        </select>
        <select name="period" defaultValue={period ?? ""} className="admin-input admin-filters__select">
          <option value="">Toute période</option>
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">7 derniers jours</option>
          <option value="month">30 derniers jours</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">
          Filtrer
        </button>
        {hasFilters && (
          <Link href="/admin/demandes" className="admin-btn admin-btn--ghost">
            Réinitialiser
          </Link>
        )}
      </form>

      {leads.length === 0 ? (
        <div className="admin-empty">
          <p>Aucune demande ne correspond aux filtres.</p>
          {hasFilters && (
            <Link href="/admin/demandes" className="admin-btn admin-btn--ghost">
              Voir toutes les demandes
            </Link>
          )}
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table admin-table--leads">
            <thead>
              <tr>
                <th>Date</th>
                <th>Prénom</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Intention</th>
                <th>Canal</th>
                <th>Segment</th>
                <th>Format</th>
                <th>Langue</th>
                <th>Créneau choisi</th>
                <th>Statut GHL</th>
                <th>Source / page</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const phone = normalizePhoneContact(lead.contact);
                const isEmail = isEmailContact(lead.contact);

                return (
                  <tr key={lead.id} className={lead.status === "ARCHIVED" ? "row--archived" : ""}>
                    <td className="admin-table__date">
                      <time dateTime={lead.createdAt.toISOString()}>{dateFmt.format(lead.createdAt)}</time>
                    </td>
                    <td className="admin-table__title">
                      <Link href={`/admin/demandes/${lead.id}`} className="admin-table__title-link">
                        {lead.firstName}
                      </Link>
                    </td>
                    <td className="admin-table__contact">{lead.contact}</td>
                    <td>{lead.type}</td>
                    <td>{lead.intent ?? "—"}</td>
                    <td>{formatLeadChannel(lead.preferredChannel)}</td>
                    <td>{lead.leadSegment ?? "—"}</td>
                    <td>{formatBookingFormat(lead.branchData)}</td>
                    <td>
                      <span className="badge badge--locale">{lead.locale}</span>
                    </td>
                    <td className="admin-table__date">{formatLeadSlot(lead)}</td>
                    <td>
                      <span className={LEAD_STATUS_CLASSES[lead.status]}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="admin-table__source">{formatSourcePage(lead.pageUrl)}</td>
                    <td className="admin-table__actions">
                      <Link href={`/admin/demandes/${lead.id}`} className="admin-action">
                        Détail
                      </Link>
                      {phone && (
                        <a href={`tel:${phone.tel}`} className="admin-action">
                          Appeler
                        </a>
                      )}
                      {isEmail && (
                        <a href={`mailto:${lead.contact}`} className="admin-action">
                          Email
                        </a>
                      )}
                      {lead.status !== "ARCHIVED" && (
                        <form action={archiveLeadAction}>
                          <input type="hidden" name="id" value={lead.id} />
                          <button type="submit" className="admin-action admin-action--danger">
                            Archiver
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="admin-pagination">
          {page > 1 && (
            <Link
              href={filterUrl({ status, locale, type, q, period, page: String(page - 1) })}
              className="admin-btn admin-btn--ghost admin-btn--sm"
            >
              Précédent
            </Link>
          )}
          <span className="admin-pagination__info">
            Page {page} / {pages}
          </span>
          {page < pages && (
            <Link
              href={filterUrl({ status, locale, type, q, period, page: String(page + 1) })}
              className="admin-btn admin-btn--ghost admin-btn--sm"
            >
              Suivant
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
