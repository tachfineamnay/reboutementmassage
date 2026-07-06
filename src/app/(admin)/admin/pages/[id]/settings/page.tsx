import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { computePuckReadiness } from "@/lib/builder/puck-readiness";
import { getLandingPublicPath, getPreviewUrl } from "@/lib/builder/puck-utils";
import { growthLandingInclude } from "@/lib/growth/types";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import ReadinessScoreBadge from "@/components/admin/growth/ReadinessScoreBadge";

export const metadata: Metadata = { title: "Réglages page — TMS Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LandingSettingsPage({ params }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const landing = await prisma.landingPage.findUnique({
    where: { id },
    include: growthLandingInclude,
  });
  if (!landing) notFound();

  const readiness = computePuckReadiness(landing);
  const liveUrl = getLandingPublicPath(landing);
  const previewUrl = getPreviewUrl(landing);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Réglages page"
        meta={`${landing.heroTitle} · ${landing.locale}`}
        action={{ href: `/admin/pages/${landing.id}/studio`, label: "Ouvrir Studio" }}
      />

      <div className="admin-panel">
        <h2 className="admin-panel__title">État</h2>
        <div className="landing-settings-grid">
          <div>
            <span className="admin-table__meta">Statut</span>
            <p>
              <AdminStatusBadge status={landing.status} />
            </p>
          </div>
          <div>
            <span className="admin-table__meta">Readiness</span>
            <p>
              <ReadinessScoreBadge score={readiness.score} />
            </p>
          </div>
          <div>
            <span className="admin-table__meta">Noindex</span>
            <p>{landing.noindex ? "Oui" : "Non"}</p>
          </div>
          <div>
            <span className="admin-table__meta">Route</span>
            <p>
              <code className="admin-table__slug-code">{liveUrl}</code>
            </p>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2 className="admin-panel__title">Actions</h2>
        <div className="landing-settings-actions">
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--ghost">
            Preview
          </a>
          {landing.status === "LIVE" ? (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--ghost">
              Voir live
            </a>
          ) : null}
          <Link href={`/admin/landings/${landing.id}/edit`} className="admin-btn admin-btn--ghost">
            Mode expert
          </Link>
          <Link href="/admin/pages" className="admin-btn admin-btn--ghost">
            Toutes les pages
          </Link>
        </div>
      </div>

      {readiness.issues.length ? (
        <div className="admin-panel">
          <h2 className="admin-panel__title">Issues publication</h2>
          <ul className="landing-studio-readiness__issues">
            {readiness.issues.map((issue) => (
              <li key={issue.code} data-severity={issue.severity}>
                <strong>{issue.location ?? issue.code}</strong>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
