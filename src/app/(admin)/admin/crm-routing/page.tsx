import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminEmptyState from "@/components/admin/growth/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import { matchCrmRoutingRule } from "@/lib/growth/crm-routing";

export const metadata: Metadata = { title: "Lead Routing — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    destinationId?: string;
    testDestinationId?: string;
    testLocale?: string;
    testOfferType?: string;
    testSource?: string;
    testIntent?: string;
    testSegment?: string;
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CrmRoutingPage({ searchParams }: PageProps) {
  await ensureAdminSchema();
  const params = await searchParams;
  const status = one(params.status);
  const destinationId = one(params.destinationId);

  const testDestinationId = one(params.testDestinationId);
  const testLocale = one(params.testLocale);
  const testOfferType = one(params.testOfferType);
  const testSource = one(params.testSource);
  const testIntent = one(params.testIntent);
  const testSegment = one(params.testSegment);

  const where = {
    ...(status && ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"].includes(status)
      ? { status: status as "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED" }
      : {}),
    ...(destinationId ? { destinationId } : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.crmRoutingRule.findMany({
      where,
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      include: { destination: { select: { cityName: true } } },
    }),
    prisma.crmRoutingRule.count({ where }),
    prisma.destination.findMany({ select: { id: true, cityName: true }, orderBy: { cityName: "asc" } }),
  ]);

  let matchedRule: any = null;
  if (testDestinationId) {
    const allActiveRulesForMatching = await prisma.crmRoutingRule.findMany({
      where: { destinationId: testDestinationId, status: "ACTIVE" },
      orderBy: [{ priority: "asc" }],
    });
    matchedRule = matchCrmRoutingRule(allActiveRulesForMatching, {
      destinationId: testDestinationId,
      locale: testLocale as any || null,
      offerType: testOfferType as any || null,
      source: testSource || null,
      intent: testIntent || null,
      leadSegment: testSegment || null,
    });
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title="Lead Routing" meta={`${total} rule${total !== 1 ? "s" : ""}`} action={{ href: "/admin/crm-routing/new", label: "+ New rule" }} />

      <form className="admin-filters" method="GET">
        <select name="destinationId" defaultValue={destinationId ?? ""} className="admin-input admin-filters__select">
          <option value="">Toutes destinations</option>
          {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} className="admin-input admin-filters__select">
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
          <option value="PAUSED">Pause</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--ghost">Filtrer</button>
      </form>

      {items.length === 0 ? (
        <AdminEmptyState message="Aucune règle CRM." action={{ href: "/admin/crm-routing/new", label: "Créer une règle" }} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Priorité</th>
                <th>Label</th>
                <th>Destination</th>
                <th>Locale</th>
                <th>Segment</th>
                <th>Pipeline GHL</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.priority}</td>
                  <td className="admin-table__title">
                    <Link href={`/admin/crm-routing/${r.id}/edit`} className="admin-table__title-link">Règle #{r.priority}</Link>
                  </td>
                  <td>{r.destination.cityName}</td>
                  <td>{r.locale ?? "—"}</td>
                  <td>{r.leadSegment ?? r.intent ?? "—"}</td>
                  <td><code className="admin-table__code">{r.ghlPipelineId ?? "—"}</code></td>
                  <td><AdminStatusBadge status={r.status} /></td>
                  <td><Link href={`/admin/crm-routing/${r.id}/edit`} className="admin-action">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="admin-section" style={{ marginTop: "32px", padding: "20px", border: "1px solid var(--admin-border)", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>🧪 Simuler le matching de règle</h3>
        <form method="GET" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", alignItems: "end" }}>
          <label className="admin-field">
            <span className="admin-field__label" style={{ fontSize: "11px" }}>Destination *</span>
            <select name="testDestinationId" required defaultValue={testDestinationId ?? ""} className="admin-input" style={{ padding: "6px" }}>
              <option value="">— Choisir —</option>
              {destinations.map(d => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label" style={{ fontSize: "11px" }}>Langue</span>
            <select name="testLocale" defaultValue={testLocale ?? ""} className="admin-input" style={{ padding: "6px" }}>
              <option value="">— Choisir —</option>
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label" style={{ fontSize: "11px" }}>Offre</span>
            <select name="testOfferType" defaultValue={testOfferType ?? ""} className="admin-input" style={{ padding: "6px" }}>
              <option value="">— Choisir —</option>
              <option value="private_session">Private session</option>
              <option value="hospitality_partner">Hospitality partner</option>
              <option value="training">Training</option>
              <option value="workshop">Workshop</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label" style={{ fontSize: "11px" }}>Source</span>
            <input name="testSource" defaultValue={testSource ?? ""} className="admin-input" style={{ padding: "6px" }} placeholder="ex: facebook" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label" style={{ fontSize: "11px" }}>Intention</span>
            <input name="testIntent" defaultValue={testIntent ?? ""} className="admin-input" style={{ padding: "6px" }} placeholder="ex: private_session" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label" style={{ fontSize: "11px" }}>Segment</span>
            <input name="testSegment" defaultValue={testSegment ?? ""} className="admin-input" style={{ padding: "6px" }} placeholder="ex: b2c_premium" />
          </label>
          <button type="submit" className="admin-btn admin-btn--primary" style={{ padding: "8px 12px" }}>Simuler</button>
        </form>

        {testDestinationId && (
          <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", background: matchedRule ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)", border: matchedRule ? "1px solid var(--admin-green)" : "1px solid #ef4444", fontSize: "13px" }}>
            {matchedRule ? (
              <div>
                ✅ Règle matchée : <strong><Link href={`/admin/crm-routing/${matchedRule.id}/edit`} style={{ textDecoration: "underline" }}>Règle #{matchedRule.priority}</Link></strong>
                <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--admin-muted)" }}>
                  Pipeline: {matchedRule.ghlPipelineId || "—"} | Stage: {matchedRule.ghlPipelineStageId || "—"} | Workflow: {matchedRule.ghlWorkflowId || "—"}
                </div>
              </div>
            ) : (
              <div style={{ color: "#ef4444" }}>
                ❌ Aucune règle active ne correspond à ces critères pour cette destination.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
