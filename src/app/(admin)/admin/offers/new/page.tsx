import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertOfferAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouvelle offre — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const OFFER_TYPES = [
  "PRIVATE_SESSION", "FOUNDER_SESSION", "HOTEL_EXPERIENCE", "HOSPITALITY_PARTNER",
  "WORKSHOP", "TRAINING", "RETREAT", "CORPORATE", "VIP_SIGNATURE",
] as const;

export default async function NewOfferPage() {
  await ensureAdminSchema();
  const destinations = await prisma.destination.findMany({ orderBy: { cityName: "asc" } });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouvelle offre" />
      <form action={upsertOfferAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required className="admin-input">
              <option value="">—</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Type *</span>
            <select name="type" required className="admin-input">
              {OFFER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom interne *</span>
            <input name="internalName" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom public FR *</span>
            <input name="publicNameFr" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom public EN *</span>
            <input name="publicNameEn" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom public ES *</span>
            <input name="publicNameEs" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Durée (min)</span>
            <input name="durationMinutes" type="number" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Prix</span>
            <input name="priceAmount" type="number" step="0.01" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Devise</span>
            <input name="currency" className="admin-input" placeholder="USD" />
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="showPrice" type="checkbox" />
            <span>Afficher le prix</span>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue="DRAFT" className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="READY">Prêt</option>
              <option value="LIVE">Live</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Description courte FR</span>
          <textarea name="shortDescriptionFr" rows={2} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
