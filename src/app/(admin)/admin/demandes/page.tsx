import type { Metadata } from "next";
import type { Locale, Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import {
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
    destinationId?: string;
    landingPageId?: string;
    offerId?: string;
    source?: string;
    campaign?: string;
    intent?: string;
    leadSegment?: string;
    needType?: string;
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

  const destinationId = one(params.destinationId);
  const landingPageId = one(params.landingPageId);
  const offerId = one(params.offerId);
  const source = one(params.source);
  const campaign = one(params.campaign);
  const intent = one(params.intent);
  const leadSegment = one(params.leadSegment);
  const needType = one(params.needType);

  const validStatus = isLeadStatus(status) ? status : undefined;
  const validLocale = LOCALES.includes(locale as Locale) ? (locale as Locale) : undefined;
  const periodStart = getPeriodStart(period);

  const where: Prisma.LeadSubmissionWhereInput = {
    ...(validStatus ? { status: validStatus } : {}),
    ...(validLocale ? { locale: validLocale } : {}),
    ...(type ? { type } : {}),
    ...(periodStart ? { createdAt: { gte: periodStart } } : {}),
    ...(destinationId ? { destinationId } : {}),
    ...(landingPageId ? { landingPageId } : {}),
    ...(offerId ? { offerId } : {}),
    ...(source ? { source } : {}),
    ...(campaign ? { campaign } : {}),
    ...(intent ? { intent } : {}),
    ...(leadSegment ? { leadSegment } : {}),
    ...(needType ? { needType } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { contact: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [
    legacyLeads,
    total,
    typeRows,
    destinations,
    landings,
    offers,
    sources,
    campaigns,
    intents,
    segments,
    needs,
  ] = await Promise.all([
    prisma.leadSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: {
        landingPage: { select: { slug: true, locale: true } },
        growthDestination: { select: { cityName: true } },
        growthOffer: { select: { publicNameFr: true } },
      },
    }),
    prisma.leadSubmission.count({ where }),
    prisma.leadSubmission.findMany({
      distinct: ["type"],
      orderBy: { type: "asc" },
      select: { type: true },
    }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
    prisma.landingPage.findMany({ select: { id: true, slug: true, locale: true }, orderBy: { slug: "asc" } }),
    prisma.offer.findMany({ select: { id: true, publicNameFr: true }, orderBy: { publicNameFr: "asc" } }),
    prisma.leadSubmission.findMany({ distinct: ["source"], select: { source: true }, where: { source: { not: null } } }),
    prisma.leadSubmission.findMany({ distinct: ["campaign"], select: { campaign: true }, where: { campaign: { not: null } } }),
    prisma.leadSubmission.findMany({ distinct: ["intent"], select: { intent: true }, where: { intent: { not: null } } }),
    prisma.leadSubmission.findMany({ distinct: ["leadSegment"], select: { leadSegment: true }, where: { leadSegment: { not: null } } }),
    prisma.leadSubmission.findMany({ distinct: ["needType"], select: { needType: true }, where: { needType: { not: null } } }),
  ]);

  const leads = legacyLeads;
  const pages = Math.ceil(total / LIMIT);
  const hasFilters = !!(
    validStatus ||
    validLocale ||
    type ||
    q ||
    period ||
    destinationId ||
    landingPageId ||
    offerId ||
    source ||
    campaign ||
    intent ||
    leadSegment ||
    needType
  );

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

      <form className="admin-filters" method="GET" action="/admin/demandes" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Recherche prénom..."
          className="admin-input admin-filters__search"
          style={{ minWidth: "180px" }}
        />
        <select name="status" defaultValue={validStatus ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous statuts</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Destinations CMS</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.cityName}
            </option>
          ))}
        </select>
        <select name="landingPageId" defaultValue={landingPageId ?? ""} className="admin-input admin-filters__select">
          <option value="">Landings CMS</option>
          {landings.map((l) => (
            <option key={l.id} value={l.id}>
              /{l.locale.toLowerCase()}/{l.slug}
            </option>
          ))}
        </select>
        <select name="offerId" defaultValue={offerId ?? ""} className="admin-input admin-filters__select">
          <option value="">Offres CMS</option>
          {offers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.publicNameFr}
            </option>
          ))}
        </select>
        <select name="locale" defaultValue={validLocale ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes langues</option>
          <option value="FR">FR</option>
          <option value="EN">EN</option>
          <option value="ES">ES</option>
        </select>
        <select name="source" defaultValue={source ?? ""} className="admin-input admin-filters__select">
          <option value="">Sources</option>
          {sources.map((s) => (
            <option key={s.source} value={s.source ?? ""}>
              {s.source}
            </option>
          ))}
        </select>
        <select name="campaign" defaultValue={campaign ?? ""} className="admin-input admin-filters__select">
          <option value="">Campagnes</option>
          {campaigns.map((c) => (
            <option key={c.campaign} value={c.campaign ?? ""}>
              {c.campaign}
            </option>
          ))}
        </select>
        <select name="intent" defaultValue={intent ?? ""} className="admin-input admin-filters__select">
          <option value="">Intentions</option>
          {intents.map((i) => (
            <option key={i.intent} value={i.intent ?? ""}>
              {i.intent}
            </option>
          ))}
        </select>
        <select name="leadSegment" defaultValue={leadSegment ?? ""} className="admin-input admin-filters__select">
          <option value="">Segments</option>
          {segments.map((seg) => (
            <option key={seg.leadSegment} value={seg.leadSegment ?? ""}>
              {seg.leadSegment}
            </option>
          ))}
        </select>
        <select name="needType" defaultValue={needType ?? ""} className="admin-input admin-filters__select">
          <option value="">Besoins</option>
          {needs.map((n) => (
            <option key={n.needType} value={n.needType ?? ""}>
              {n.needType}
            </option>
          ))}
        </select>
        <select name="period" defaultValue={period ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes périodes</option>
          <option value="today">Aujourd'hui</option>
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
          <table className="admin-table admin-table--leads" style={{ fontSize: "12px" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Prénom</th>
                <th>Contact</th>
                <th>Destination</th>
                <th>Landing</th>
                <th>Offre</th>
                <th>Besoin</th>
                <th>Intention</th>
                <th>Segment</th>
                <th>Langue</th>
                <th>Statut GHL</th>
                <th>Source</th>
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
                    <td>{lead.growthDestination?.cityName ?? lead.destination ?? "—"}</td>
                    <td>
                      {lead.landingPage ? (
                        <Link href={`/admin/landings/${lead.landingPageId}/edit`} style={{ textDecoration: "underline" }}>
                          /{lead.landingPage.locale.toLowerCase()}/{lead.landingPage.slug}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{lead.growthOffer?.publicNameFr ?? "—"}</td>
                    <td>{lead.needType ?? "—"}</td>
                    <td>{lead.intent ?? "—"}</td>
                    <td>{lead.leadSegment ?? "—"}</td>
                    <td>
                      <span className="badge badge--locale">{lead.locale}</span>
                    </td>
                    <td>
                      <span className={LEAD_STATUS_CLASSES[lead.status]}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td>{lead.source ?? "—"}</td>
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
              href={filterUrl({
                status,
                locale,
                type,
                q,
                period,
                destinationId,
                landingPageId,
                offerId,
                source,
                campaign,
                intent,
                leadSegment,
                needType,
                page: String(page - 1),
              })}
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
              href={filterUrl({
                status,
                locale,
                type,
                q,
                period,
                destinationId,
                landingPageId,
                offerId,
                source,
                campaign,
                intent,
                leadSegment,
                needType,
                page: String(page + 1),
              })}
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
