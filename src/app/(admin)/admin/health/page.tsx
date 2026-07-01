import type { Metadata } from "next";
import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { growthLandingInclude } from "@/lib/growth/types";
import { computeLandingReadiness } from "@/lib/growth/landing-readiness";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import { isValidE164 } from "@/lib/growth/whatsapp";
import { getUploadsDir } from "@/lib/server-utils";

export const metadata: Metadata = { title: "Diagnostics — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Check = {
  name: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  href?: string;
};

export default async function HealthPage() {
  await ensureAdminSchema();

  // 1. Diagnostics d'infrastructure (pings)
  let dbStatus: "ok" | "fail" = "ok";
  let dbDetail = "Connexion réussie";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: unknown) {
    dbStatus = "fail";
    dbDetail = `Erreur de connexion: ${err instanceof Error ? err.message : String(err)}`;
  }

  let uploadStatus: "ok" | "fail" = "ok";
  let uploadDetail = "Dossier accessible et inscriptible";
  try {
    const dir = getUploadsDir();
    await fs.mkdir(dir, { recursive: true });
    const testFile = path.join(dir, ".write-test");
    await fs.writeFile(testFile, "test");
    await fs.unlink(testFile);
  } catch (err: unknown) {
    uploadStatus = "fail";
    uploadDetail = `Erreur d'écriture: ${err instanceof Error ? err.message : String(err)}`;
  }

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
    latestGhlFailures,
    latestEventLogs,
  ] = await Promise.all([
    prisma.destination.findMany({ include: { trackingProfiles: { select: { id: true } } } }),
    prisma.landingPage.groupBy({ by: ["status"], _count: true }),
    prisma.whatsappChannel.findMany({
      select: { id: true, label: true, status: true, destinationId: true, phoneE164: true, destination: { select: { cityName: true } } },
    }),
    prisma.trackingProfile.findMany({
      select: {
        id: true,
        label: true,
        status: true,
        metaPixelId: true,
        tiktokPixelId: true,
        ga4MeasurementId: true,
        googleAdsId: true,
        gtmContainerId: true,
      },
    }),
    prisma.crmRoutingRule.findMany({ select: { id: true, destinationId: true, status: true } }),
    prisma.landingPage.count({ where: { status: "LIVE", whatsappChannelId: null } }),
    prisma.landingPage.count({ where: { status: "LIVE", trackingProfileId: null } }),
    prisma.leadSubmission.count({ where: { status: "FAILED" } }),
    prisma.redirectRule.count({ where: { active: true } }),
    prisma.leadSubmission.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.pixelEventLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { landingPage: { select: { slug: true } } },
    }),
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
      name: "Ping Base de Données",
      status: dbStatus,
      detail: dbDetail,
    },
    {
      name: "Dossier Uploads",
      status: uploadStatus,
      detail: `${uploadDetail} (${getUploadsDir()})`,
    },
    {
      name: "NEXT_PUBLIC_SITE_URL",
      status: process.env.NEXT_PUBLIC_SITE_URL ? "ok" : "warn",
      detail: process.env.NEXT_PUBLIC_SITE_URL || "Non configuré (fallback localhost)",
    },
    {
      name: "Destinations LIVE",
      status: liveDestinationsCount > 0 ? "ok" : "warn",
      detail: `${liveDestinationsCount} destination(s) live`,
      href: "/admin/destinations",
    },
    {
      name: "Live pages",
      status: (landings.find((l) => l.status === "LIVE")?._count ?? 0) > 0 ? "ok" : "warn",
      detail: `${landings.find((l) => l.status === "LIVE")?._count ?? 0} live page(s)`,
      href: "/admin/landings",
    },
    {
      name: "Live pages without WhatsApp",
      status: liveLandingsNoWhatsapp > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoWhatsapp} page(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Live pages without analytics",
      status: liveLandingsNoTracking > 0 ? "warn" : "ok",
      detail: `${liveLandingsNoTracking} page(s)`,
      href: "/admin/tracking",
    },
    {
      name: "Live pages readiness < 80",
      status: lowReadinessLive.length > 0 ? "fail" : "ok",
      detail: `${lowReadinessLive.length} page(s)`,
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
      name: "Live pages without active WhatsApp",
      status: liveLandingsNoActiveWhatsappCount > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoActiveWhatsappCount} page(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Live pages with missing prefilled message",
      status: liveLandingsMissingMessageCount > 0 ? "warn" : "ok",
      detail: `${liveLandingsMissingMessageCount} page(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Live pages without active analytics",
      status: liveLandingsNoActiveTrackingCount > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoActiveTrackingCount} page(s)`,
      href: "/admin/landings?status=LIVE",
    },
    {
      name: "Active analytics without pixel",
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
      name: "Token d'intégration GHL",
      status: process.env.GHL_PRIVATE_INTEGRATION_TOKEN ? "ok" : "fail",
      detail: process.env.GHL_PRIVATE_INTEGRATION_TOKEN ? "Présent" : "Absent (Envois vers CRM inactifs)",
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
      name: "Live pages without active lead routing",
      status: liveLandingsNoActiveRoutingCount > 0 ? "fail" : "ok",
      detail: `${liveLandingsNoActiveRoutingCount} page(s)`,
      href: "/admin/crm-routing",
    },
    {
      name: "Leads en échec GHL",
      status: failedLeads > 0 ? "fail" : "ok",
      detail: `${failedLeads} lead(s) en erreur`,
      href: "/admin/demandes?status=FAILED",
    },
    {
      name: "Redirections actives",
      status: "ok",
      detail: `${redirectCount} redirection(s) active(s)`,
      href: "/admin/redirects",
    },
  ];

  const statusIcon = { ok: "✓", warn: "!", fail: "✕" };
  const statusColor = { ok: "var(--admin-green)", warn: "#fbbf24", fail: "#ef4444" };

  return (
    <div className="admin-page">
      <AdminPageHeader title="Diagnostics" meta="Platform Admin operational health" />

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
        {/* Latest GHL Failures */}
        <section className="admin-section">
          <h2 className="admin-section__title">Derniers échecs d&apos;envois CRM (GHL)</h2>
          {latestGhlFailures.length === 0 ? (
            <p style={{ color: "var(--admin-text-muted)", fontSize: "13px" }}>Aucun échec récent ✓</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {latestGhlFailures.map((l) => (
                <div key={l.id} style={{ border: "1px solid #ef4444", borderRadius: "6px", padding: "10px", background: "rgba(239, 68, 68, 0.02)", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong>{l.firstName} ({l.contact})</strong>
                    <span style={{ color: "var(--admin-text-muted)" }}>{new Date(l.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color: "#ef4444", fontWeight: "600", fontFamily: "monospace" }}>
                    Erreur: {l.errorMessage ?? "Inconnue"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest Event Logs */}
        <section className="admin-section">
          <h2 className="admin-section__title">Derniers événements de Pixel enregistrés</h2>
          {latestEventLogs.length === 0 ? (
            <p style={{ color: "var(--admin-text-muted)", fontSize: "13px" }}>Aucun événement enregistré.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {latestEventLogs.map((e) => (
                <div key={e.id} style={{ border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "8px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong style={{ color: "var(--admin-green)" }}>{e.eventName}</strong>
                    <span style={{ color: "var(--admin-text-muted)" }}>{new Date(e.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: "var(--admin-text-muted)", fontSize: "11px", marginTop: "2px" }}>
                    Landing: {e.landingPage?.slug ?? "—"} · Source: {e.source ?? "direct"} · Meta/TikTok/GA4/GTM: {e.sentToMeta ? "✓" : "✕"}/{e.sentToTikTok ? "✓" : "✕"}/{e.sentToGA4 ? "✓" : "✕"}/{e.sentToGTM ? "✓" : "✕"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {lowReadinessLive.length > 0 && (
        <section className="admin-section" style={{ marginTop: "24px" }}>
          <h2 className="admin-section__title">At-risk live pages (readiness &lt; 80)</h2>
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
