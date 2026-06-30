import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertTrackingProfileAction, archiveTrackingProfileAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer tracking — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditTrackingPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [profile, destinations] = await Promise.all([
    prisma.trackingProfile.findUnique({ where: { id } }),
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
  ]);
  if (!profile) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader title={profile.label} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      <form action={upsertTrackingProfileAction} className="admin-form">
        <input type="hidden" name="id" value={profile.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required defaultValue={profile.destinationId} className="admin-input">
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Label *</span>
            <input name="label" required defaultValue={profile.label} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Meta Pixel ID</span>
            <input name="metaPixelId" defaultValue={profile.metaPixelId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GA4 Measurement ID</span>
            <input name="ga4MeasurementId" defaultValue={profile.ga4MeasurementId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">TikTok Pixel ID</span>
            <input name="tiktokPixelId" defaultValue={profile.tiktokPixelId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GTM Container ID</span>
            <input name="gtmContainerId" defaultValue={profile.gtmContainerId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={profile.status} className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif</option>
              <option value="PAUSED">Pause</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableMeta" type="checkbox" defaultChecked={profile.enableMeta} />
            <span>Meta</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableGA4" type="checkbox" defaultChecked={profile.enableGA4} />
            <span>GA4</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableTikTok" type="checkbox" defaultChecked={profile.enableTikTok} />
            <span>TikTok</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="enableGTM" type="checkbox" defaultChecked={profile.enableGTM} />
            <span>GTM</span>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Notes</span>
          <textarea name="notes" rows={2} defaultValue={profile.notes ?? ""} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {profile.status !== "ARCHIVED" && (
        <form action={archiveTrackingProfileAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={profile.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
