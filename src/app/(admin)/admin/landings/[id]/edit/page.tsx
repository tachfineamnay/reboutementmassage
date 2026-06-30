import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { growthLandingInclude, localeToLang, type ReadinessIssue } from "@/lib/growth/types";
import { computeLandingReadiness } from "@/lib/growth/landing-readiness";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import ReadinessScoreBadge from "@/components/admin/growth/ReadinessScoreBadge";
import {
  upsertLandingAction,
  publishLandingAction,
  archiveLandingAction,
} from "@/lib/growth/actions";

export const metadata: Metadata = { title: "Éditer landing — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TEMPLATES = [
  "MOBILE_WHATSAPP_FIRST", "PREMIUM_PRIVATE_SESSION", "B2B_HOSPITALITY",
  "FORMATION_LEADGEN", "SEO_LOCAL_SERVICE", "EVENT_WORKSHOP",
] as const;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; published?: string; publishBlocked?: string }>;
};

export default async function EditLandingPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved, published, publishBlocked } = await searchParams;

  const landing = await prisma.landingPage.findUnique({
    where: { id },
    include: growthLandingInclude,
  });
  if (!landing) notFound();

  const [destinations, offers, channels, tracking, crmRules] = await Promise.all([
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
    prisma.offer.findMany({ where: { destinationId: landing.destinationId }, orderBy: { internalName: "asc" } }),
    prisma.whatsappChannel.findMany({ where: { destinationId: landing.destinationId } }),
    prisma.trackingProfile.findMany({ where: { destinationId: landing.destinationId } }),
    prisma.crmRoutingRule.findMany({ where: { destinationId: landing.destinationId } }),
  ]);

  const readiness = computeLandingReadiness(landing);
  const storedIssues = Array.isArray(landing.readinessIssues)
    ? (landing.readinessIssues as ReadinessIssue[])
    : readiness.issues;

  return (
    <div className="admin-page">
      <AdminPageHeader title={landing.heroTitle} meta={`/${localeToLang(landing.locale)}/${landing.slug}`}>
        <ReadinessScoreBadge score={readiness.score} />
        {landing.status !== "LIVE" && (
          <form action={publishLandingAction}>
            <input type="hidden" name="id" value={landing.id} />
            {landing.publishOverride && <input type="hidden" name="override" value="true" />}
            <button type="submit" className="admin-btn admin-btn--primary">Publier (LIVE)</button>
          </form>
        )}
      </AdminPageHeader>

      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "12px" }}>Enregistré.</p>}
      {published === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "12px" }}>Landing publiée en LIVE.</p>}
      {publishBlocked === "1" && (
        <p role="alert" style={{ color: "#ef4444", marginBottom: "12px" }}>
          Publication bloquée : score readiness &lt; 80 ou noindex actif. Corrigez les issues ci-dessous ou activez publish override.
        </p>
      )}

      {storedIssues.length > 0 && (
        <section className="admin-section" style={{ marginBottom: "20px" }}>
          <h2 className="admin-section__title">Issues readiness ({storedIssues.length})</h2>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
            {storedIssues.map((issue) => (
              <li key={issue.code} style={{ marginBottom: "4px" }}>
                <strong>{issue.severity}</strong> — {issue.message}
                {issue.actionUrl && (
                  <> · <Link href={issue.actionUrl} className="admin-link">Corriger</Link></>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={upsertLandingAction} className="admin-form">
        <input type="hidden" name="id" value={landing.id} />
        <input type="hidden" name="painChips" value={JSON.stringify(landing.painChips)} />
        <input type="hidden" name="proofBadges" value={JSON.stringify(landing.proofBadges)} />
        <input type="hidden" name="processSteps" value={JSON.stringify(landing.processSteps)} />
        <input type="hidden" name="faq" value={JSON.stringify(landing.faq)} />
        <input type="hidden" name="content" value={JSON.stringify(landing.content)} />

        <div className="admin-form__grid">
          <label className="admin-field">
            <span className="admin-field__label">Destination *</span>
            <select name="destinationId" required defaultValue={landing.destinationId} className="admin-input">
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.cityName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Offre</span>
            <select name="offerId" defaultValue={landing.offerId ?? ""} className="admin-input">
              <option value="">—</option>
              {offers.map((o) => <option key={o.id} value={o.id}>{o.internalName}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Locale *</span>
            <select name="locale" required defaultValue={landing.locale} className="admin-input">
              <option value="FR">FR</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Slug *</span>
            <input name="slug" required defaultValue={landing.slug} className="admin-input" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Template</span>
            <select name="template" defaultValue={landing.template} className="admin-input">
              {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Statut</span>
            <select name="status" defaultValue={landing.status} className="admin-input">
              <option value="DRAFT">Brouillon</option>
              <option value="READY">Prêt</option>
              <option value="LIVE">Live</option>
              <option value="PAUSED">Pause</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Canal WhatsApp</span>
            <select name="whatsappChannelId" defaultValue={landing.whatsappChannelId ?? ""} className="admin-input">
              <option value="">—</option>
              {channels.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Profil tracking</span>
            <select name="trackingProfileId" defaultValue={landing.trackingProfileId ?? ""} className="admin-input">
              <option value="">—</option>
              {tracking.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Règle CRM</span>
            <select name="crmRoutingRuleId" defaultValue={landing.crmRoutingRuleId ?? ""} className="admin-input">
              <option value="">—</option>
              {crmRules.map((r) => <option key={r.id} value={r.id}>#{r.priority} {r.leadSegment ?? r.intent ?? ""}</option>)}
            </select>
          </label>
        </div>

        <label className="admin-field">
          <span className="admin-field__label">Hero title *</span>
          <input name="heroTitle" required defaultValue={landing.heroTitle} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Hero subtitle</span>
          <textarea name="heroSubtitle" rows={2} defaultValue={landing.heroSubtitle ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">CTA principal</span>
          <input name="primaryCta" defaultValue={landing.primaryCta ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">SEO title</span>
          <input name="seoTitle" defaultValue={landing.seoTitle ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Meta description</span>
          <textarea name="metaDescription" rows={2} defaultValue={landing.metaDescription ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Canonical</span>
          <input name="canonical" defaultValue={landing.canonical ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Zone desservie</span>
          <input name="areaServed" defaultValue={landing.areaServed ?? ""} className="admin-input" />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Texte conformité</span>
          <textarea name="complianceText" rows={3} defaultValue={landing.complianceText ?? ""} className="admin-input" />
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="noindex" type="checkbox" defaultChecked={landing.noindex} />
          <span>noindex</span>
        </label>
        <label className="admin-field admin-field--checkbox">
          <input name="publishOverride" type="checkbox" defaultChecked={landing.publishOverride} />
          <span>Publish override (ignorer le gate readiness)</span>
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Enregistrer</button>
        </div>
      </form>

      {landing.status !== "ARCHIVED" && (
        <form action={archiveLandingAction} style={{ marginTop: "24px" }}>
          <input type="hidden" name="id" value={landing.id} />
          <button type="submit" className="admin-btn admin-btn--ghost">Archiver</button>
        </form>
      )}
    </div>
  );
}
