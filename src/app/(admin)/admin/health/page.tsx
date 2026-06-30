import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { growthLandingInclude } from "@/lib/growth/types";
import { computeLandingReadiness } from "@/lib/growth/landing-readiness";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";

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
    destinations,
    landings,
    whatsappChannels,
    trackingProfiles,
    crmRules,
    liveLandingsNoWhatsapp,
    liveLandingsNoTracking,
    failedLeads,
    redirectCount,
  ] = await Promise.all([
    prisma.destination.groupBy({ by: ["status"], _count: true }),
    prisma.landingPage.groupBy({ by: ["status"], _count: true }),
    prisma.whatsappChannel.findMany({ select: { id: true, label: true, status: true, destinationId: true } }),
    prisma.trackingProfile.findMany({ select: { id: true, label: true, status: true } }),
    prisma.crmRoutingRule.groupBy({ by: ["status"], _count: true }),
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

  const checks: Check[] = [
    {
      name: "Destinations LIVE",
      status: (destinations.find((d) => d.status === "LIVE")?._count ?? 0) > 0 ? "ok" : "warn",
      detail: `${destinations.find((d) => d.status === "LIVE")?._count ?? 0} destination(s) live`,
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
      name: "Canaux WhatsApp inactifs",
      status: inactiveWhatsapp.length > 0 ? "warn" : "ok",
      detail: `${inactiveWhatsapp.length} canal(aux)`,
      href: "/admin/whatsapp",
    },
    {
      name: "Profils tracking inactifs",
      status: inactiveTracking.length > 0 ? "warn" : "ok",
      detail: `${inactiveTracking.length} profil(s)`,
      href: "/admin/tracking",
    },
    {
      name: "Règles CRM actives",
      status: (crmRules.find((r) => r.status === "ACTIVE")?._count ?? 0) > 0 ? "ok" : "warn",
      detail: `${crmRules.find((r) => r.status === "ACTIVE")?._count ?? 0} règle(s)`,
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
