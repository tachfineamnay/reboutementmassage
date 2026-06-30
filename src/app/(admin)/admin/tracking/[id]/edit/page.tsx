import type { Metadata } from "next";
import Link from "next/link";
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
    prisma.trackingProfile.findUnique({
      where: { id },
      include: {
        landingPages: {
          select: {
            id: true,
            slug: true,
            locale: true,
          },
        },
      },
    }),
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
  ]);
  if (!profile) notFound();

  const warnings: string[] = [];
  if (profile.status === "ACTIVE") {
    const hasAnyPixel = Boolean(profile.metaPixelId || profile.tiktokPixelId || profile.ga4MeasurementId || profile.googleAdsId || profile.gtmContainerId);
    if (!hasAnyPixel) {
      warnings.push("Le profil est marqué ACTIVE mais aucun pixel ID n'est configuré");
    }
  }
  if (profile.enableMeta && !profile.metaPixelId?.trim()) {
    warnings.push("Le pixel Meta est activé mais le Meta Pixel ID est vide");
  }
  if (profile.enableTikTok && !profile.tiktokPixelId?.trim()) {
    warnings.push("Le pixel TikTok est activé mais le TikTok Pixel ID est vide");
  }
  if (profile.enableGA4 && !profile.ga4MeasurementId?.trim()) {
    warnings.push("Le pixel GA4 est activé mais le GA4 Measurement ID est vide");
  }

  const configuredPixels: string[] = [];
  if (profile.metaPixelId) configuredPixels.push(`Meta: ${profile.metaPixelId} (${profile.enableMeta ? "Actif" : "Désactivé"})`);
  if (profile.ga4MeasurementId) configuredPixels.push(`GA4: ${profile.ga4MeasurementId} (${profile.enableGA4 ? "Actif" : "Désactivé"})`);
  if (profile.tiktokPixelId) configuredPixels.push(`TikTok: ${profile.tiktokPixelId} (${profile.enableTikTok ? "Actif" : "Désactivé"})`);
  if (profile.gtmContainerId) configuredPixels.push(`GTM: ${profile.gtmContainerId} (${profile.enableGTM ? "Actif" : "Désactivé"})`);
  if (profile.googleAdsId) configuredPixels.push(`Google Ads: ${profile.googleAdsId} (${profile.enableGoogleAds ? "Actif" : "Désactivé"})`);

  return (
    <div className="admin-page">
      <AdminPageHeader title={profile.label} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      {warnings.length > 0 && (
        <div style={{ padding: "12px 16px", borderRadius: "6px", background: "rgba(217, 119, 6, 0.08)", border: "1px solid #d97706", color: "#d97706", marginBottom: "20px" }}>
          <h4 style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 6px 0" }}>⚠️ Attention :</h4>
          <ul style={{ listStyleType: "disc", margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {configuredPixels.length > 0 && (
        <div style={{ padding: "12px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--admin-border)", color: "var(--admin-text)", marginBottom: "20px" }}>
          <h4 style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 6px 0" }}>Pixels configurés :</h4>
          <ul style={{ listStyleType: "circle", margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
            {configuredPixels.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

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
            <span className="admin-field__label">Google Ads ID</span>
            <input name="googleAdsId" defaultValue={profile.googleAdsId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Consent Mode</span>
            <select name="consentMode" defaultValue={profile.consentMode} className="admin-input">
              <option value="basic">Basic (sans cookies initiaux)</option>
              <option value="advanced">Advanced (Google Consent Mode v2)</option>
            </select>
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
          <label className="admin-field admin-field--checkbox">
            <input name="enableGoogleAds" type="checkbox" defaultChecked={profile.enableGoogleAds} />
            <span>Google Ads</span>
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

      <div style={{ marginTop: "32px", padding: "20px", border: "1px solid var(--admin-border)", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
          Landings utilisant ce profil ({profile.landingPages.length})
        </h3>
        {profile.landingPages.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--admin-muted)" }}>Aucune landing n'utilise ce profil actuellement.</p>
        ) : (
          <ul style={{ fontSize: "13px", listStyle: "none", padding: 0 }}>
            {profile.landingPages.map((l) => (
              <li key={l.id} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>[{l.locale}] /{l.locale.toLowerCase()}/{l.slug}</span>
                <Link href={`/admin/landings/${l.id}/edit`} className="admin-action" style={{ textDecoration: "underline" }}>
                  Modifier la landing
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {profile.status !== "ARCHIVED" && (
        <form action={archiveTrackingProfileAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={profile.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
