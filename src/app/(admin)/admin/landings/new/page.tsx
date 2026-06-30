import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertLandingAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouvelle landing — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TEMPLATES = [
  "MOBILE_WHATSAPP_FIRST", "PREMIUM_PRIVATE_SESSION", "B2B_HOSPITALITY",
  "FORMATION_LEADGEN", "SEO_LOCAL_SERVICE", "EVENT_WORKSHOP",
] as const;

export default async function NewLandingPage() {
  await ensureAdminSchema();
  const destinations = await prisma.destination.findMany({ orderBy: { cityName: "asc" } });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouvelle landing page" />
      <form action={upsertLandingAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required className="admin-input">
              <option value="">—</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale *</span>
            <select name="locale" required defaultValue="FR" className="admin-input">
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Slug *</span>
            <input name="slug" required className="admin-input" placeholder="session-privee-cdmx" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Template</span>
            <select name="template" defaultValue="MOBILE_WHATSAPP_FIRST" className="admin-input">
              {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue="DRAFT" className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="READY">Prêt</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Hero title *</span>
          <input name="heroTitle" required className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Hero subtitle</span>
          <textarea name="heroSubtitle" rows={2} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">CTA principal</span>
          <input name="primaryCta" className="admin-input" placeholder="Écrire sur WhatsApp" />
        </label>
        <input type="hidden" name="painChips" value="[]" />
        <input type="hidden" name="proofBadges" value="[]" />
        <input type="hidden" name="processSteps" value="[]" />
        <input type="hidden" name="faq" value="[]" />
        <input type="hidden" name="content" value="{}" />
        <label className="admin-field admin-field--checkbox">
          <input name="noindex" type="checkbox" defaultChecked />
          <span>noindex (recommandé en brouillon)</span>
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
