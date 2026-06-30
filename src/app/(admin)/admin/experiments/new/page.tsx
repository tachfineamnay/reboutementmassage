import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertExperimentAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouvelle expérience — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewExperimentPage() {
  await ensureAdminSchema();
  const landings = await prisma.landingPage.findMany({
    orderBy: { heroTitle: "asc" },
    select: { id: true, heroTitle: true, slug: true },
  });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouvelle expérience A/B" />
      <form action={upsertExperimentAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Landing page *</span>
            <select name="landingPageId" required className="admin-input">
              <option value="">—</option>
              {landings.map((l) => <option key={l.id} value={l.id}>{l.heroTitle}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom *</span>
            <input name="name" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Métrique principale</span>
            <select name="primaryMetric" defaultValue="whatsapp_clicks" className="admin-input">
              <option value="whatsapp_clicks">Clics WhatsApp</option>
              <option value="form_submits">Soumissions formulaire</option>
              <option value="booking_clicks">Clics réservation</option>
              <option value="leads">Leads</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue="DRAFT" className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="RUNNING">En cours</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Hypothèse</span>
          <textarea name="hypothesis" rows={3} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
