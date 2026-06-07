import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatLeadSlot,
  formatSourcePage,
  isEmailContact,
  LEAD_STATUS_CLASSES,
  LEAD_STATUS_LABELS,
  normalizePhoneContact,
} from "@/lib/admin-leads";
import { archiveLeadAction } from "../actions";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

function stringifyJson(value: unknown) {
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) {
    return "—";
  }
  return JSON.stringify(value, null, 2);
}

function jsonRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function jsonText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function jsonNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lead = await prisma.leadSubmission.findUnique({
    where: { id },
    select: { firstName: true },
  });

  return {
    title: lead ? `${lead.firstName} — Demande — GT Dash` : "Demande — GT Dash",
    robots: { index: false, follow: false },
  };
}

export default async function DemandeDetailPage({ params }: Props) {
  const { id } = await params;
  const lead = await prisma.leadSubmission.findUnique({
    where: { id },
  });

  if (!lead) notFound();

  const phone = normalizePhoneContact(lead.contact);
  const isEmail = isEmailContact(lead.contact);
  const branchData = jsonRecord(lead.branchData);
  const bookingFormat = jsonText(branchData.bookingFormat);
  const durationMinutes = jsonNumber(branchData.durationMinutes);

  return (
    <div className="admin-page">
      <nav className="admin-breadcrumb-nav" aria-label="Fil d'Ariane">
        <Link href="/admin/demandes" className="admin-breadcrumb">
          Demandes
        </Link>
        <span className="admin-breadcrumb-sep">/</span>
        <span className="admin-breadcrumb-current">{lead.firstName}</span>
      </nav>

      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Demande de {lead.firstName}</h1>
          <p className="admin-page__meta">
            Reçue le <time dateTime={lead.createdAt.toISOString()}>{dateFmt.format(lead.createdAt)}</time>
          </p>
        </div>
        <div className="admin-page__actions">
          {phone && (
            <>
              <a href={`tel:${phone.tel}`} className="admin-btn admin-btn--primary">
                Appeler
              </a>
              <a
                href={`https://wa.me/${phone.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--ghost"
              >
                WhatsApp
              </a>
            </>
          )}
          {isEmail && (
            <a href={`mailto:${lead.contact}`} className="admin-btn admin-btn--primary">
              Email
            </a>
          )}
          {lead.status !== "ARCHIVED" && (
            <form action={archiveLeadAction}>
              <input type="hidden" name="id" value={lead.id} />
              <button type="submit" className="admin-btn admin-btn--danger">
                Archiver
              </button>
            </form>
          )}
        </div>
      </div>

      <section className="admin-panel lead-detail-panel">
        <div className="lead-detail-grid">
          <DetailItem label="Prénom" value={lead.firstName} />
          <DetailItem label="Contact" value={lead.contact} />
          <DetailItem label="Type de demande" value={lead.type} />
          <DetailItem label="Langue" value={lead.locale} />
          <DetailItem label="Créneau choisi" value={formatLeadSlot(lead)} />
          <DetailItem
            label="Date sélectionnée"
            value={lead.selectedAt ? dateFmt.format(lead.selectedAt) : "—"}
          />
          {bookingFormat && <DetailItem label="Format choisi" value={bookingFormat} />}
          {durationMinutes && (
            <DetailItem label="Durée" value={`${durationMinutes} minutes`} />
          )}
          <DetailItem label="Page d'origine" value={formatSourcePage(lead.pageUrl)} />
          <DetailItem
            label="Statut"
            value={
              <span className={LEAD_STATUS_CLASSES[lead.status]}>
                {LEAD_STATUS_LABELS[lead.status]}
              </span>
            }
          />
          {lead.companyName && <DetailItem label="Établissement / Société" value={lead.companyName} />}
          {lead.jobTitle && <DetailItem label="Fonction / Poste" value={lead.jobTitle} />}
          {lead.propertyType && <DetailItem label="Type d'établissement" value={lead.propertyType} />}
          {lead.destination && <DetailItem label="Destination" value={lead.destination} />}

          {lead.intent && <DetailItem label="Intention" value={lead.intent} />}
          {lead.preferredChannel && <DetailItem label="Canal préféré" value={lead.preferredChannel} />}
          {lead.routedToUrl && (
            <DetailItem
              label="Redirigé vers"
              value={
                <a href={lead.routedToUrl} target="_blank" rel="noopener noreferrer" className="admin-table__title-link" style={{ textDecoration: "underline" }}>
                  Lien redirection
                </a>
              }
            />
          )}
          {lead.urgency && <DetailItem label="Urgence" value={lead.urgency} />}
          {lead.needType && <DetailItem label="Besoin" value={lead.needType} />}
          {lead.volumePotential && <DetailItem label="Volume" value={lead.volumePotential} />}
          {lead.participantCount && <DetailItem label="Participants" value={lead.participantCount} />}
          {lead.currentLocation && <DetailItem label="Lieu actuel" value={lead.currentLocation} />}

          <DetailItem label="Contact GHL" value={lead.ghlContactId ?? "—"} />
          <DetailItem label="Créée le" value={dateFmt.format(lead.createdAt)} />
          <DetailItem label="Mise à jour le" value={dateFmt.format(lead.updatedAt)} />
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section__title">Contexte complet</h2>
        <div className="admin-panel">
          <p className="lead-detail-text">{lead.context || "—"}</p>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section__title">Données de branche</h2>
        <div className="admin-panel">
          <pre className="lead-detail-code">{stringifyJson(lead.branchData)}</pre>
        </div>
      </section>

      <section className="lead-detail-columns">
        <div className="admin-panel">
          <h2 className="admin-panel__title">UTM</h2>
          <pre className="lead-detail-code">{stringifyJson(lead.utm)}</pre>
        </div>
        <div className="admin-panel">
          <h2 className="admin-panel__title">Tags</h2>
          {lead.tags.length > 0 ? (
            <div className="lead-tags">
              {lead.tags.map((tag) => (
                <span className="badge badge--locale" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="admin-page__meta">—</p>
          )}
        </div>
      </section>

      {(lead.errorMessage || lead.status === "FAILED") && (
        <section className="admin-section">
          <h2 className="admin-section__title">Erreur éventuelle</h2>
          <div className="admin-alert admin-alert--error">{lead.errorMessage || "Erreur GHL sans détail."}</div>
        </section>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="lead-detail-item">
      <span className="lead-detail-item__label">{label}</span>
      <span className="lead-detail-item__value">{value}</span>
    </div>
  );
}
