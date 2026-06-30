import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { growthLandingInclude, localeToLang } from "@/lib/growth/types";
import { computeLandingReadiness } from "@/lib/growth/landing-readiness";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import ReadinessScoreBadge from "@/components/admin/growth/ReadinessScoreBadge";

export const metadata: Metadata = { title: "SEO Health — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type SeoIssue = {
  landingId: string;
  title: string;
  path: string;
  problem: string;
  severity: "critical" | "warning" | "info";
};

export default async function SeoHealthPage() {
  await ensureAdminSchema();

  const landings = await prisma.landingPage.findMany({
    where: { status: { in: ["LIVE", "READY", "DRAFT"] } },
    include: growthLandingInclude,
    orderBy: { updatedAt: "desc" },
  });

  const issues: SeoIssue[] = [];

  for (const landing of landings) {
    const path = `/${localeToLang(landing.locale)}/${landing.slug}`;

    if (landing.status === "LIVE" && landing.noindex) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Landing LIVE avec noindex=true",
        severity: "critical",
      });
    }
    if (!landing.seoTitle?.trim()) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "SEO title manquant",
        severity: "warning",
      });
    }
    if (!landing.metaDescription?.trim()) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Meta description manquante",
        severity: "warning",
      });
    }
    if (!landing.canonical?.trim() && landing.status === "LIVE") {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Canonical manquant en LIVE",
        severity: "warning",
      });
    }
    if (!landing.hreflangGroupId && landing.status === "LIVE") {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Groupe hreflang non défini",
        severity: "info",
      });
    }

    const readiness = computeLandingReadiness(landing);
    if (landing.status === "LIVE" && readiness.score < 80) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: `Readiness faible (${readiness.score}/100)`,
        severity: "warning",
      });
    }
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const liveCount = landings.filter((l) => l.status === "LIVE").length;
  const indexedLive = landings.filter((l) => l.status === "LIVE" && !l.noindex).length;
  const withSeo = landings.filter((l) => l.seoTitle && l.metaDescription).length;

  return (
    <div className="admin-page">
      <AdminPageHeader title="SEO Health" meta="Audit SEO des landing pages Growth" />

      <div className="kpi-grid" style={{ marginBottom: "24px" }}>
        <div className="kpi-card kpi-card--green">
          <span className="kpi-card__value">{liveCount}</span>
          <span className="kpi-card__label">Landings LIVE</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__value">{indexedLive}</span>
          <span className="kpi-card__label">Indexables</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__value">{withSeo}</span>
          <span className="kpi-card__label">SEO complet</span>
        </div>
        <div className="kpi-card kpi-card--amber">
          <span className="kpi-card__value">{issues.length}</span>
          <span className="kpi-card__label">Issues détectées</span>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section__title">Issues par landing</h2>
        {issues.length === 0 ? (
          <p style={{ color: "var(--admin-green)" }}>Aucun problème SEO détecté.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Landing</th>
                  <th>Chemin</th>
                  <th>Problème</th>
                  <th>Sévérité</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, idx) => (
                  <tr key={`${issue.landingId}-${idx}`}>
                    <td className="admin-table__title">{issue.title}</td>
                    <td><code className="admin-table__slug-code">{issue.path}</code></td>
                    <td>{issue.problem}</td>
                    <td>
                      <span className={`badge ${issue.severity === "critical" ? "badge--archived" : issue.severity === "warning" ? "badge--draft" : "badge--published"}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/landings/${issue.landingId}/edit`} className="admin-action">Corriger</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section" style={{ marginTop: "24px" }}>
        <h2 className="admin-section__title">Scores readiness</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Landing</th>
                <th>Statut</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {landings.slice(0, 20).map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/admin/landings/${l.id}/edit`} className="admin-table__title-link">{l.heroTitle}</Link>
                  </td>
                  <td>{l.status}</td>
                  <td><ReadinessScoreBadge score={l.readinessScore} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
