import type { LandingBuilderInput } from "./landing-builder-schema";

export type LandingBuilderReadinessIssue = {
  step: string;
  message: string;
  severity: "critical" | "warning";
};

export function computeLandingBuilderReadiness(input: LandingBuilderInput) {
  const issues: LandingBuilderReadinessIssue[] = [];

  if (!input.market.destinationId) {
    issues.push({ step: "Marché", message: "Destination requise.", severity: "critical" });
  }
  if (!input.market.slug) {
    issues.push({ step: "Marché", message: "Slug local requis.", severity: "critical" });
  }
  if (!input.hero.heroTitle) {
    issues.push({ step: "Hero", message: "Titre hero requis.", severity: "critical" });
  }
  if (!input.hero.heroSubtitle || input.hero.heroSubtitle.length < 60) {
    issues.push({ step: "Hero", message: "Sous-titre hero trop court pour convertir.", severity: "warning" });
  }
  if (!input.hero.primaryCta) {
    issues.push({ step: "Hero", message: "CTA principal requis.", severity: "critical" });
  }
  if (!input.hero.heroImageId) {
    issues.push({ step: "Hero", message: "Image hero recommandée.", severity: "warning" });
  }
  if (input.hero.heroImageId && !input.hero.imageAlt) {
    issues.push({ step: "Hero", message: "Alt image requis si une image hero est choisie.", severity: "warning" });
  }
  if (!input.offer.whatsappChannelId) {
    issues.push({ step: "Conversion", message: "Canal WhatsApp requis avant publication.", severity: "critical" });
  }
  if (!input.offer.trackingProfileId) {
    issues.push({ step: "Tracking", message: "Profil tracking requis avant publication.", severity: "critical" });
  }
  if (!input.seo.seoTitle) {
    issues.push({ step: "SEO", message: "Titre SEO requis.", severity: "warning" });
  }
  if (!input.seo.metaDescription || input.seo.metaDescription.length < 120) {
    issues.push({ step: "SEO", message: "Meta description manquante ou trop courte.", severity: "warning" });
  }

  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = issues.length - criticalCount;
  const score = Math.max(0, 100 - criticalCount * 18 - warningCount * 8);

  return {
    score,
    canPublish: criticalCount === 0,
    issues,
  };
}
