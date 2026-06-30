import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";

export const metadata: Metadata = {
  title: "Growth Dashboard — GT Dash",
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
      _sum: { views: true, whatsappClicks: true, formSubmits: true, leads: true },
    }),
    prisma.experiment.count({ where: { status: "RUNNING" } }),
    prisma.testimonial.count({ where: { status: "LIVE" } }),
    prisma.whatsappChannel.count({ where: { status: { in: ["ACTIVE", "CONNECTED_GHL"] } } }),
    prisma.trackingProfile.count({ where: { status: "ACTIVE" } }),
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

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Growth CMS"
        meta="Destinations, landings, tracking et conversion"
        action={{ href: "/admin/landings/new", label: "+ Nouvelle landing" }}
      />

      <div className="kpi-grid kpi-grid--business" style={{ marginBottom: "24px" }}>
        <Link href="/admin/destinations" className="kpi-card kpi-card--link kpi-card--green">
          <span className="kpi-card__value">{destinationsLive}</span>
          <span className="kpi-card__label">Destinations live</span>
        </Link>
        <Link href="/admin/landings" className="kpi-card kpi-card--link">
          <span className="kpi-card__value">{landingsLive}</span>
          <span className="kpi-card__label">Landings live</span>
        </Link>
        <Link href="/admin/landings?status=DRAFT" className="kpi-card kpi-card--link kpi-card--amber">
          <span className="kpi-card__value">{landingsDraft}</span>
          <span className="kpi-card__label">Landings brouillon</span>
        </Link>
        <Link href="/admin/offers" className="kpi-card kpi-card--link">
          <span className="kpi-card__value">{offersLive}</span>
          <span className="kpi-card__label">Offres live</span>
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

      <section className="admin-section" style={{ marginBottom: "24px" }}>
        <h2 className="admin-section__title">Performance landings (7 jours)</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-card__value">{metricsWeek._sum.views ?? 0}</span>
            <span className="kpi-card__label">Vues</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value">{metricsWeek._sum.whatsappClicks ?? 0}</span>
            <span className="kpi-card__label">Clics WhatsApp</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value">{metricsWeek._sum.formSubmits ?? 0}</span>
            <span className="kpi-card__label">Formulaires</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value">{metricsWeek._sum.leads ?? 0}</span>
            <span className="kpi-card__label">Leads attribués</span>
          </div>
        </div>
      </section>

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
                Tracking actifs : {trackingActive}
              </Link>
            </li>
            <li>
              <Link href="/admin/testimonials" className="admin-link">
                Témoignages live : {testimonialsLive}
              </Link>
            </li>
            <li>
              <Link href="/admin/experiments" className="admin-link">
                Expériences en cours : {experimentsRunning}
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
            <h2 className="admin-section__title">Landings récentes</h2>
            <Link href="/admin/landings" className="admin-link">Voir tout</Link>
          </div>
          {recentLandings.length === 0 ? (
            <p className="admin-page__meta">Aucune landing.</p>
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
        <Link href="/admin/seo-health" className="admin-btn admin-btn--ghost">SEO Health</Link>
        <Link href="/admin/health" className="admin-btn admin-btn--ghost">Health Check</Link>
        <Link href="/admin/media" className="admin-btn admin-btn--ghost">Médias</Link>
      </div>
    </div>
  );
}
