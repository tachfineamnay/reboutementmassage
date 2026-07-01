import type { Metadata } from "next";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertRedirectRuleAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Nouvelle redirection — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewRedirectPage() {
  await ensureAdminSchema();

  return (
    <div className="admin-page">
      <AdminPageHeader title="Nouvelle redirection" />
      <form action={upsertRedirectRuleAction} className="admin-form">
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Chemin source *</span>
            <input name="sourcePath" required className="admin-input" placeholder="/fr/old-path" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Chemin cible *</span>
            <input name="targetPath" required className="admin-input" placeholder="/fr/new-path" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Code HTTP</span>
            <input name="statusCode" type="number" defaultValue={301} className="admin-input" />
          </label>
          <label className="admin-field admin-field--checkbox">
            <input name="active" type="checkbox" defaultChecked />
            <span>Active</span>
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Raison</span>
          <input name="reason" className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
