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
  if (!input.hero.title) {
    issues.push({ step: "Hero", message: "Titre hero requis.", severity: "critical" });
  }
  if (!input.hero.heroImageId) {
    issues.push({ step: "Hero", message: "Image hero recommandée.", severity: "warning" });
  }
  if (!input.offer.whatsappChannelId) {
    issues.push({ step: "Conversion", message: "Canal WhatsApp requis avant publication.", severity: "critical" });
  }
  if (!input.seo.metaDescription) {
    issues.push({ step: "SEO", message: "Meta description recommandée.", severity: "warning" });
  }

  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = issues.length - criticalCount;
  const score = Math.max(0, 100 - criticalCount * 25 - warningCount * 10);

  return {
    score,
    canPublish: criticalCount === 0,
    issues,
  };
}
