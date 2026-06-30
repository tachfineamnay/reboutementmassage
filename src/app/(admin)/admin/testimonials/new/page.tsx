import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertTestimonialAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouveau témoignage — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  await ensureAdminSchema();
  const destinations = await prisma.destination.findMany({ orderBy: { cityName: "asc" } });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouveau témoignage" />
      <form action={upsertTestimonialAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché *</span>
            <input name="displayName" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Prénom</span>
            <input name="firstName" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale *</span>
            <select name="locale" defaultValue="FR" className="admin-input">
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Destination</span>
            <select name="destinationId" className="admin-input">
              <option value="">—</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Priorité</span>
            <input name="priority" type="number" defaultValue={0} className="admin-input" />
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
          <span className="admin-field__label">Citation courte</span>
          <input name="quoteShort" className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Citation longue</span>
          <textarea name="quoteLong" rows={3} className="admin-input" />
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="consentOrganic" type="checkbox" defaultChecked />
          <span>Consentement organique</span>
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="consentWebsite" type="checkbox" />
          <span>Consentement site web</span>
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="consentAds" type="checkbox" />
          <span>Consentement publicité</span>
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
