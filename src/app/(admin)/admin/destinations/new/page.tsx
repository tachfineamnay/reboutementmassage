import type { Metadata } from "next";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertDestinationAction } from "@/lib/growth/actions";

export const metadata: Metadata = {
  title: "Nouvelle destination — Growth CMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewDestinationPage() {
  await ensureAdminSchema();

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouvelle destination" meta="Créer une destination Growth CMS" />

      <form action={upsertDestinationAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Slug *</span>
            <input name="slug" required className="admin-input" placeholder="cdmx" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Ville *</span>
            <input name="cityName" required className="admin-input" placeholder="Mexico City" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché FR *</span>
            <input name="displayNameFr" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché EN *</span>
            <input name="displayNameEn" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché ES *</span>
            <input name="displayNameEs" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Pays *</span>
            <input name="country" required className="admin-input" placeholder="MX" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Région</span>
            <input name="region" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Timezone</span>
            <input name="timezone" defaultValue="America/Mexico_City" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Devise</span>
            <input name="currency" defaultValue="USD" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue="DRAFT" className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="READY">Prêt</option>
              <option value="LIVE">Live</option>
              <option value="PAUSED">En pause</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Maturité</span>
            <select name="maturity" defaultValue="TEST" className="admin-input">
              <option value="TEST">Test</option>
              <option value="ACTIVE">Active</option>
              <option value="PREMIUM">Premium</option>
              <option value="PARTNERSHIP">Partenariat</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Notes internes</span>
          <textarea name="internalNotes" rows={3} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
