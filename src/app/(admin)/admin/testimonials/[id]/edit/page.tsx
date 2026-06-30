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

  const [testimonial, destinations, offers] = await Promise.all([
    prisma.testimonial.findUnique({ where: { id } }),
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
    prisma.offer.findMany({ orderBy: { internalName: "asc" } }),
  ]);
  if (!testimonial) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader title={testimonial.displayName} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      <form action={upsertTestimonialAction} className="admin-form">
        <input type="hidden" name="id" value={testimonial.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché *</span>
            <input name="displayName" required defaultValue={testimonial.displayName} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Prénom</span>
            <input name="firstName" defaultValue={testimonial.firstName ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale *</span>
            <select name="locale" defaultValue={testimonial.locale} className="admin-input">
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Destination</span>
            <select name="destinationId" defaultValue={testimonial.destinationId ?? ""} className="admin-input">
              <option value="">—</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Offre</span>
            <select name="offerId" defaultValue={testimonial.offerId ?? ""} className="admin-input">
              <option value="">—</option>
              {offers.map((o) => <option key={o.id} value={o.id}>{o.internalName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Priorité</span>
            <input name="priority" type="number" defaultValue={testimonial.priority} className="admin-input" />
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
          <span className="admin-field__label">Citation courte</span>
          <input name="quoteShort" defaultValue={testimonial.quoteShort ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Citation longue</span>
          <textarea name="quoteLong" rows={3} defaultValue={testimonial.quoteLong ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Transcript</span>
          <textarea name="transcript" rows={4} defaultValue={testimonial.transcript ?? ""} className="admin-input" />
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="consentOrganic" type="checkbox" defaultChecked={testimonial.consentOrganic} />
          <span>Consentement organique</span>
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="consentWebsite" type="checkbox" defaultChecked={testimonial.consentWebsite} />
          <span>Consentement site web</span>
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="consentAds" type="checkbox" defaultChecked={testimonial.consentAds} />
          <span>Consentement publicité</span>
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {testimonial.status !== "ARCHIVED" && (
        <form action={archiveTestimonialAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={testimonial.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
