import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertRedirectRuleAction, archiveRedirectRuleAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer redirection — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditRedirectPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const rule = await prisma.redirectRule.findUnique({ where: { id } });
  if (!rule) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader title={rule.sourcePath} meta={`→ ${rule.targetPath}`} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      <form action={upsertRedirectRuleAction} className="admin-form">
        <input type="hidden" name="id" value={rule.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Chemin source *</span>
            <input name="sourcePath" required defaultValue={rule.sourcePath} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Chemin cible *</span>
            <input name="targetPath" required defaultValue={rule.targetPath} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Code HTTP</span>
            <input name="statusCode" type="number" defaultValue={rule.statusCode} className="admin-input" />
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="active" type="checkbox" defaultChecked={rule.active} />
            <span>Active</span>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Raison</span>
          <input name="reason" defaultValue={rule.reason ?? ""} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {rule.active && (
        <form action={archiveRedirectRuleAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={rule.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Désactiver</button>
        </form>
      )}
    </div>
  );
}
