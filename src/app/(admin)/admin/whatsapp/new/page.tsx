import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertWhatsappChannelAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouveau canal WhatsApp — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewWhatsappPage() {
  await ensureAdminSchema();
  const destinations = await prisma.destination.findMany({ orderBy: { cityName: "asc" } });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouveau canal WhatsApp" />
      <form action={upsertWhatsappChannelAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required className="admin-input">
              <option value="">—</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Label *</span>
            <input name="label" required className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Téléphone E.164 *</span>
            <input name="phoneE164" required className="admin-input" placeholder="+521..." />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Provider</span>
            <select name="provider" defaultValue="WHATSAPP_APP" className="admin-input">
              <option value="WHATSAPP_APP">WhatsApp App</option>
              <option value="GHL_WHATSAPP_PLATFORM">GHL Platform</option>
              <option value="META_CLOUD_API">Meta Cloud API</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue="NOT_CONFIGURED" className="admin-input">
              <option value="NOT_CONFIGURED">Non configuré</option>
              <option value="APP_ONLY">App seule</option>
              <option value="CONNECTED_GHL">GHL connecté</option>
              <option value="ACTIVE">Actif</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale par défaut</span>
            <select name="defaultLocale" defaultValue="FR" className="admin-input">
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Message prérempli FR *</span>
          <textarea name="prefilledMessageFr" required rows={2} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Message prérempli EN *</span>
          <textarea name="prefilledMessageEn" required rows={2} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Message prérempli ES *</span>
          <textarea name="prefilledMessageEs" required rows={2} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
