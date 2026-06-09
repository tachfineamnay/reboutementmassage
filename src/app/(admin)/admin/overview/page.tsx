import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeSeoScore } from "@/lib/utils";
import ArticleStatusBadge from "@/components/admin/ArticleStatusBadge";
import GoogleImportButton from "@/components/admin/GoogleImportButton";
import { getGoogleConfig } from "@/lib/google/oauth";
import {
  LEAD_STATUS_CLASSES,
  LEAD_STATUS_LABELS,
  formatLeadSlot,
} from "@/lib/admin-leads";

export const metadata: Metadata = {
  title: "Vue d'ensemble — GT Dash",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type OverviewArticle = Prisma.ArticleGetPayload<{
  include: {
    seo: true;
    content: { select: { html: true; wordCount: true } };
    coverImage: true;
    metrics: true;
  };
}>;

type Issue = {
  articleId: string;
  title: string;
  locale: string;
  problem: string;
  priority: "Haute" | "Moyenne" | "Basse";
  priorityClass: string;
};

type LeadStats = {
  total: number;
  today: number;
  week: number;
  failed: number;
  callbacksToday: number;
};

type CallbackLead = {
  id: string;
  firstName: string;
  contact: string;
  selectedDayLabel: string | null;
  selectedTime: string | null;
  timezone: string | null;
  status: "CAPTURED" | "MOCKED" | "SENT_TO_GHL" | "FAILED" | "ARCHIVED";
};

const EMPTY_LEAD_OVERVIEW: {
  stats: LeadStats;
  callbacks: CallbackLead[];
} = {
  stats: {
    total: 0,
    today: 0,
    week: 0,
    failed: 0,
    callbacksToday: 0,
  },
  callbacks: [],
};

function isMissingSchemaObjectError(error: unknown) {
  const code = (error as { code?: string }).code;
  if (code === "P2021" || code === "P2022") return true;

  const message = String(
    (error as { message?: unknown })?.message ?? error
  );

  return /relation .* does not exist|table .* does not exist|column .* does not exist/i.test(
    message
  );
}

async function getOverviewArticles(date28DaysAgo: Date): Promise<OverviewArticle[]> {
  try {
    return await prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        seo: true,
        content: { select: { html: true, wordCount: true } },
        coverImage: true,
        metrics: {
          where: {
            date: {
              gte: date28DaysAgo,
            },
          },
        },
      },
    });
  } catch (error) {
    if (!isMissingSchemaObjectError(error)) throw error;

    console.warn(
      "[admin/overview] Article metrics schema is unavailable; rendering dashboard without Google metrics.",
      error
    );

    const articles = await prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        seo: true,
        content: { select: { html: true, wordCount: true } },
        coverImage: true,
      },
    });

    return articles.map((article) => ({
      ...article,
      metrics: [],
    }));
  }
}

async function getOverviewSections() {
  try {
    return await prisma.landingSection.findMany({
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
      },
    });
  } catch (error) {
    if (!isMissingSchemaObjectError(error)) throw error;

    console.warn(
      "[admin/overview] Landing sections schema is unavailable; rendering dashboard without landing section metrics.",
      error
    );

    return [];
  }
}

function getDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

