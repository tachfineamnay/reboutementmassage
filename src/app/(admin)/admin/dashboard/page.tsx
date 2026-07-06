import type { Metadata } from "next";
import Link from "next/link";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";
import { formatLeadSlot, LEAD_STATUS_CLASSES, LEAD_STATUS_LABELS } from "@/lib/admin-leads";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  AdminAlert,
  AdminDataTable,
  AdminPage,
  AdminQuickActions,
  AdminSection,
  AdminStatCard,
  AdminStatusBadge,
} from "@/components/admin/AdminPage";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Tableau de bord — TMS Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function readiness(value: number) {
  return `${Math.round(value)}/100`;
}

function landingHref(landingPageId: string) {
  return `/admin/pages/${landingPageId}/studio`;
}

export default async function AdminDashboardPage() {
  await ensureAdminSchema();
  const data = await getAdminDashboardData();
  const urgencyItems = [
    {
      label: "Leads en échec GHL",
      value: data.urgency.failedLeads,
      href: "/admin/demandes?status=FAILED",
      tone: "danger" as const,
    },
    {
      label: "À rappeler aujourd'hui",
      value: data.urgency.callbacksToday,
      href: "/admin/demandes?quick=callbacks-today",
      tone: "warning" as const,
    },
    {
      label: "Pages readiness < 80",
      value: data.urgency.lowReadinessPages,
      href: "/admin/pages?readiness=low",
      tone: "warning" as const,
    },
    {
      label: "Pages live noindex",
      value: data.urgency.liveNoindexPages,
      href: "/admin/pages?status=LIVE&noindex=true",
      tone: "danger" as const,
    },
    {
      label: "WhatsApp / tracking manquants",
      value: data.urgency.missingWhatsappOrTracking,
      href: "/admin/health",
      tone: "danger" as const,
    },
  ];
  const hasUrgency = urgencyItems.some((item) => item.value > 0);

  return (
    <AdminPage wide>
      <AdminPageHeader
        title="Tableau de bord"
        meta={`Pilotage business, leads et pages locales — ${data.windows.timeZone}`}
        action={{ href: "/admin/pages/new", label: "Créer une page" }}
      />

      {hasUrgency ? (
        <AdminAlert title="Urgences à traiter" tone="danger">
          <div className="kpi-grid" style={{ marginTop: "8px" }}>
            {urgencyItems.map((item) => (
              <AdminStatCard
                key={item.label}
                label={item.label}
                value={item.value}
                href={item.href}
                tone={item.tone === "danger" ? "red" : "amber"}
              />
            ))}
          </div>
        </AdminAlert>
      ) : (
        <AdminAlert title="Aucune urgence critique" tone="warn">
          <p className="admin-page__meta">Les principaux contrôles Growth sont au vert.</p>
        </AdminAlert>
      )}

      <AdminSection title="KPIs — 7 derniers jours">
        <div className="kpi-grid kpi-grid--business">
          <AdminStatCard label="Leads aujourd'hui" value={data.kpis.leadsToday} href="/admin/demandes?period=today" tone="green" />
          <AdminStatCard label="Leads 7 jours" value={data.kpis.leads7Days} href="/admin/demandes?period=week" />
          <AdminStatCard label="Vues 7 jours" value={data.kpis.views7Days} />
          <AdminStatCard label="Clics WhatsApp" value={data.kpis.whatsappClicks7Days} />
          <AdminStatCard label="Formulaires envoyés" value={data.kpis.formSubmits7Days} />
          <AdminStatCard label="Taux WhatsApp" value={percent(data.kpis.whatsappConversionRate)} />
          <AdminStatCard label="Taux formulaire" value={percent(data.kpis.formConversionRate)} tone="green" />
          <AdminStatCard label="Pages live" value={data.kpis.livePages} href="/admin/pages?status=LIVE" />
          <AdminStatCard
            label="Readiness moyen"
            value={data.kpis.livePages > 0 ? readiness(data.kpis.averageReadiness) : "0 page live"}
          />
        </div>
      </AdminSection>

      <AdminSection title="Actions rapides">
        <AdminQuickActions
          actions={[
            { href: "/admin/pages/new", label: "+ Créer une page", primary: true },
            { href: "/admin/demandes?quick=todo", label: "Voir demandes à traiter" },
            { href: "/admin/testimonials/new", label: "Ajouter témoignage" },
            { href: "/admin/crm-routing", label: "Vérifier GHL" },
            { href: "/admin/health", label: "Voir santé technique" },
          ]}
        />
      </AdminSection>

      <AdminSection title="Leads à traiter aujourd'hui">
        {data.recentLeads.length === 0 ? (
          <div className="admin-empty" style={{ padding: "24px" }}>
            <p>Aucun lead urgent pour aujourd&apos;hui.</p>
          </div>
        ) : (
          <AdminDataTable>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Destination</th>
                  <th>Créneau</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="admin-table__title">
                      <Link href={`/admin/demandes/${lead.id}`} className="admin-table__title-link">
                        {lead.firstName}
                      </Link>
                      <span className="admin-table__meta">{lead.needType ?? lead.intent ?? lead.contact}</span>
                    </td>
                    <td>{lead.growthDestination?.cityName ?? lead.destination ?? "—"}</td>
                    <td>{formatLeadSlot(lead)}</td>
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
          </AdminDataTable>
        )}
      </AdminSection>

      <AdminSection title="Pages à corriger">
        <div className={styles.correctionGrid}>
          <div className={`admin-panel ${styles.correctionCard}`}>
            <h3 className="admin-panel__title">Readiness &lt; 80</h3>
            {data.lowReadinessList.length === 0 ? (
              <p className="admin-page__meta">Aucune page live sous 80.</p>
            ) : (
              <ul className={styles.correctionList}>
                {data.lowReadinessList.map((landing) => (
                  <li key={landing.id}>
                    <Link href={landingHref(landing.id)} className="admin-table__title-link">
                      {landing.heroTitle}
                    </Link>
                    <span className="admin-table__meta">/{landing.locale.toLowerCase()}/{landing.slug}</span>
                    <AdminStatusBadge label={`${landing.readinessScore}/100`} tone="warning" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`admin-panel ${styles.correctionCard}`}>
            <h3 className="admin-panel__title">Live avec noindex</h3>
            {data.liveNoindexList.length === 0 ? (
              <p className="admin-page__meta">Aucune page live en noindex.</p>
            ) : (
              <ul className={styles.correctionList}>
                {data.liveNoindexList.map((landing) => (
                  <li key={landing.id}>
                    <Link href={landingHref(landing.id)} className="admin-table__title-link">
                      {landing.heroTitle}
                    </Link>
                    <span className="admin-table__meta">/{landing.locale.toLowerCase()}/{landing.slug}</span>
                    <AdminStatusBadge label="noindex" tone="danger" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`admin-panel ${styles.correctionCard}`}>
            <h3 className="admin-panel__title">Vues sans lead</h3>
            {data.pagesWithViewsNoLead.length === 0 ? (
              <p className="admin-page__meta">Aucune page avec vues sans lead.</p>
            ) : (
              <ul className={styles.correctionList}>
                {data.pagesWithViewsNoLead.map((page) => {
                  const landing = page.landing;
                  if (!landing) return null;
                  return (
                    <li key={page.landingPageId}>
                      <Link href={landingHref(page.landingPageId)} className="admin-table__title-link">
                        {landing.heroTitle}
                      </Link>
                      <span className="admin-table__meta">
                        {page.views} vue{page.views !== 1 ? "s" : ""}, 0 lead
                      </span>
                      <AdminStatusBadge label="à optimiser" tone="warning" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </AdminSection>

      <AdminSection title="Santé système">
        <div className={styles.systemGrid}>
          <SystemStatus
            label="GHL token"
            ok={data.system.ghlTokenConfigured}
            detail={data.system.ghlLocationConfigured ? "Token et location configurés" : "Location ID à vérifier"}
            href="/admin/health"
          />
          <SystemStatus
            label="WhatsApp actif"
            ok={data.system.activeWhatsappChannels > 0 && data.system.liveMissingWhatsapp === 0}
            detail={`${data.system.activeWhatsappChannels} canal opérationnel, ${data.system.liveMissingWhatsapp} page(s) live à corriger`}
            href="/admin/whatsapp"
          />
          <SystemStatus
            label="Tracking actif"
            ok={data.system.activeTrackingProfiles > 0 && data.system.liveMissingTracking === 0}
            detail={`${data.system.activeTrackingProfiles} profil actif, ${data.system.liveMissingTracking} page(s) live à corriger`}
            href="/admin/tracking"
          />
          <SystemStatus
            label="DB ok"
            ok={data.system.databaseOk}
            detail={data.system.databaseOk ? "Connexion vérifiée" : "Connexion indisponible"}
            href="/admin/health"
          />
        </div>
      </AdminSection>
    </AdminPage>
  );
}

function SystemStatus({
  label,
  ok,
  detail,
  href,
}: {
  label: string;
  ok: boolean;
  detail: string;
  href: string;
}) {
  return (
    <div className={`admin-panel ${styles.systemCard}`}>
      <div className={styles.systemCardHeader}>
        <h3 className="admin-panel__title">{label}</h3>
        <AdminStatusBadge label={ok ? "OK" : "À vérifier"} tone={ok ? "success" : "danger"} />
      </div>
      <p className="admin-page__meta">{detail}</p>
      <Link href={href} className="admin-action">
        Voir
      </Link>
    </div>
  );
}
