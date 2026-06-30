import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertTrackingProfileAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouveau tracking — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewTrackingPage() {
  await ensureAdminSchema();
  const destinations = await prisma.destination.findMany({ orderBy: { cityName: "asc" } });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouveau profil tracking" />
      <form action={upsertTrackingProfileAction} className="admin-form">
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
            <span className="admin-field__label">Meta Pixel ID</span>
            <input name="metaPixelId" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GA4 Measurement ID</span>
            <input name="ga4MeasurementId" className="admin-input" placeholder="G-..." />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">TikTok Pixel ID</span>
            <input name="tiktokPixelId" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GTM Container ID</span>
            <input name="gtmContainerId" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Google Ads ID</span>
            <input name="googleAdsId" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Consent Mode</span>
            <select name="consentMode" defaultValue="basic" className="admin-input">
              <option value="basic">Basic (sans cookies initiaux)</option>
              <option value="advanced">Advanced (Google Consent Mode v2)</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue="DRAFT" className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif</option>
            </select>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableMeta" type="checkbox" defaultChecked />
            <span>Meta</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableGA4" type="checkbox" defaultChecked />
            <span>GA4</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableTikTok" type="checkbox" />
            <span>TikTok</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableGTM" type="checkbox" />
            <span>GTM</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableGoogleAds" type="checkbox" />
            <span>Google Ads</span>
          </label>
        </div>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
