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

  // 1. Auto-seeding des redirections CDMX historiques manquantes en DB
  const legacyRedirects = [
    { source: "/en/mexico-city-private-session", target: "/en/mexico-city-french-body-reset", reason: "Legacy CDMX redirect EN" },
    { source: "/es/sesion-privada-cdmx", target: "/es/reset-corporal-frances-cdmx", reason: "Legacy CDMX redirect ES" },
    { source: "/fr/seance-privee-mexico-city", target: "/fr/french-body-reset-mexico-city", reason: "Legacy CDMX redirect FR" },
  ];

  for (const redir of legacyRedirects) {
    const existing = await prisma.redirectRule.findUnique({ where: { sourcePath: redir.source } });
    if (!existing) {
      await prisma.redirectRule.create({
        data: {
          sourcePath: redir.source,
          targetPath: redir.target,
          statusCode: 301,
          active: true,
          reason: redir.reason,
        },
      });
    }
  }

  // 2. Récupérer toutes les landings et les règles de redirection
  const [landings, dbRedirectRules] = await Promise.all([
    prisma.landingPage.findMany({
      where: { status: { in: ["LIVE", "READY", "DRAFT", "PAUSED", "ARCHIVED"] } },
      include: growthLandingInclude,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.redirectRule.findMany(),
  ]);

  const issues: SeoIssue[] = [];

  // Indexations et compteurs pour les hreflangs et doublons
  const pathCounts = new Map<string, number>();
  const destinationLocales = new Map<string, Set<string>>();
  const groupHasXDefault = new Map<string, boolean>();

  for (const l of landings) {
    const pathKey = `${l.locale.toLowerCase()}/${l.slug}`;
    pathCounts.set(pathKey, (pathCounts.get(pathKey) ?? 0) + 1);

    if (l.status === "LIVE") {
      const set = destinationLocales.get(l.destinationId) ?? new Set<string>();
      set.add(l.locale);
      destinationLocales.set(l.destinationId, set);
    }

    if (l.hreflangGroupId && l.xDefault) {
      groupHasXDefault.set(l.hreflangGroupId, true);
    }
  }

  // Analyse des landing pages
  for (const landing of landings) {
    const path = `/${localeToLang(landing.locale)}/${landing.slug}`;

    // 1. live noindex
    if (landing.status === "LIVE" && landing.noindex) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Landing LIVE avec noindex=true",
        severity: "critical",
      });
    }

    // 2. missing title
    if (!landing.seoTitle?.trim()) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "SEO title manquant",
        severity: "warning",
      });
    }

    // 3. missing meta
    if (!landing.metaDescription?.trim()) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Meta description manquante",
        severity: "warning",
      });
    }

    // 4. missing canonical
    if (!landing.canonical?.trim() && landing.status === "LIVE") {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Canonical manquant en LIVE",
        severity: "warning",
      });
    }

    // 5. missing hreflang (si plusieurs locales pour la destination)
    if (landing.status === "LIVE" && !landing.hreflangGroupId) {
      const locales = destinationLocales.get(landing.destinationId);
      if (locales && locales.size > 1) {
        issues.push({
          landingId: landing.id,
          title: landing.heroTitle,
          path,
          problem: "Groupe hreflang non configuré alors que d'autres langues existent pour cette destination",
          severity: "warning",
        });
      }
    }

    // 6. missing x-default (dans le groupe hreflang)
    if (landing.hreflangGroupId && !groupHasXDefault.get(landing.hreflangGroupId)) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Groupe hreflang sans aucun x-default configuré",
        severity: "warning",
      });
    }

    // 7. missing OG image
    if (!landing.ogImageId) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Image OpenGraph (ogImage) manquante",
        severity: "info",
      });
    }

    // 8. duplicate slug
    const pathKey = `${landing.locale.toLowerCase()}/${landing.slug}`;
    if ((pathCounts.get(pathKey) ?? 0) > 1) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Slug dupliqué pour la même langue",
        severity: "critical",
      });
    }

    // 9. missing FAQ
    const faq = Array.isArray(landing.faq) ? landing.faq : [];
    if (faq.length === 0) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "FAQ manquante",
        severity: "info",
      });
    }

    // 10. schema missing
    const schemaConfig = landing.schemaConfig;
    if (!schemaConfig || (typeof schemaConfig === "object" && Object.keys(schemaConfig).length === 0)) {
      issues.push({
        landingId: landing.id,
        title: landing.heroTitle,
        path,
        problem: "Schema.org structuré (schemaConfig) manquant",
        severity: "info",
      });
    }

    // Readiness score check
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

  // 11. redirect missing (CDMX legacy redirects check)
  for (const redir of legacyRedirects) {
    const rule = dbRedirectRules.find(r => r.sourcePath === redir.source);
    if (!rule || !rule.active) {
      issues.push({
        landingId: "redirects",
        title: `Redirection ${redir.source}`,
        path: redir.source,
        problem: !rule ? "Redirection historique manquante" : "Redirection historique inactive",
        severity: "critical",
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
      <AdminPageHeader title="SEO Health" meta="Audit SEO et redirections des landing pages Growth" />

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
                  <th>Landing / Redirection</th>
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
                      {issue.landingId === "redirects" ? (
                        <Link href="/admin/redirects" className="admin-action">Corriger</Link>
                      ) : (
                        <Link href={`/admin/landings/${issue.landingId}/edit`} className="admin-action">Corriger</Link>
                      )}
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
