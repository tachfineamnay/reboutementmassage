import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertWhatsappChannelAction, archiveWhatsappChannelAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer WhatsApp — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditWhatsappPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [channel, destinations] = await Promise.all([
    prisma.whatsappChannel.findUnique({ where: { id } }),
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
  ]);
  if (!channel) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader title={channel.label} meta={channel.phoneE164} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      <form action={upsertWhatsappChannelAction} className="admin-form">
        <input type="hidden" name="id" value={channel.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required defaultValue={channel.destinationId} className="admin-input">
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Label *</span>
            <input name="label" required defaultValue={channel.label} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Téléphone E.164 *</span>
            <input name="phoneE164" required defaultValue={channel.phoneE164} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Provider</span>
            <select name="provider" defaultValue={channel.provider} className="admin-input">
              <option value="WHATSAPP_APP">WhatsApp App</option>
              <option value="GHL_WHATSAPP_PLATFORM">GHL Platform</option>
              <option value="META_CLOUD_API">Meta Cloud API</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={channel.status} className="admin-input">
              <option value="NOT_CONFIGURED">Non configuré</option>
              <option value="APP_ONLY">App seule</option>
              <option value="CONNECTED_GHL">GHL connecté</option>
              <option value="ACTIVE">Actif</option>
              <option value="PAUSED">Pause</option>
              <option value="BLOCKED">Bloqué</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL workflow hot lead</span>
            <input name="ghlWorkflowHotLeadId" defaultValue={channel.ghlWorkflowHotLeadId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Fallback URL</span>
            <input name="fallbackUrl" defaultValue={channel.fallbackUrl ?? ""} className="admin-input" />
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Message prérempli FR *</span>
          <textarea name="prefilledMessageFr" required rows={2} defaultValue={channel.prefilledMessageFr} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Message prérempli EN *</span>
          <textarea name="prefilledMessageEn" required rows={2} defaultValue={channel.prefilledMessageEn} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Message prérempli ES *</span>
          <textarea name="prefilledMessageEs" required rows={2} defaultValue={channel.prefilledMessageEs} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Notes</span>
          <textarea name="notes" rows={2} defaultValue={channel.notes ?? ""} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      <form action={archiveWhatsappChannelAction} style={{ marginTop: "24px" }}>
        <input type="hidden" name="id" value={channel.id} />
        <button type="submit" className="admin-btn admin-btn--ghost">Mettre en pause</button>
      </form>
    </div>
  );
}
