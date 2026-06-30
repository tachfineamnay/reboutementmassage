import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertCrmRoutingRuleAction, archiveCrmRoutingRuleAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer règle CRM — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditCrmRoutingPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [rule, destinations] = await Promise.all([
    prisma.crmRoutingRule.findUnique({ where: { id } }),
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
  ]);
  if (!rule) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader title={`Règle CRM #${rule.priority}`} meta={rule.destinationId} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      <form action={upsertCrmRoutingRuleAction} className="admin-form">
        <input type="hidden" name="id" value={rule.id} />
        <input type="hidden" name="tags" value={JSON.stringify(rule.tags)} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required defaultValue={rule.destinationId} className="admin-input">
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Priorité</span>
            <input name="priority" type="number" defaultValue={rule.priority} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale</span>
            <select name="locale" defaultValue={rule.locale ?? ""} className="admin-input">
              <option value="">Toutes</option>
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Segment lead</span>
            <input name="leadSegment" defaultValue={rule.leadSegment ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Intent</span>
            <input name="intent" defaultValue={rule.intent ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Source UTM</span>
            <input name="source" defaultValue={rule.source ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL Pipeline ID</span>
            <input name="ghlPipelineId" defaultValue={rule.ghlPipelineId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL Pipeline Stage ID</span>
            <input name="ghlPipelineStageId" defaultValue={rule.ghlPipelineStageId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">GHL Workflow ID</span>
            <input name="ghlWorkflowId" defaultValue={rule.ghlWorkflowId ?? ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={rule.status} className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif</option>
              <option value="PAUSED">Pause</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Notes</span>
          <textarea name="notes" rows={2} defaultValue={rule.notes ?? ""} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {rule.status !== "ARCHIVED" && (
        <form action={archiveCrmRoutingRuleAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={rule.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
