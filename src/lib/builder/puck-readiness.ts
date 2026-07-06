import type { LandingPageWithRelations, ReadinessIssue } from "@/lib/growth/types";
import { hasComplianceIssues } from "@/lib/growth/compliance";
import { isValidE164 } from "@/lib/growth/whatsapp";
import {
  getPuckDataFromLanding,
  isPuckLanding,
  type PuckLandingSource,
} from "@/lib/builder/default-puck-data";
import type { TmsPuckData } from "@/lib/builder/puck-data-schema";

export type PuckReadinessSeverity = "critical" | "warning";
export type PuckReadinessIssue = ReadinessIssue & {
  severity: PuckReadinessSeverity;
  location?: string;
  recommendation?: string;
};

export type PuckReadinessResult = {
  score: number;
  issues: PuckReadinessIssue[];
  canPublish: boolean;
  criticalCount: number;
  warningCount: number;
};

function issue(
  code: string,
  severity: PuckReadinessSeverity,
  message: string,
  actionUrl?: string,
  location?: string,
  recommendation?: string
): PuckReadinessIssue {
  return { code, severity, message, actionUrl, location, recommendation };
}

function block<T extends TmsPuckData["content"][number]["type"]>(data: TmsPuckData, type: T) {
  return data.content.find((item) => item.type === type) as Extract<TmsPuckData["content"][number], { type: T }> | undefined;
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasAnyCta(data: TmsPuckData, landing: PuckLandingSource) {
  const hero = block(data, "HeroSection");
  const offer = block(data, "OfferSection");
  const finalCta = block(data, "FinalCtaSection");
  return Boolean(
    hasText(landing.primaryCta) ||
      hasText(hero?.props.primaryCta) ||
      hasText(offer?.props.ctaLabel) ||
      hasText(finalCta?.props.primary)
  );
}

function hasProofOrTestimonial(data: TmsPuckData, landing: PuckLandingSource) {
  const proof = block(data, "ProofBadgesSection");
  const testimonial = block(data, "TestimonialSection");
  const legacyBadges = Array.isArray(landing.proofBadges) && landing.proofBadges.length > 0;
  const legacyTestimonials = Array.isArray((landing as { testimonialIds?: unknown }).testimonialIds)
    ? ((landing as { testimonialIds: unknown[] }).testimonialIds.length > 0)
    : false;
  return Boolean(
    legacyBadges ||
      legacyTestimonials ||
      (proof?.props.badges?.length ?? 0) > 0 ||
      hasText(testimonial?.props.quote) ||
      hasText(testimonial?.props.videoSrc)
  );
}

export function computePuckReadiness(landing: LandingPageWithRelations | PuckLandingSource): PuckReadinessResult {
  const data = isPuckLanding(landing.content) ? getPuckDataFromLanding(landing) : getPuckDataFromLanding(landing);
  const issues: PuckReadinessIssue[] = [];
  const studioUrl = landing.id ? `/admin/pages/${landing.id}/studio` : "/admin/pages";
  const expertUrl = landing.id ? `/admin/landings/${landing.id}/edit` : "/admin/landings";
  const hero = block(data, "HeroSection");
  const form = block(data, "LeadFormSection");
  const faq = block(data, "FAQSection");

  if (!hasText(hero?.props.title) && !hasText(landing.heroTitle)) {
    issues.push(issue("hero_title_missing", "critical", "Titre hero manquant.", studioUrl, "Hero"));
  }

  if (!hasText(hero?.props.subtitle) && !hasText(landing.heroSubtitle)) {
    issues.push(issue("hero_subtitle_missing", "critical", "Sous-titre hero manquant.", studioUrl, "Hero"));
  }

  if (!hasAnyCta(data, landing)) {
    issues.push(issue("cta_missing", "critical", "Aucun CTA exploitable n'est configuré.", studioUrl, "CTA"));
  }

  if (!form && !landing.whatsappChannelId) {
    issues.push(issue("conversion_path_missing", "critical", "Aucun formulaire ni canal WhatsApp n'est disponible.", studioUrl, "Conversion"));
  }

  const channel = (landing as LandingPageWithRelations).whatsappChannel;
  if (!landing.whatsappChannelId || !channel) {
    issues.push(issue("whatsapp_missing", "critical", "Canal WhatsApp requis avant publication.", "/admin/whatsapp", "WhatsApp"));
  } else {
    if (channel.status !== "ACTIVE") {
      issues.push(issue("whatsapp_inactive", "critical", "Canal WhatsApp non actif.", `/admin/whatsapp/${channel.id}/edit`, "WhatsApp"));
    }
    if (!isValidE164(channel.phoneE164)) {
      issues.push(issue("whatsapp_phone_invalid", "critical", "Numéro WhatsApp invalide.", `/admin/whatsapp/${channel.id}/edit`, "WhatsApp"));
    }
  }

  const tracking = (landing as LandingPageWithRelations).trackingProfile;
  if (!landing.trackingProfileId || !tracking) {
    issues.push(issue("tracking_missing", "critical", "Profil tracking requis avant publication.", "/admin/tracking", "Tracking"));
  } else if (tracking.status !== "ACTIVE") {
    issues.push(issue("tracking_inactive", "critical", "Profil tracking non actif.", `/admin/tracking/${tracking.id}/edit`, "Tracking"));
  } else if (!tracking.enableGA4 && !tracking.enableMeta && !tracking.enableTikTok && !tracking.enableGTM && !tracking.enableGoogleAds) {
    issues.push(issue("tracking_disabled", "critical", "Le profil tracking est actif mais aucun canal n'est activé.", `/admin/tracking/${tracking.id}/edit`, "Tracking"));
  }

  if (!hasText(landing.seoTitle)) {
    issues.push(issue("seo_title_missing", "critical", "Titre SEO manquant.", expertUrl, "SEO"));
  }

  if (!hasText(landing.metaDescription)) {
    issues.push(issue("seo_meta_missing", "critical", "Meta description manquante.", expertUrl, "SEO"));
  } else if ((landing.metaDescription ?? "").trim().length < 120) {
    issues.push(issue("seo_meta_short", "warning", "Meta description trop courte pour une page publiée.", expertUrl, "SEO"));
  }

  if (!hasProofOrTestimonial(data, landing)) {
    issues.push(issue("proof_missing", "critical", "Preuve ou témoignage requis avant publication.", studioUrl, "Preuve"));
  }

  if (!form || !hasText(form.props.headline)) {
    issues.push(issue("lead_form_incomplete", "warning", "Formulaire court incomplet.", studioUrl, "Formulaire"));
  }

  if (!faq || faq.props.items.length < 2) {
    issues.push(issue("faq_incomplete", "warning", "FAQ courte ou absente.", studioUrl, "FAQ"));
  }

  const complianceBlob = [
    landing.heroTitle,
    landing.heroSubtitle,
    landing.complianceText,
    JSON.stringify(landing.content ?? {}),
  ].join(" ");
  if (hasComplianceIssues(complianceBlob)) {
    issues.push(issue("medical_promise", "critical", "Copy potentiellement non conforme sur les promesses médicales.", studioUrl, "Conformité"));
  }

  const criticalCount = issues.filter((item) => item.severity === "critical").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;
  const score = Math.max(0, 100 - criticalCount * 20 - warningCount * 8);

  return {
    score,
    issues,
    canPublish: criticalCount === 0 && score >= 80,
    criticalCount,
    warningCount,
  };
}