function getWeekStart(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

async function getOverviewLeadStats(now: Date): Promise<{
  stats: LeadStats;
  callbacks: CallbackLead[];
}> {
  const today = getDayBounds(now);
  const weekStart = getWeekStart(now);

  const [total, todayCount, week, failed, callbacksToday, callbacks] = await Promise.all([
    prisma.leadSubmission.count(),
    prisma.leadSubmission.count({
      where: { createdAt: { gte: today.start, lt: today.end } },
    }),
    prisma.leadSubmission.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.leadSubmission.count({
      where: { status: "FAILED" },
    }),
    prisma.leadSubmission.count({
      where: {
        selectedAt: { gte: today.start, lt: today.end },
        status: { not: "ARCHIVED" },
      },
    }),
    prisma.leadSubmission.findMany({
      where: {
        selectedAt: { gte: today.start, lt: today.end },
        status: { not: "ARCHIVED" },
      },
      orderBy: { selectedAt: "asc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        contact: true,
        selectedDayLabel: true,
        selectedTime: true,
        timezone: true,
        status: true,
      },
    }),
  ]);

  return {
    stats: {
      total,
      today: todayCount,
      week,
      failed,
      callbacksToday,
    },
    callbacks,
  };
}

export default async function OverviewPage() {
  const now = new Date();
  const date28DaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  // Vérification de la configuration Google
  const googleConfig = getGoogleConfig();
  const isGoogleConfigured = !!googleConfig;

  // 1. Une source indisponible ne doit pas rendre tout le dashboard inaccessible.
  const [articlesResult, sectionsResult, leadOverviewResult] = await Promise.allSettled([
    getOverviewArticles(date28DaysAgo),
    getOverviewSections(),
    getOverviewLeadStats(now),
  ]);

  const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
  const sections = sectionsResult.status === "fulfilled" ? sectionsResult.value : [];
  const leadOverview =
    leadOverviewResult.status === "fulfilled"
      ? leadOverviewResult.value
      : EMPTY_LEAD_OVERVIEW;
  const hasUnavailableData =
    articlesResult.status === "rejected" ||
    sectionsResult.status === "rejected" ||
    leadOverviewResult.status === "rejected";

  if (articlesResult.status === "rejected") {
    console.error("[admin/overview] Unable to load articles.", articlesResult.reason);
  }
  if (sectionsResult.status === "rejected") {
    console.error("[admin/overview] Unable to load landing sections.", sectionsResult.reason);
  }
  if (leadOverviewResult.status === "rejected") {
    console.error("[admin/overview] Unable to load leads.", leadOverviewResult.reason);
  }

  // 2. Calculs des métriques d'articles
  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftsCount = articles.filter((a) => a.status === "DRAFT").length;
  const readyCount = articles.filter((a) => a.status === "READY").length;
  const archivedCount = articles.filter((a) => a.status === "ARCHIVED").length;

  // Calcul du score SEO individuel pour chaque article et de ses métriques Google
  const articlesWithScore = articles.map((a) => {
    const seoScore = a.seo?.score ?? computeSeoScore({
      title: a.title,
      seoTitle: a.seo?.seoTitle,
      metaDescription: a.seo?.metaDescription,
      focusKeyword: a.seo?.focusKeyword,
      ogImageId: a.seo?.ogImageId,
      coverImageId: a.coverImageId,
      excerpt: a.excerpt,
      wordCount: a.content?.wordCount,
    });

    const totalClicks = a.metrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalImpressions = a.metrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalSessions = a.metrics.reduce((sum, m) => sum + m.organicSessions, 0);
    const avgPosition = a.metrics.length > 0 
      ? a.metrics.reduce((sum, m) => sum + m.position, 0) / a.metrics.length 
      : 0;
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      ...a,
      seoScore,
      totalClicks,
      totalImpressions,
      totalSessions,
      avgPosition,
      avgCtr,
    };
  });

  const seoIncompleteCount = articlesWithScore.filter((a) => a.seoScore < 80).length;
  const noCoverCount = articles.filter((a) => !a.coverImageId).length;
  const noMetaDescCount = articles.filter((a) => !a.seo?.metaDescription).length;
  const noCtaCount = articles.filter((a) => !a.content?.html?.includes("cta-block")).length;

  // Calculs des métriques Google globales (Search Console / GA4)
  const globalTotalClicks = articlesWithScore.reduce((sum, a) => sum + a.totalClicks, 0);
  const globalTotalImpressions = articlesWithScore.reduce((sum, a) => sum + a.totalImpressions, 0);

  const articlesWithTraffic = articlesWithScore.filter(
    (a) => a.status === "PUBLISHED" && (a.totalClicks > 0 || a.totalSessions > 0)
  );
  const articlesWithoutTraffic = articlesWithScore.filter(
    (a) => a.status === "PUBLISHED" && a.totalClicks === 0 && a.totalSessions === 0
  );
  const articlesToOptimize = articlesWithScore.filter(
    (a) =>
      a.status === "PUBLISHED" &&
      (a.seoScore < 80 ||
        (a.totalImpressions > 50 && a.avgCtr < 1.5) ||
        (a.avgPosition > 10 && a.avgPosition < 40))
  );

  // 3. Calculs des métriques des landing sections
  const activeSectionsCount = sections.filter(
    (s) =>
      s.status === "PUBLISHED" &&
      (!s.startAt || new Date(s.startAt) <= now) &&
      (!s.endAt || new Date(s.endAt) >= now)
  ).length;

  const expiredSectionsCount = sections.filter(
    (s) => s.endAt && new Date(s.endAt) < now
  ).length;

  // 4. Détection des articles à corriger (Audit)
  const issues: Issue[] = [];

  for (const a of articlesWithScore) {
    const score = a.seoScore;

    // Vérification du texte alt de couverture selon la langue de l'article
    let hasCoverAlt = true;
    if (a.coverImage) {
      if (a.locale === "FR" && !a.coverImage.altFr) hasCoverAlt = false;
      else if (a.locale === "EN" && !a.coverImage.altEn) hasCoverAlt = false;
      else if (a.locale === "ES" && !a.coverImage.altEs) hasCoverAlt = false;
    }

    // PRIORITÉ HAUTE
    if (a.status === "PUBLISHED" && a.seo?.noindex) {
      issues.push({
        articleId: a.id,
        title: a.title,
        locale: a.locale,
        problem: "Article publié avec directive noindex active (exclu de Google)",
        priority: "Haute",
        priorityClass: "badge--archived", // Rouge
      });
    }
    if (a.status === "PUBLISHED" && !a.seo?.metaDescription) {
      issues.push({
        articleId: a.id,
        title: a.title,
        locale: a.locale,
        problem: "Article publié sans méta description SEO",
        priority: "Haute",
        priorityClass: "badge--archived",
      });
    }
    if (a.status === "PUBLISHED" && !a.seo?.seoTitle) {
      issues.push({
        articleId: a.id,
        title: a.title,
        locale: a.locale,
        problem: "Article publié sans titre SEO configuré",
        priority: "Haute",
        priorityClass: "badge--archived",
      });
    }

    // PRIORITÉ MOYENNE
    if (a.coverImageId && !hasCoverAlt) {
      issues.push({
        articleId: a.id,
        title: a.title,
        locale: a.locale,
        problem: "Image de couverture sans texte alternatif (alt) pour sa langue",
        priority: "Moyenne",
        priorityClass: "badge--draft", // Orange/Masse
      });
    }
    if (score < 70) {
      issues.push({
        articleId: a.id,
        title: a.title,
        locale: a.locale,
        problem: `Score SEO faible (${score}/100)`,
        priority: "Moyenne",
        priorityClass: "badge--draft",
      });
    }

    // PRIORITÉ BASSE
    if (!a.seo?.focusKeyword) {
      issues.push({
        articleId: a.id,
        title: a.title,
        locale: a.locale,
        problem: "Aucun mot-clé principal défini (focusKeyword)",
        priority: "Basse",
        priorityClass: "badge--published", // Bleu/Gris soft
      });
    }
  }

  // Tri par gravité de priorité : Haute -> Moyenne -> Basse
  const priorityOrder = { Haute: 1, Moyenne: 2, Basse: 3 };
  issues.sort((x, y) => priorityOrder[x.priority] - priorityOrder[y.priority]);

  // 5. Derniers articles modifiés (Top 5)
  const recentArticles = articlesWithScore.slice(0, 5);
  const leadStats = leadOverview.stats;
  const callbackLeads = leadOverview.callbacks;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">GT Dash</h1>
          <p className="admin-page__meta" style={{ marginTop: "4px" }}>
            Santé business, demandes reçues, contenus et SEO
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/admin/demandes" className="admin-btn admin-btn--ghost">
            Voir les demandes
          </Link>
          <Link href="/admin/articles/new" className="admin-btn admin-btn--primary">
            + Écrire une story
          </Link>
        </div>
      </div>

      {hasUnavailableData && (
        <div
          role="alert"
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "6px",
            border: "1px solid rgba(251,191,36,0.3)",
            background: "rgba(251,191,36,0.08)",
            color: "#d97706",
            fontSize: "13px",
          }}
        >
          Certaines données sont temporairement indisponibles. Le dashboard reste
          accessible pendant la synchronisation de la base de données.
        </div>
      )}

      <div className="kpi-grid kpi-grid--business" style={{ marginBottom: "8px" }}>
        <Link href="/admin/demandes" className="kpi-card kpi-card--link kpi-card--green">
          <span className="kpi-card__value">{leadStats.total}</span>
          <span className="kpi-card__label">Demandes reçues</span>
        </Link>
        <Link href="/admin/demandes?period=today" className="kpi-card kpi-card--link">
          <span className="kpi-card__value">{leadStats.today}</span>
          <span className="kpi-card__label">Demandes aujourd&apos;hui</span>
        </Link>
        <Link href="/admin/demandes?period=week" className="kpi-card kpi-card--link">
          <span className="kpi-card__value">{leadStats.week}</span>
          <span className="kpi-card__label">Demandes cette semaine</span>
        </Link>
        <Link href="/admin/demandes?status=FAILED" className="kpi-card kpi-card--link kpi-card--red">
          <span className="kpi-card__value">{leadStats.failed}</span>
          <span className="kpi-card__label">Échecs GHL</span>
        </Link>
        <Link href="/admin/demandes?period=today" className="kpi-card kpi-card--link kpi-card--amber">
          <span className="kpi-card__value">{leadStats.callbacksToday}</span>
          <span className="kpi-card__label">À rappeler aujourd&apos;hui</span>
        </Link>
      </div>

      <section className="admin-section" style={{ marginBottom: "8px" }}>
        <div className="admin-section__header">
          <h2 className="admin-section__title">Demandes à traiter aujourd&apos;hui</h2>
          <Link href="/admin/demandes?period=today" className="admin-link">
            Voir tout
          </Link>
        </div>
        {callbackLeads.length === 0 ? (
          <div className="admin-empty" style={{ padding: "24px" }}>
            <p>Aucune demande à rappeler aujourd&apos;hui.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Prénom</th>
                  <th>Contact</th>
                  <th>Créneau</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {callbackLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="admin-table__title">
                      <Link href={`/admin/demandes/${lead.id}`} className="admin-table__title-link">
                        {lead.firstName}
                      </Link>
                    </td>
                    <td className="admin-table__contact">{lead.contact}</td>
                    <td className="admin-table__date">{formatLeadSlot(lead)}</td>
                    <td>
                      <span className={LEAD_STATUS_CLASSES[lead.status]}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/demandes/${lead.id}`} className="admin-action">
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ────────────────── 1. GRILLE DE CARTES PRINCIPALES (KPIs) ────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: "24px" }}>
        <div className="kpi-card kpi-card--green">
          <span className="kpi-card__value">{publishedCount}</span>
          <span className="kpi-card__label">Articles publiés</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__value">{draftsCount}</span>
          <span className="kpi-card__label">Brouillons</span>
        </div>
        <div className="kpi-card kpi-card--amber">
          <span className="kpi-card__value">{seoIncompleteCount}</span>
          <span className="kpi-card__label">Score SEO incomplet (&lt; 80)</span>
        </div>
        <div className="kpi-card kpi-card--green">
          <span className="kpi-card__value">{activeSectionsCount}</span>
          <span className="kpi-card__label">Landing Sections actives</span>
        </div>
      </div>

      {/* ────────────────── Performances Google (28 derniers jours) ────────────────── */}
      <section className="admin-section" style={{ marginBottom: "32px", padding: "20px", background: "var(--admin-surface)", borderRadius: "8px", border: "1px solid var(--admin-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h2 className="admin-section__title" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, color: "var(--admin-muted)" }}>
            Performances Google (28 derniers jours)
          </h2>
          {!isGoogleConfigured && (
            <span className="badge badge--draft" style={{ fontSize: "11px", background: "rgba(251,191,36,0.12)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" }}>
              ⚠️ Non configuré
            </span>
          )}
        </div>

        {!isGoogleConfigured && (
          <div style={{ padding: "12px 16px", borderRadius: "6px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "#d97706", fontSize: "13px", marginBottom: "16px" }}>
            L&apos;intégration des API Google n&apos;est pas configurée. Renseignez les variables d&apos;environnement Google pour activer le suivi.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block" }}>Impressions Search Console</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: isGoogleConfigured ? "var(--admin-accent)" : "var(--admin-muted)", marginTop: "4px", display: "block" }}>
              {isGoogleConfigured ? globalTotalImpressions.toLocaleString() : "—"}
            </span>
          </div>

          <div style={{ padding: "12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block" }}>Clics Search Console</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: isGoogleConfigured ? "var(--admin-accent)" : "var(--admin-muted)", marginTop: "4px", display: "block" }}>
              {isGoogleConfigured ? globalTotalClicks.toLocaleString() : "—"}
            </span>
          </div>

          <div style={{ padding: "12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px", background: isGoogleConfigured ? "rgba(34,197,94,0.02)" : "none" }}>
            <span style={{ fontSize: "11px", color: isGoogleConfigured ? "var(--admin-green)" : "var(--admin-muted)", display: "block" }}>Articles avec trafic</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: isGoogleConfigured ? "var(--admin-green)" : "var(--admin-muted)", marginTop: "4px", display: "block" }}>
              {isGoogleConfigured ? articlesWithTraffic.length : "—"}
            </span>
          </div>

          <div style={{ padding: "12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px", background: isGoogleConfigured ? "rgba(248,113,113,0.02)" : "none" }}>
            <span style={{ fontSize: "11px", color: isGoogleConfigured ? "#f87171" : "var(--admin-muted)", display: "block" }}>Articles sans trafic</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: isGoogleConfigured ? "#f87171" : "var(--admin-muted)", marginTop: "4px", display: "block" }}>
              {isGoogleConfigured ? articlesWithoutTraffic.length : "—"}
            </span>
          </div>

          <div style={{ padding: "12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px", background: isGoogleConfigured ? "rgba(251,191,36,0.02)" : "none" }}>
            <span style={{ fontSize: "11px", color: isGoogleConfigured ? "#fbbf24" : "var(--admin-muted)", display: "block" }}>Articles à optimiser</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: isGoogleConfigured ? "#fbbf24" : "var(--admin-muted)", marginTop: "4px", display: "block" }}>
              {isGoogleConfigured ? articlesToOptimize.length : "—"}
            </span>
          </div>
        </div>
      </section>

      {/* ────────────────── 2. ALERTES ET COCKPIT SANTE (AUDIT) ────────────────── */}
      <section className="admin-section" style={{ marginBottom: "32px", padding: "20px", background: "var(--admin-surface)", borderRadius: "8px", border: "1px solid var(--admin-border)" }}>
        <h2 className="admin-section__title" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px", color: "var(--admin-muted)" }}>
          Cockpit de Santé de Contenu
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          
          <div style={{ padding: "12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block" }}>Stories Prêtes (READY)</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: "var(--admin-text)", marginTop: "4px", display: "block" }}>{readyCount}</span>
          </div>

          <div style={{ padding: "12px", border: "1.5px solid var(--admin-border)", borderRadius: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block" }}>Stories Archivées</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: "var(--admin-text)", marginTop: "4px", display: "block" }}>{archivedCount}</span>
          </div>

          <div style={{ padding: "12px", border: `1.5px solid ${noCoverCount > 0 ? "rgba(251,191,36,0.3)" : "var(--admin-border)"}`, borderRadius: "6px", background: noCoverCount > 0 ? "rgba(251,191,36,0.02)" : "none" }}>
            <span style={{ fontSize: "11px", color: noCoverCount > 0 ? "#d97706" : "var(--admin-muted)", display: "block" }}>Sans image de couverture</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: noCoverCount > 0 ? "#d97706" : "var(--admin-text)", marginTop: "4px", display: "block" }}>{noCoverCount}</span>
          </div>

          <div style={{ padding: "12px", border: `1.5px solid ${noMetaDescCount > 0 ? "rgba(248,113,113,0.3)" : "var(--admin-border)"}`, borderRadius: "6px", background: noMetaDescCount > 0 ? "rgba(248,113,113,0.02)" : "none" }}>
            <span style={{ fontSize: "11px", color: noMetaDescCount > 0 ? "#ef4444" : "var(--admin-muted)", display: "block" }}>Sans méta description</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: noMetaDescCount > 0 ? "#ef4444" : "var(--admin-text)", marginTop: "4px", display: "block" }}>{noMetaDescCount}</span>
          </div>

          <div style={{ padding: "12px", border: `1.5px solid ${noCtaCount > 0 ? "rgba(251,191,36,0.3)" : "var(--admin-border)"}`, borderRadius: "6px", background: noCtaCount > 0 ? "rgba(251,191,36,0.02)" : "none" }}>
            <span style={{ fontSize: "11px", color: noCtaCount > 0 ? "#d97706" : "var(--admin-muted)", display: "block" }}>Sans bouton CTA final</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: noCtaCount > 0 ? "#d97706" : "var(--admin-text)", marginTop: "4px", display: "block" }}>{noCtaCount}</span>
          </div>

          <div style={{ padding: "12px", border: `1.5px solid ${expiredSectionsCount > 0 ? "rgba(248,113,113,0.3)" : "var(--admin-border)"}`, borderRadius: "6px", background: expiredSectionsCount > 0 ? "rgba(248,113,113,0.02)" : "none" }}>
            <span style={{ fontSize: "11px", color: expiredSectionsCount > 0 ? "#ef4444" : "var(--admin-muted)", display: "block" }}>Sections landing expirées</span>
            <span style={{ fontSize: "20px", fontWeight: 600, color: expiredSectionsCount > 0 ? "#ef4444" : "var(--admin-text)", marginTop: "4px", display: "block" }}>{expiredSectionsCount}</span>
          </div>

        </div>
      </section>

      {/* ────────────────── 3. COLONNES DOUBLE SECTION ────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Colonne Principale: Audit à corriger */}
        <section id="audit-table" className="admin-section" style={{ margin: 0 }}>
          <div className="admin-section__header">
            <h2 className="admin-section__title">Audit de Contenu : Articles à corriger</h2>
            <span className="badge" style={{ fontSize: "11px" }}>{issues.length} alerte{issues.length !== 1 ? "s" : ""}</span>
          </div>

          {issues.length === 0 ? (
            <div className="admin-empty" style={{ padding: "40px" }}>
              <p style={{ color: "var(--admin-green)", fontStyle: "normal" }}>✓ Félicitations, aucun problème SEO ou de contenu détecté sur vos articles !</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Problème détecté</th>
                    <th>Priorité</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue, idx) => (
                    <tr key={`${issue.articleId}-${idx}`}>
                      <td className="admin-table__title">
                        <Link href={`/admin/articles/${issue.articleId}`} className="admin-table__title-link">
                          {issue.title}
                        </Link>
                        <span className="admin-table__meta">{issue.locale}</span>
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--admin-muted)" }}>
                        {issue.problem}
                      </td>
                      <td>
                        <span className={`badge ${issue.priorityClass}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/articles/${issue.articleId}`} className="admin-action">
                          Corriger
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Colonne Latérale: Actions & Activités */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Actions Rapides */}
          <section className="admin-panel" style={{ margin: 0, padding: "20px" }}>
            <h3 className="admin-panel__title" style={{ marginBottom: "16px" }}>Actions Rapides</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/admin/articles/new" className="admin-btn admin-btn--primary admin-btn--full">
                ✍ Créer un nouvel article
              </Link>
              <Link href="/admin/sections" className="admin-btn admin-btn--ghost admin-btn--full">
                🧱 Gérer les sections landing
              </Link>
              <a href="#audit-table" className="admin-btn admin-btn--ghost admin-btn--full" style={{ textAlign: "center" }}>
                🔍 Voir articles à corriger
              </a>
              
              <GoogleImportButton />
            </div>
          </section>

          {/* Derniers articles modifiés */}
          <section className="admin-panel" style={{ margin: 0, padding: "20px" }}>
            <h3 className="admin-panel__title" style={{ marginBottom: "16px" }}>Récemment Modifiés</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentArticles.map((a) => (
                <li key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--admin-border)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "70%" }}>
                    <Link href={`/admin/articles/${a.id}`} style={{ color: "var(--admin-text)", textDecoration: "none", fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.title}
                    </Link>
                    <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>
                      Modifié le {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(a.updatedAt))}
                    </span>
                  </div>
                  <ArticleStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
