import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertOfferAction, archiveOfferAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer offre — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const OFFER_TYPES = [
  "PRIVATE_SESSION", "FOUNDER_SESSION", "HOTEL_EXPERIENCE", "HOSPITALITY_PARTNER",
  "WORKSHOP", "TRAINING", "RETREAT", "CORPORATE", "VIP_SIGNATURE",
] as const;

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditOfferPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [offer, destinations] = await Promise.all([
    prisma.offer.findUnique({ where: { id } }),
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
  ]);
  if (!offer) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader title={offer.internalName} meta={offer.type} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      <form action={upsertOfferAction} className="admin-form">
        <input type="hidden" name="id" value={offer.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required defaultValue={offer.destinationId} className="admin-input">
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Type *</span>
            <select name="type" required defaultValue={offer.type} className="admin-input">
              {OFFER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom interne *</span>
            <input name="internalName" required defaultValue={offer.internalName} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom public FR *</span>
            <input name="publicNameFr" required defaultValue={offer.publicNameFr} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom public EN *</span>
            <input name="publicNameEn" required defaultValue={offer.publicNameEn} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom public ES *</span>
            <input name="publicNameEs" required defaultValue={offer.publicNameEs} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Durée (min)</span>
            <input name="durationMinutes" type="number" defaultValue={offer.durationMinutes ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Prix</span>
            <input name="priceAmount" type="number" step="0.01" defaultValue={offer.priceAmount?.toString() ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Devise</span>
            <input name="currency" defaultValue={offer.currency ?? ""} className="admin-input" />
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="showPrice" type="checkbox" defaultChecked={offer.showPrice} />
            <span>Afficher le prix</span>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={offer.status} className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="READY">Prêt</option>
              <option value="LIVE">Live</option>
              <option value="PAUSED">Pause</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">CTA principal FR</span>
          <input name="primaryCtaFr" defaultValue={offer.primaryCtaFr ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Description courte FR</span>
          <textarea name="shortDescriptionFr" rows={2} defaultValue={offer.shortDescriptionFr ?? ""} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {offer.status !== "ARCHIVED" && (
        <form action={archiveOfferAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={offer.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
