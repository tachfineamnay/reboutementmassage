import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertTestimonialAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouveau témoignage — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  await ensureAdminSchema();

  const [destinations, offers, mediaAssets] = await Promise.all([
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
    prisma.offer.findMany({ orderBy: { internalName: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { filename: "asc" } }),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouveau témoignage" />

      <form action={upsertTestimonialAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché *</span>
            <input name="displayName" required className="admin-input" placeholder="ex: Sophie L." />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Prénom</span>
            <input name="firstName" className="admin-input" placeholder="ex: Sophie" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Profession / Profil</span>
            <input name="occupation" className="admin-input" placeholder="ex: Directrice Marketing" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Type de profil</span>
            <input name="profile" className="admin-input" placeholder="ex: B2C Premium / Sportif" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Pays</span>
            <input name="country" className="admin-input" placeholder="ex: France" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Ville</span>
            <input name="city" className="admin-input" placeholder="ex: Paris" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale *</span>
            <select name="locale" defaultValue="FR" className="admin-input">
              <option value="FR">FR (Français)</option>
              <option value="EN">EN (Anglais)</option>
              <option value="ES">ES (Espagnol)</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Destination liée</span>
            <select name="destinationId" className="admin-input">
              <option value="">— Toutes —</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Offre liée</span>
            <select name="offerId" className="admin-input">
              <option value="">— Toutes —</option>
              {offers.map((o) => <option key={o.id} value={o.id}>{o.internalName}</option>)}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Asset Vidéo</span>
            <select name="mediaAssetId" className="admin-input">
              <option value="">— Aucun média vidéo —</option>
              {mediaAssets.filter(m => m.assetType === "VIDEO").map((m) => (
                <option key={m.id} value={m.id}>{m.originalName} ({m.filename})</option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Asset Poster Image</span>
            <select name="posterImageId" className="admin-input">
              <option value="">— Aucun média poster —</option>
              {mediaAssets.filter(m => m.assetType === "IMAGE" || m.assetType === "POSTER").map((m) => (
                <option key={m.id} value={m.id}>{m.originalName} ({m.filename})</option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">URL de sous-titres (VTT / SRT)</span>
            <input name="subtitlesUrl" className="admin-input" placeholder="ex: /api/uploads/subtitles.vtt" />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Priorité de tri</span>
            <input name="priority" type="number" defaultValue="0" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Score émotionnel (0-10)</span>
            <input name="emotionalScore" type="number" min="0" max="10" defaultValue="0" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Score de crédibilité (0-10)</span>
            <input name="credibilityScore" type="number" min="0" max="10" defaultValue="0" className="admin-input" />
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
          <span className="admin-field__label">Accroche courte *</span>
          <input name="quoteShort" required className="admin-input" placeholder="ex: Une méthode incroyable qui a soulagé mon dos en 2 séances !" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Citation longue (Corps)</span>
          <textarea name="quoteLong" rows={3} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Transcription complète (Transcript)</span>
          <textarea name="transcript" rows={4} className="admin-input" />
        </label>

        <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
          <label className="admin-field admin-field--checkbox">
            <input name="consentOrganic" type="checkbox" defaultChecked />
            <span style={{ marginLeft: "8px" }}>Consentement pour diffusion organique (Réseaux)</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="consentWebsite" type="checkbox" defaultChecked />
            <span style={{ marginLeft: "8px" }}>Consentement pour diffusion Site Web</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="consentAds" type="checkbox" />
            <span style={{ marginLeft: "8px" }}>Consentement pour diffusion Publicité (Ads)</span>
          </label>
        </div>

        <label className="admin-field">
          <span className="admin-field__label">Notes internes de suivi</span>
          <textarea name="notes" rows={2} className="admin-input" placeholder="ex: Reçu sur WhatsApp le 10 Juin" />
        </label>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer le témoignage</button>
        </div>
      </form>
    </div>
  );
}
