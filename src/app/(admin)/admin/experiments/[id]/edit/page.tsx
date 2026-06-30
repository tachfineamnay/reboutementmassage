import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import { upsertExperimentAction, archiveExperimentAction } from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer expérience — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditExperimentPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [experiment, landings] = await Promise.all([
    prisma.experiment.findUnique({
      where: { id },
      include: { variants: true, landingPage: { select: { heroTitle: true } } },
    }),
    prisma.landingPage.findMany({ orderBy: { heroTitle: "asc" }, select: { id: true, heroTitle: true } }),
  ]);
  if (!experiment) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader title={experiment.name} meta={experiment.landingPage.heroTitle} />
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px" }}>Enregistré.</p>}

      <form action={upsertExperimentAction} className="admin-form">
        <input type="hidden" name="id" value={experiment.id} />
        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Landing page *</span>
            <select name="landingPageId" required defaultValue={experiment.landingPageId} className="admin-input">
              {landings.map((l) => <option key={l.id} value={l.id}>{l.heroTitle}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Nom *</span>
            <input name="name" required defaultValue={experiment.name} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Métrique principale</span>
            <input name="primaryMetric" defaultValue={experiment.primaryMetric} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={experiment.status} className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="RUNNING">En cours</option>
              <option value="PAUSED">Pause</option>
              <option value="COMPLETED">Terminé</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Début</span>
            <input name="startAt" type="datetime-local" defaultValue={experiment.startAt ? experiment.startAt.toISOString().slice(0, 16) : ""} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Fin</span>
            <input name="endAt" type="datetime-local" defaultValue={experiment.endAt ? experiment.endAt.toISOString().slice(0, 16) : ""} className="admin-input" />
          </label>
        </div>
        <label className="admin-field">
          <span className="admin-field__label">Hypothèse</span>
          <textarea name="hypothesis" rows={3} defaultValue={experiment.hypothesis ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Notes</span>
          <textarea name="notes" rows={2} defaultValue={experiment.notes ?? ""} className="admin-input" />
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {experiment.variants.length > 0 && (
        <section className="admin-section" style={{ marginTop: "24px" }}>
          <h2 className="admin-section__title">Variantes ({experiment.variants.length})</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Split</th>
                  <th>Impressions</th>
                  <th>WhatsApp</th>
                  <th>Leads</th>
                </tr>
              </thead>
              <tbody>
                {experiment.variants.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.trafficSplit}%</td>
                    <td>{v.impressions}</td>
                    <td>{v.whatsappClicks}</td>
                    <td>{v.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {experiment.status !== "ARCHIVED" && (
        <form action={archiveExperimentAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={experiment.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
