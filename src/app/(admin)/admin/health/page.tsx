import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { growthLandingInclude } from "@/lib/growth/types";
import { computeLandingReadiness } from "@/lib/growth/landing-readiness";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import { isValidE164 } from "@/lib/growth/whatsapp";

export const metadata: Metadata = { title: "Health Check — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Check = {
  name: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  href?: string;
};

export default async function HealthPage() {
  await ensureAdminSchema();

  const [
    allDestinations,
    landings,
    whatsappChannels,
    trackingProfiles,
    crmRules,
    liveLandingsNoWhatsapp,
    liveLandingsNoTracking,
    failedLeads,
    redirectCount,
  ] = await Promise.all([
    prisma.destination.findMany({ include: { trackingProfiles: { select: { id: true } } } }),
    prisma.landingPage.groupBy({ by: ["status"], _count: true }),
    prisma.whatsappChannel.findMany({ select: { id: true, label: true, status: true, destinationId: true, phoneE164: true } }),
    prisma.trackingProfile.findMany({ select: { id: true, label: true, status: true, metaPixelId: true, tiktokPixelId: true, ga4MeasurementId: true, googleAdsId: true, gtmContainerId: true } }),
    prisma.crmRoutingRule.findMany({ select: { id: true, destinationId: true, status: true } }),
    prisma.landingPage.count({ where: { status: "LIVE", whatsappChannelId: null } }),
    prisma.landingPage.count({ where: { status: "LIVE", trackingProfileId: null } }),
    prisma.leadSubmission.count({ where: { status: "FAILED" } }),
    prisma.redirectRule.count({ where: { active: true } }),
  ]);

  const landingsWithRelations = await prisma.landingPage.findMany({
    where: { status: "LIVE" },
    include: growthLandingInclude,
    take: 50,
  });

  const lowReadinessLive = landingsWithRelations.filter((l) => {
    const r = computeLandingReadiness(l);
    return r.score < 80;
  });

  const inactiveWhatsapp = whatsappChannels.filter((c) => c.status !== "ACTIVE");
  const inactiveTracking = trackingProfiles.filter((t) => t.status !== "ACTIVE");

  const activeWhatsappCount = whatsappChannels.filter((c) => c.status === "ACTIVE").length;
  const invalidWhatsappCount = whatsappChannels.filter((c) => !isValidE164(c.phoneE164)).length;
  const liveLandingsNoActiveWhatsappCount = landingsWithRelations.filter(
    (l) => !l.whatsappChannelId || l.whatsappChannel?.status !== "ACTIVE"
  ).length;
  const liveLandingsMissingMessageCount = landingsWithRelations.filter((l) => {
    if (!l.whatsappChannel) return false;
    const lang = l.locale;
    const msg =
      lang === "EN"
        ? l.whatsappChannel.prefilledMessageEn
        : lang === "ES"
          ? l.whatsappChannel.prefilledMessageEs
          : l.whatsappChannel.prefilledMessageFr;
    return !msg || !msg.trim();
  }).length;

  const liveDestinationsCount = allDestinations.filter((d) => d.status === "LIVE").length;
  const liveLandingsNoActiveTrackingCount = landingsWithRelations.filter(
    (l) => !l.trackingProfileId || l.trackingProfile?.status !== "ACTIVE"
  ).length;
  const activeTrackingNoPixelCount = trackingProfiles.filter(
    (t) => t.status === "ACTIVE" && !t.metaPixelId && !t.tiktokPixelId && !t.ga4MeasurementId && !t.googleAdsId && !t.gtmContainerId
  ).length;
  const destinationsNoTrackingCount = allDestinations.filter((d) => d.trackingProfiles.length === 0).length;

  const activeRules = crmRules.filter((r) => r.status === "ACTIVE");
  const activeRulesDestinationIds = new Set(activeRules.map((r) => r.destinationId));
  const liveLandingsNoActiveRoutingCount = landingsWithRelations.filter(
    (l) => !activeRulesDestinationIds.has(l.destinationId)
  ).length;
  const destinationsWithActiveRulesCount = allDestinations.filter((d) => activeRulesDestinationIds.has(d.id)).length;

  const checks: Check[] = [
    {
      name: "Destinations LIVE",
      status: liveDestinationsCount > 0 ? "ok" : "warn",
      detail: `${liveDestinationsCount} destination(s) live`,
      href: "/admin/destinations",
    },
    {
      name: "Landings LIVE",
      status: (landings.find((l) => l.status === "LIVE")?._count ?? 0) > 0 ? "ok" : "warn",
      detail: `${landings.find((l) => l.status === "LIVE")?._count ?? 0} landing(s) live`,
      href: "/admin/landings",
    },
    {
      name: "Landings LIVE sans WhatsApp",
      status: liveLandingsNoWhatsapp > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoWhatsapp} landing(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Landings LIVE sans tracking",
      status: liveLandingsNoTracking > 0 ? "warn" : "ok",
      detail: `${liveLandingsNoTracking} landing(s)`,
      href: "/admin/tracking",
    },
    {
      name: "Landings LIVE readiness < 80",
      status: lowReadinessLive.length > 0 ? "fail" : "ok",
      detail: `${lowReadinessLive.length} landing(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Canaux WhatsApp actifs (ACTIVE)",
      status: activeWhatsappCount > 0 ? "ok" : "warn",
      detail: `${activeWhatsappCount} canal(aux) actif(s) sur ${whatsappChannels.length}`,
      href: "/admin/whatsapp",
    },
    {
      name: "Canaux WhatsApp invalides (format)",
      status: invalidWhatsappCount > 0 ? "fail" : "ok",
      detail: `${invalidWhatsappCount} canal(aux) invalide(s)`,
      href: "/admin/whatsapp",
    },
    {
      name: "Landings LIVE sans WhatsApp actif",
      status: liveLandingsNoActiveWhatsappCount > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoActiveWhatsappCount} landing(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Landings LIVE avec message prérempli manquant",
      status: liveLandingsMissingMessageCount > 0 ? "warn" : "ok",
      detail: `${liveLandingsMissingMessageCount} landing(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Landings LIVE sans tracking actif",
      status: liveLandingsNoActiveTrackingCount > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoActiveTrackingCount} landing(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Tracking ACTIVE sans pixel",
      status: activeTrackingNoPixelCount > 0 ? "warn" : "ok",
      detail: `${activeTrackingNoPixelCount} profil(s)`,
      href: "/admin/tracking",
    },
    {
      name: "Destinations sans tracking",
      status: destinationsNoTrackingCount > 0 ? "warn" : "ok",
      detail: `${destinationsNoTrackingCount} destination(s)`,
      href: "/admin/destinations",
    },
    {
      name: "Canaux WhatsApp inactifs",
      status: inactiveWhatsapp.length > 0 ? "warn" : "ok",
      detail: `${inactiveWhatsapp.length} canal(aux)`,
      href: "/admin/whatsapp",
    },
    {
      name: "Token d'intégration GHL",
      status: process.env.GHL_PRIVATE_INTEGRATION_TOKEN ? "ok" : "fail",
      detail: process.env.GHL_PRIVATE_INTEGRATION_TOKEN ? "Présent" : "Absent",
    },
    {
      name: "ID de Localisation GHL",
      status: process.env.GHL_LOCATION_ID ? "ok" : "fail",
      detail: process.env.GHL_LOCATION_ID ? "Présent" : "Absent",
    },
    {
      name: "Mode Ingestion Leads GHL",
      status: "ok",
      detail: `${process.env.GHL_LEAD_MODE?.trim().toLowerCase() === "live" || (process.env.NODE_ENV === "production" && process.env.GHL_LEAD_MODE?.trim().toLowerCase() !== "mock") ? "LIVE" : "MOCK"}`,
    },
    {
      name: "Landings LIVE sans routing actif",
      status: liveLandingsNoActiveRoutingCount > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoActiveRoutingCount} landing(s)`,
      href: "/admin/crm-routing",
    },
    {
      name: "Règles actives par destination",
      status: activeRules.length > 0 ? "ok" : "warn",
      detail: `${activeRules.length} règle(s) active(s) sur ${destinationsWithActiveRulesCount} destination(s)`,
      href: "/admin/crm-routing",
    },
    {
      name: "Profils tracking inactifs",
      status: inactiveTracking.length > 0 ? "warn" : "ok",
      detail: `${inactiveTracking.length} profil(s)`,
      href: "/admin/tracking",
    },
    {
      name: "Règles CRM actives",
      status: crmRules.filter((r) => r.status === "ACTIVE").length > 0 ? "ok" : "warn",
      detail: `${crmRules.filter((r) => r.status === "ACTIVE").length} règle(s)`,
      href: "/admin/crm-routing",
    },
    {
      name: "Leads en échec GHL",
      status: failedLeads > 0 ? "fail" : "ok",
      detail: `${failedLeads} lead(s)`,
      href: "/admin/demandes?status=FAILED",
    },
    {
      name: "Redirections actives",
      status: "ok",
      detail: `${redirectCount} règle(s)`,
      href: "/admin/redirects",
    },
  ];

  const statusIcon = { ok: "✓", warn: "!", fail: "✕" };
  const statusColor = { ok: "var(--admin-green)", warn: "#fbbf24", fail: "#ef4444" };

  return (
    <div className="admin-page">
      <AdminPageHeader title="Health Check" meta="État opérationnel du Growth CMS" />

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>Statut</th>
              <th>Détail</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.name}>
                <td className="admin-table__title">{check.name}</td>
                <td>
                  <span style={{ color: statusColor[check.status], fontWeight: 600 }}>
                    {statusIcon[check.status]} {check.status.toUpperCase()}
                  </span>
                </td>
                <td>{check.detail}</td>
                <td>
                  {check.href && (
                    <Link href={check.href} className="admin-action">Voir</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lowReadinessLive.length > 0 && (
        <section className="admin-section" style={{ marginTop: "24px" }}>
          <h2 className="admin-section__title">Landings LIVE à risque</h2>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {lowReadinessLive.map((l) => (
              <li key={l.id} style={{ marginBottom: "6px" }}>
                <Link href={`/admin/landings/${l.id}/edit`} className="admin-link">{l.heroTitle}</Link>
                {" "}
                <AdminStatusBadge status={l.status} />
                {" "}— score {l.readinessScore}/100
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
