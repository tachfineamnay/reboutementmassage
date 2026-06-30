import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertWhatsappChannelAction, archiveWhatsappChannelAction } from "@/lib/growth/actions";
import { isValidE164 } from "@/lib/growth/whatsapp";
import WhatsappTestButtons from "@/components/admin/WhatsappTestButtons";

export const metadata: Metadata = { title: "Éditer WhatsApp — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditWhatsappPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [channel, destinations] = await Promise.all([
    prisma.whatsappChannel.findUnique({
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
  if (!channel) notFound();

  const warnings: string[] = [];
  if (channel.status !== "ACTIVE") {
    warnings.push("Statut non ACTIVE (le canal ne sera pas actif sur les landings)");
  }
  if (!isValidE164(channel.phoneE164)) {
    warnings.push("Le numéro de téléphone n'est pas au format E.164 valide (ex: +33665517735)");
  }
  if (
    channel.provider === "GHL_WHATSAPP_PLATFORM" &&
    !channel.ghlWorkflowHotLeadId &&
    !channel.ghlWorkflowInfoNeededId &&
    !channel.ghlWorkflowBookingId
  ) {
    warnings.push("Provider GHL sélectionné, mais tous les IDs de workflow sont vides");
  }

  const cleanPhone = channel.phoneE164.replace(/\D/g, "");
  const defaultText =
    channel.defaultLocale === "EN"
      ? channel.prefilledMessageEn
      : channel.defaultLocale === "ES"
        ? channel.prefilledMessageEs
        : channel.prefilledMessageFr;
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultText)}`;
  const waMeShort = `wa.me/${cleanPhone}`;

  const businessHoursStr = typeof channel.businessHours === "object" && channel.businessHours !== null
    ? JSON.stringify(channel.businessHours, null, 2)
    : "{}";

  return (
    <div className="admin-page">
      <AdminPageHeader title={channel.label} meta={channel.phoneE164} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      {warnings.length > 0 && (
        <div style={{ padding: "12px 16px", borderRadius: "6px", background: "rgba(217, 119, 6, 0.08)", border: "1px solid #d97706", color: "#d97706", marginBottom: "20px" }}>
          <h4 style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 6px 0" }}>⚠️ Attention :</h4>
          <ul style={{ listStyleType: "disc", margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <WhatsappTestButtons waLink={waLink} waMeShort={waMeShort} />

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
            <span className="admin-field__label">Locale par défaut</span>
            <select name="defaultLocale" defaultValue={channel.defaultLocale} className="admin-input">
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Propriétaire (Owner)</span>
            <input name="ownerName" defaultValue={channel.ownerName ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Fallback URL</span>
            <input name="fallbackUrl" defaultValue={channel.fallbackUrl ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL workflow hot lead</span>
            <input name="ghlWorkflowHotLeadId" defaultValue={channel.ghlWorkflowHotLeadId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL workflow info needed</span>
            <input name="ghlWorkflowInfoNeededId" defaultValue={channel.ghlWorkflowInfoNeededId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL workflow booking</span>
            <input name="ghlWorkflowBookingId" defaultValue={channel.ghlWorkflowBookingId ?? ""} className="admin-input" />
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Heures d'ouverture (businessHours JSON)</span>
          <textarea name="businessHours" rows={3} defaultValue={businessHoursStr} className="admin-input" placeholder="{}" style={{ fontFamily: "monospace" }} />
        </label>
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

      <div style={{ marginTop: "32px", padding: "20px", border: "1px solid var(--admin-border)", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "6px" }}>
          Landings utilisant ce canal ({channel.landingPages.length})
        </h3>
        {channel.landingPages.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--admin-muted)" }}>Aucune landing n'utilise ce canal actuellement.</p>
        ) : (
          <ul style={{ fontSize: "13px", listStyle: "none", padding: 0 }}>
            {channel.landingPages.map((l) => (
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

      <form action={archiveWhatsappChannelAction} style={{ marginTop: "24px" }}>
        <input type="hidden" name="id" value={channel.id} />
        <button type="submit" className="admin-btn admin-btn--ghost">Mettre en pause</button>
      </form>
    </div>
  );
}
