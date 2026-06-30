import type { LandingPageWithRelations, ReadinessIssue, ReadinessResult } from "@/lib/growth/types";
import { COMPLIANCE_DEFAULT_FR, FORBIDDEN_MEDICAL_TERMS } from "@/lib/growth/types";
import { isWhatsappChannelActive, isValidE164 } from "@/lib/growth/whatsapp";
import { hasComplianceIssues } from "@/lib/growth/compliance";

function issue(
  code: string,
  severity: ReadinessIssue["severity"],
  message: string,
  actionUrl?: string
): ReadinessIssue {
  return { code, severity, message, actionUrl };
}

export function computeLandingReadiness(landing: LandingPageWithRelations): ReadinessResult {
  let score = 0;
  const issues: ReadinessIssue[] = [];

  if (landing.heroTitle?.trim()) {
    score += 10;
  } else {
    issues.push(issue("hero_missing", "critical", "Hero title manquant", `/admin/landings/${landing.id}/edit`));
  }

  let hasWhatsapp = false;
  if (!landing.whatsappChannelId || !landing.whatsappChannel) {
    issues.push(issue("whatsapp_missing", "critical", "Canal WhatsApp manquant", `/admin/whatsapp`));
  } else {
    hasWhatsapp = true;
    score += 10;
  }

  if (landing.template === "MOBILE_WHATSAPP_FIRST") {
    score += 8;
  } else {
    score += 4;
  }

  if (landing.offerId && landing.offer) {
    score += 8;
    if (landing.offer.durationMinutes) score += 3;
    if (landing.offer.showPrice ? landing.offer.priceAmount : true) score += 3;
  } else {
    issues.push(issue("offer_missing", "warning", "Offre non reliée", `/admin/offers`));
  }

  if (hasWhatsapp && landing.whatsappChannel) {
    if (landing.whatsappChannel.status === "ACTIVE") {
      score += 10;
    } else {
      issues.push(issue("whatsapp_inactive", "critical", "Canal WhatsApp non actif", `/admin/whatsapp`));
    }

    if (!isValidE164(landing.whatsappChannel.phoneE164)) {
      issues.push(issue("whatsapp_phone_invalid", "critical", "Numéro de téléphone WhatsApp invalide (doit être au format E.164)", `/admin/whatsapp`));
    }

    const lang = landing.locale;
    const message =
      lang === "EN"
        ? landing.whatsappChannel.prefilledMessageEn
        : lang === "ES"
          ? landing.whatsappChannel.prefilledMessageEs
          : landing.whatsappChannel.prefilledMessageFr;
    if (!message || !message.trim()) {
      issues.push(
        issue(
          "whatsapp_message_missing",
          "warning",
          `Message prérempli manquant dans la langue de la landing (${lang})`,
          `/admin/whatsapp/${landing.whatsappChannelId}/edit`
        )
      );
    }
  }

  if (landing.trackingProfile?.status === "ACTIVE") {
    score += 10;
  } else {
    issues.push(issue("tracking_missing", "warning", "Profil tracking inactif", `/admin/tracking`));
  }

  if (landing.crmRoutingRuleId && landing.crmRoutingRule?.status === "ACTIVE") {
    score += 8;
  } else {
    issues.push(issue("crm_missing", "warning", "Règle CRM inactive", `/admin/crm-routing`));
  }

  if (landing.seoTitle?.trim() && landing.metaDescription?.trim() && landing.canonical?.trim()) {
    score += 8;
  } else {
    issues.push(issue("seo_incomplete", "warning", "SEO title/meta/canonical incomplet", `/admin/landings/${landing.id}/edit`));
  }

  if (landing.hreflangGroupId) {
    score += 5;
  } else {
    issues.push(issue("hreflang_missing", "info", "Groupe hreflang non défini"));
  }

  const proofBadges = Array.isArray(landing.proofBadges) ? landing.proofBadges : [];
  const testimonialIds = Array.isArray(landing.testimonialIds) ? landing.testimonialIds : [];
  if (proofBadges.length > 0 || testimonialIds.length > 0) {
    score += 7;
  } else {
    issues.push(issue("proof_missing", "warning", "Preuve ou témoignage manquant", `/admin/testimonials`));
  }

  const faq = Array.isArray(landing.faq) ? landing.faq : [];
  const hasMedicalFaq = faq.some(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "question" in item &&
      String((item as { question: string }).question).toLowerCase().includes("médic")
  );
  if (faq.length >= 3 && hasMedicalFaq) {
    score += 4;
  } else {
    issues.push(issue("faq_incomplete", "info", "FAQ conformité incomplète"));
  }

  const copyBlob = [
    landing.heroTitle,
    landing.heroSubtitle,
    landing.complianceText,
    JSON.stringify(landing.content),
  ].join(" ");

  if (!hasComplianceIssues(copyBlob)) {
    score += 3;
  } else {
    issues.push(issue("medical_promise", "critical", "Copy potentiellement non conforme (promesse médicale)"));
  }

  if (!landing.complianceText?.trim()) {
    issues.push(issue("compliance_text", "warning", "Texte de conformité manquant"));
  } else if (landing.complianceText.includes(COMPLIANCE_DEFAULT_FR.slice(0, 20))) {
    score += 0;
  }

  score = Math.min(100, score);

  return { score, issues };
}

export class PublishBlockedError extends Error {
  issues: ReadinessIssue[];

  constructor(issues: ReadinessIssue[]) {
    super("Landing readiness score below threshold");
    this.name = "PublishBlockedError";
    this.issues = issues;
  }
}

export function assertCanPublish(
  landing: LandingPageWithRelations,
  override: boolean
): ReadinessResult {
  const readiness = computeLandingReadiness(landing);
  if (readiness.score < 80 && !override) {
    throw new PublishBlockedError(readiness.issues);
  }
  if (landing.noindex && !override) {
    throw new PublishBlockedError([
      issue("noindex_live", "critical", "noindex=true empêche l'indexation en LIVE"),
    ]);
  }
  return readiness;
}

export { FORBIDDEN_MEDICAL_TERMS };
