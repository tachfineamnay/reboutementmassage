import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertTestimonialAction, archiveTestimonialAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer témoignage — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditTestimonialPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [testimonial, destinations, offers, mediaAssets] = await Promise.all([
    prisma.testimonial.findUnique({ where: { id } }),
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
    prisma.offer.findMany({ orderBy: { internalName: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { filename: "asc" } }),
  ]);
  if (!testimonial) notFound();

  const selectedPoster = mediaAssets.find(m => m.id === testimonial.posterImageId);

  return (
    <div className="admin-page">
      <AdminPageHeader title={testimonial.displayName} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px", fontWeight: "bold" }}>✅ Témoignage enregistré.</p>}

      <form action={upsertTestimonialAction} className="admin-form">
        <input type="hidden" name="id" value={testimonial.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché *</span>
            <input name="displayName" required defaultValue={testimonial.displayName} className="admin-input" placeholder="ex: Sophie L." />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Prénom</span>
            <input name="firstName" defaultValue={testimonial.firstName ?? ""} className="admin-input" placeholder="ex: Sophie" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Profession / Profil</span>
            <input name="occupation" defaultValue={testimonial.occupation ?? ""} className="admin-input" placeholder="ex: Directrice Marketing" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Type de profil</span>
            <input name="profile" defaultValue={testimonial.profile ?? ""} className="admin-input" placeholder="ex: B2C Premium / Sportif" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Pays</span>
            <input name="country" defaultValue={testimonial.country ?? ""} className="admin-input" placeholder="ex: France" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Ville</span>
            <input name="city" defaultValue={testimonial.city ?? ""} className="admin-input" placeholder="ex: Paris" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale *</span>
            <select name="locale" defaultValue={testimonial.locale} className="admin-input">
              <option value="FR">FR (Français)</option>
              <option value="EN">EN (Anglais)</option>
              <option value="ES">ES (Espagnol)</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Destination liée</span>
            <select name="destinationId" defaultValue={testimonial.destinationId ?? ""} className="admin-input">
              <option value="">— Toutes —</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Offre liée</span>
            <select name="offerId" defaultValue={testimonial.offerId ?? ""} className="admin-input">
              <option value="">— Toutes —</option>
              {offers.map((o) => <option key={o.id} value={o.id}>{o.internalName}</option>)}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Asset Vidéo</span>
            <select name="mediaAssetId" defaultValue={testimonial.mediaAssetId ?? ""} className="admin-input">
              <option value="">— Aucun média vidéo —</option>
              {mediaAssets.filter(m => m.assetType === "VIDEO").map((m) => (
                <option key={m.id} value={m.id}>{m.originalName} ({m.filename})</option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Asset Poster Image</span>
            <select name="posterImageId" defaultValue={testimonial.posterImageId ?? ""} className="admin-input">
              <option value="">— Aucun média poster —</option>
              {mediaAssets.filter(m => m.assetType === "IMAGE" || m.assetType === "POSTER").map((m) => (
                <option key={m.id} value={m.id}>{m.originalName} ({m.filename})</option>
              ))}
            </select>
            {selectedPoster && (
              <div style={{ marginTop: "6px" }}>
                <img src={selectedPoster.url} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
              </div>
            )}
          </label>

          <label className="admin-field">
            <span className="admin-field__label">URL de sous-titres (VTT / SRT)</span>
            <input name="subtitlesUrl" defaultValue={testimonial.subtitlesUrl ?? ""} className="admin-input" placeholder="ex: /api/uploads/subtitles.vtt" />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Priorité de tri</span>
            <input name="priority" type="number" defaultValue={testimonial.priority} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Score émotionnel (0-10)</span>
            <input name="emotionalScore" type="number" min="0" max="10" defaultValue={testimonial.emotionalScore} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Score de crédibilité (0-10)</span>
            <input name="credibilityScore" type="number" min="0" max="10" defaultValue={testimonial.credibilityScore} className="admin-input" />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={testimonial.status} className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="READY">Prêt</option>
              <option value="LIVE">Live</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>
        </div>

        <label className="admin-field">
          <span className="admin-field__label">Accroche courte *</span>
          <input name="quoteShort" required defaultValue={testimonial.quoteShort ?? ""} className="admin-input" placeholder="ex: Une méthode incroyable qui a soulagé mon dos en 2 séances !" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Citation longue (Corps)</span>
          <textarea name="quoteLong" rows={3} defaultValue={testimonial.quoteLong ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Transcription complète (Transcript)</span>
          <textarea name="transcript" rows={4} defaultValue={testimonial.transcript ?? ""} className="admin-input" />
        </label>

        <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
          <label className="admin-field admin-field--checkbox">
            <input name="consentOrganic" type="checkbox" defaultChecked={testimonial.consentOrganic} />
            <span style={{ marginLeft: "8px" }}>Consentement pour diffusion organique (Réseaux)</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="consentWebsite" type="checkbox" defaultChecked={testimonial.consentWebsite} />
            <span style={{ marginLeft: "8px" }}>Consentement pour diffusion Site Web</span>
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="consentAds" type="checkbox" defaultChecked={testimonial.consentAds} />
            <span style={{ marginLeft: "8px" }}>Consentement pour diffusion Publicité (Ads)</span>
          </label>
        </div>

        <label className="admin-field">
          <span className="admin-field__label">Notes internes de suivi</span>
          <textarea name="notes" rows={2} defaultValue={testimonial.notes ?? ""} className="admin-input" placeholder="ex: Contacté par email le 10 Juin" />
        </label>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer les modifications</button>
        </div>
      </form>

      {testimonial.status !== "ARCHIVED" && (
        <form action={archiveTestimonialAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={testimonial.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver le témoignage</button>
        </form>
      )}
    </div>
  );
}
