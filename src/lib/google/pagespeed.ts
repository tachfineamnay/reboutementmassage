import { getGoogleConfig } from "./oauth";

export type PageSpeedAuditResult = {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  lcp: string; // Largest Contentful Paint ex: "1.2s"
  cls: string; // Cumulative Layout Shift ex: "0.05"
  auditedAt: string;
};

/**
 * Lance un audit mobile PageSpeed Insights pour l'URL spécifiée.
 */
export async function runMobileAudit(url: string): Promise<PageSpeedAuditResult | null> {
  const config = getGoogleConfig();
  const apiKey = config?.pagespeedApiKey;

  try {
    console.log(`PageSpeed : Lancement de l'audit mobile pour ${url}...`);

    // Build URL query with optional API key
    const categories = ["performance", "seo", "accessibility"];
    const params = new URLSearchParams({
      url,
      strategy: "mobile",
    });
    categories.forEach((cat) => params.append("category", cat));
    if (apiKey) {
      params.append("key", apiKey);
    }

    const response = await fetch(
      `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`PageSpeed API Error: ${response.status} - ${JSON.stringify(errBody)}`);
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;

    if (!lighthouse) {
      throw new Error("Résultat Lighthouse manquant dans la réponse PageSpeed.");
    }

    const categoriesData = lighthouse.categories;
    const audits = lighthouse.audits;

    const performanceScore = Math.round((categoriesData?.performance?.score ?? 0) * 100);
    const seoScore = Math.round((categoriesData?.seo?.score ?? 0) * 100);
    const accessibilityScore = Math.round((categoriesData?.accessibility?.score ?? 0) * 100);

    const lcp = audits?.["largest-contentful-paint"]?.displayValue || "N/A";
    const cls = audits?.["cumulative-layout-shift"]?.displayValue || "N/A";

    return {
      performanceScore,
      seoScore,
      accessibilityScore,
      lcp,
      cls,
      auditedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`PageSpeed : Erreur lors de l'audit de l'URL ${url} :`, error);
    return null;
  }
}
