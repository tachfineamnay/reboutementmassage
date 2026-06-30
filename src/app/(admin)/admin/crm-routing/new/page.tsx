import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertCrmRoutingRuleAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouvelle règle CRM — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewCrmRoutingPage() {
  await ensureAdminSchema();
  const destinations = await prisma.destination.findMany({ orderBy: { cityName: "asc" } });

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouvelle règle CRM" />
      <form action={upsertCrmRoutingRuleAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required className="admin-input">
              <option value="">—</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Priorité</span>
            <input name="priority" type="number" defaultValue={100} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale</span>
            <select name="locale" className="admin-input">
              <option value="">Toutes</option>
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Segment lead</span>
            <input name="leadSegment" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Intent</span>
            <input name="intent" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Source UTM</span>
            <input name="source" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL Pipeline ID</span>
            <input name="ghlPipelineId" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL Workflow ID</span>
            <input name="ghlWorkflowId" className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue="DRAFT" className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif</option>
            </select>
          </label>
        </div>
        <input type="hidden" name="tags" value="[]" />
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
