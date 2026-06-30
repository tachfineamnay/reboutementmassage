import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertDestinationAction, archiveDestinationAction } from "@/lib/growth/actions";

export const metadata: Metadata = {
  title: "Éditer destination — Growth CMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditDestinationPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const destination = await prisma.destination.findUnique({ where: { id } });
  if (!destination) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={destination.displayNameFr || destination.cityName}
        meta={`Slug : ${destination.slug}`}
      />

      {saved === "1" && (
        <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>
          Enregistré.
        </p>
      )}

      <form action={upsertDestinationAction} className="admin-form">
        <input type="hidden" name="id" value={destination.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Slug *</span>
            <input name="slug" required defaultValue={destination.slug} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Ville *</span>
            <input name="cityName" required defaultValue={destination.cityName} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché FR *</span>
            <input name="displayNameFr" required defaultValue={destination.displayNameFr} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché EN *</span>
            <input name="displayNameEn" required defaultValue={destination.displayNameEn} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom affiché ES *</span>
            <input name="displayNameEs" required defaultValue={destination.displayNameEs} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Pays *</span>
            <input name="country" required defaultValue={destination.country} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Région</span>
            <input name="region" defaultValue={destination.region ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Timezone</span>
            <input name="timezone" defaultValue={destination.timezone} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Devise</span>
            <input name="currency" defaultValue={destination.currency} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={destination.status} className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="READY">Prêt</option>
              <option value="LIVE">Live</option>
              <option value="PAUSED">En pause</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Maturité</span>
            <select name="maturity" defaultValue={destination.maturity} className="admin-input">
              <option value="TEST">Test</option>
              <option value="ACTIVE">Active</option>
              <option value="PREMIUM">Premium</option>
              <option value="PARTNERSHIP">Partenariat</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Notes internes</span>
          <textarea name="internalNotes" rows={3} defaultValue={destination.internalNotes ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Notes publiques</span>
          <textarea name="publicNotes" rows={2} defaultValue={destination.publicNotes ?? ""} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {destination.status !== "ARCHIVED" && (
        <form action={archiveDestinationAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={destination.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
