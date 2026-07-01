import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";

export const metadata: Metadata = {
  title: "Overview — Platform Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GrowthDashboardPage() {
  await ensureAdminSchema();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    destinationsLive,
    destinationsTotal,
    landingsLive,
    landingsDraft,
    offersLive,
    leadsWeek,
    leadsToday,
    metricsWeek,
    experimentsRunning,
    testimonialsLive,
    whatsappActive,
    trackingActive,
    failedLeadsCount,
    allLandingsWithScores,
  ] = await Promise.all([
    prisma.destination.count({ where: { status: "LIVE" } }),
    prisma.destination.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.landingPage.count({ where: { status: "LIVE" } }),
    prisma.landingPage.count({ where: { status: "DRAFT" } }),
    prisma.offer.count({ where: { status: "LIVE" } }),
    prisma.leadSubmission.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.leadSubmission.count({
      where: {
        createdAt: {
          gte: (() => {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            return start;
          })(),
        },
      },
    }),
    prisma.landingMetricDaily.aggregate({
      where: { date: { gte: weekAgo } },
      _sum: {
        views: true,
        whatsappClicks: true,
        stickyClicks: true,
        formStarts: true,
        formSubmits: true,
        bookingClicks: true,
        leads: true,
      },
    }),
    prisma.experiment.count({ where: { status: "RUNNING" } }),
    prisma.testimonial.count({ where: { status: "LIVE" } }),
    prisma.whatsappChannel.count({ where: { status: { in: ["ACTIVE", "CONNECTED_GHL"] } } }),
    prisma.trackingProfile.count({ where: { status: "ACTIVE" } }),
    prisma.leadSubmission.count({ where: { status: "FAILED" } }),
    prisma.landingPage.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { readinessScore: true },
    }),
  ]);

  const recentLandings = await prisma.landingPage.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      slug: true,
      locale: true,
      heroTitle: true,
      status: true,
      readinessScore: true,
      updatedAt: true,
      destination: { select: { cityName: true } },
    },
  });

  // Calcul du score de préparation moyen (readiness score)
  const totalScore = allLandingsWithScores.reduce((sum, l) => sum + (l.readinessScore || 0), 0);
  const readinessAvg = allLandingsWithScores.length > 0 ? Math.round(totalScore / allLandingsWithScores.length) : 100;

  // Calcul des taux de conversion
  const totalViews = metricsWeek._sum.views ?? 0;
  const totalWhatsappClicks = (metricsWeek._sum.whatsappClicks ?? 0) + (metricsWeek._sum.stickyClicks ?? 0);
  const totalFormSubmits = metricsWeek._sum.formSubmits ?? 0;
  const totalBookingClicks = metricsWeek._sum.bookingClicks ?? 0;

  const convWhatsapp = totalViews > 0 ? ((totalWhatsappClicks / totalViews) * 100).toFixed(1) : "0.0";
  const convForm = totalViews > 0 ? ((totalFormSubmits / totalViews) * 100).toFixed(1) : "0.0";
  const convBooking = totalViews > 0 ? ((totalBookingClicks / totalViews) * 100).toFixed(1) : "0.0";

  // Top Landings & Destinations (7 derniers jours)
  const dailyStats = await prisma.landingMetricDaily.groupBy({
    by: ["landingPageId"],
    where: { date: { gte: weekAgo } },
    _sum: { views: true, whatsappClicks: true, stickyClicks: true, formSubmits: true },
  });

  const landingsDataRaw = await Promise.all(
    dailyStats.map(async (stat) => {
      const landing = await prisma.landingPage.findUnique({
        where: { id: stat.landingPageId },
        select: {
          heroTitle: true,
          slug: true,
          locale: true,
          destination: { select: { id: true, cityName: true } },
        },
      });
      return {
        ...stat,
        landing,
      };
    })
  );

  const topLandings = landingsDataRaw
    .filter((l) => !!l.landing)
    .sort((a, b) => (b._sum.views ?? 0) - (a._sum.views ?? 0))
    .slice(0, 5);

  const destMap: Record<string, { name: string; views: number; whatsapp: number; leads: number }> = {};
  for (const item of landingsDataRaw) {
    if (!item.landing?.destination) continue;
    const dest = item.landing.destination;
    if (!destMap[dest.id]) {
      destMap[dest.id] = { name: dest.cityName, views: 0, whatsapp: 0, leads: 0 };
    }
    destMap[dest.id].views += item._sum.views ?? 0;
    destMap[dest.id].whatsapp += (item._sum.whatsappClicks ?? 0) + (item._sum.stickyClicks ?? 0);
    destMap[dest.id].leads += item._sum.formSubmits ?? 0;
  }

  const topDestinations = Object.values(destMap)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Détermination des alertes critiques
  const alerts: string[] = [];
  if (failedLeadsCount > 0) {
    alerts.push(`⚠️ ${failedLeadsCount} lead(s) en échec d'envoi vers GHL. Vérifiez les erreurs CRM.`);
  }
  if (!process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
    alerts.push("⚠️ Token GHL_PRIVATE_INTEGRATION_TOKEN manquant dans les variables d'environnement.");
  }
  if (readinessAvg < 85) {
    alerts.push(`⚠️ Average readiness score is low (${readinessAvg}/100). Some pages are missing required blocks.`);
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Overview"
        meta="Pages, analytics, lead routing and conversion at a glance"
        action={{ href: "/admin/landings/new", label: "+ New page" }}
      />

      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px", padding: "16px", borderRadius: "8px", border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.05)" }}>
          <h3 style={{ fontSize: "14px", color: "#ef4444", margin: 0, fontWeight: "bold" }}>Platform alerts requiring attention</h3>
          <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--admin-text)", fontSize: "13px" }}>
            {alerts.map((alert, idx) => <li key={idx} style={{ marginBottom: "4px" }}>{alert}</li>)}
          </ul>
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid kpi-grid--business" style={{ marginBottom: "24px" }}>
        <Link href="/admin/destinations" className="kpi-card kpi-card--link kpi-card--green">
          <span className="kpi-card__value">{destinationsLive}</span>
          <span className="kpi-card__label">Destinations live</span>
        </Link>
        <Link href="/admin/landings" className="kpi-card kpi-card--link">
          <span className="kpi-card__value">{landingsLive}</span>
          <span className="kpi-card__label">Live pages</span>
        </Link>
        <div className="kpi-card">
          <span className="kpi-card__value">{readinessAvg}/100</span>
          <span className="kpi-card__label">Score préparation moyen</span>
        </div>
        <Link href="/admin/demandes?status=FAILED" className="kpi-card kpi-card--link kpi-card--amber">
          <span className="kpi-card__value">{failedLeadsCount}</span>
          <span className="kpi-card__label">Leads en échec GHL</span>
        </Link>
        <Link href="/admin/demandes" className="kpi-card kpi-card--link kpi-card--green">
          <span className="kpi-card__value">{leadsToday}</span>
          <span className="kpi-card__label">Leads aujourd&apos;hui</span>
        </Link>
        <Link href="/admin/demandes" className="kpi-card kpi-card--link">
          <span className="kpi-card__value">{leadsWeek}</span>
          <span className="kpi-card__label">Leads 7 jours</span>
        </Link>
      </div>

      {/* Conversion stats */}
      <section className="admin-section" style={{ marginBottom: "24px" }}>
        <h2 className="admin-section__title">Performances & Conversions (7 jours)</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-card__value">{totalViews}</span>
            <span className="kpi-card__label">Vues totales</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value">{convWhatsapp}%</span>
            <span className="kpi-card__label">Taux WhatsApp ({totalWhatsappClicks} clics)</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value">{convForm}%</span>
            <span className="kpi-card__label">Taux Formulaire ({totalFormSubmits} submits)</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value">{convBooking}%</span>
            <span className="kpi-card__label">Taux Booking ({totalBookingClicks} clics)</span>
          </div>
        </div>
      </section>

      {/* Grid: Top Landings / Destinations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <section className="admin-section">
          <h2 className="admin-section__title">Top pages by views (7d)</h2>
          {topLandings.length === 0 ? (
            <p style={{ color: "var(--admin-text-muted)", fontSize: "13px" }}>Aucune donnée sur les 7 derniers jours.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Vues</th>
                    <th>Convs (Form)</th>
                  </tr>
                </thead>
                <tbody>
                  {topLandings.map((l) => (
                    <tr key={l.landingPageId}>
                      <td>
                        <Link href={`/admin/landings/${l.landingPageId}/edit`} style={{ fontWeight: "600", textDecoration: "none", color: "var(--admin-text)" }}>
                          {l.landing?.heroTitle}
                        </Link>
                        <br />
                        <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>/{l.landing?.locale.toLowerCase()}/{l.landing?.slug}</span>
                      </td>
                      <td>{l._sum.views ?? 0}</td>
                      <td>{l._sum.formSubmits ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2 className="admin-section__title">Top Destinations par Vues (7j)</h2>
          {topDestinations.length === 0 ? (
            <p style={{ color: "var(--admin-text-muted)", fontSize: "13px" }}>Aucune donnée sur les 7 derniers jours.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Vues</th>
                    <th>Clics WhatsApp</th>
                    <th>Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {topDestinations.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: "600" }}>{d.name}</td>
                      <td>{d.views}</td>
                      <td>{d.whatsapp}</td>
                      <td>{d.leads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <section className="admin-section">
          <div className="admin-section__header">
            <h2 className="admin-section__title">Infrastructure</h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              <Link href="/admin/whatsapp" className="admin-link">
                WhatsApp actifs : {whatsappActive}
              </Link>
            </li>
            <li>
              <Link href="/admin/tracking" className="admin-link">
                Active analytics profiles: {trackingActive}
              </Link>
            </li>
            <li>
              <Link href="/admin/testimonials" className="admin-link">
                Live testimonials: {testimonialsLive}
              </Link>
            </li>
            <li>
              <Link href="/admin/experiments" className="admin-link">
                Running experiments: {experimentsRunning}
              </Link>
            </li>
            <li>
              <Link href="/admin/destinations" className="admin-link">
                Destinations totales : {destinationsTotal}
              </Link>
            </li>
          </ul>
        </section>

        <section className="admin-section">
          <div className="admin-section__header">
            <h2 className="admin-section__title">Recent pages</h2>
            <Link href="/admin/landings" className="admin-link">View all</Link>
          </div>
          {recentLandings.length === 0 ? (
            <p className="admin-page__meta">No pages yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentLandings.map((l) => (
                <li key={l.id} style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "8px" }}>
                  <Link href={`/admin/landings/${l.id}/edit`} className="admin-table__title-link">
                    {l.heroTitle}
                  </Link>
                  <span className="admin-table__meta">
                    {l.destination.cityName} · {l.locale} · {l.readinessScore}/100 · {l.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Link href="/admin/seo-health" className="admin-btn admin-btn--ghost">SEO</Link>
        <Link href="/admin/health" className="admin-btn admin-btn--ghost">Diagnostics</Link>
        <Link href="/admin/media" className="admin-btn admin-btn--ghost">Media Library</Link>
      </div>
    </div>
  );
}
