import { getAccessToken, getGoogleConfig } from "./oauth";

export type SearchAnalyticsRow = {
  keys: string[]; // [date, page]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

/**
 * Récupère les métriques d'audience depuis Google Search Console pour le site configuré.
 */
export async function fetchSearchAnalytics(
  startDate: string,
  endDate: string
): Promise<SearchAnalyticsRow[]> {
  const config = getGoogleConfig();
  const accessToken = await getAccessToken();

  if (!config || !accessToken) {
    console.warn("Search Console : API non configurée ou token d'accès indisponible.");
    return [];
  }

  // Permettre d'écraser l'URL du site pour la Search Console via variable d'env dédiée (ex: sc-domain:...)
  const scSiteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || config.siteUrl;

  try {
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(scSiteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["date", "page"],
          rowLimit: 10000,
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`Search Console API Error: ${response.status} - ${JSON.stringify(errBody)}`);
    }

    const data = await response.json();
    return (data.rows as SearchAnalyticsRow[]) || [];
  } catch (error) {
    console.error("Search Console : Erreur lors de la récupération des analytics :", error);
    return [];
  }
}

export type UrlInspectionResult = {
  indexStatus: "INDEXED" | "NOT_INDEXED" | "UNKNOWN";
  verdict: string;
  coverageState: string;
  lastCrawlTime: string | null;
  userCanonical: string | null;
  googleCanonical: string | null;
};

/**
 * Inspecte l'état d'indexation d'une URL via l'API Google Search Console URL Inspection.
 */
export async function inspectUrl(url: string): Promise<UrlInspectionResult | null> {
  const config = getGoogleConfig();
  const accessToken = await getAccessToken();

  if (!config || !accessToken) {
    console.warn("Search Console : API non configurée pour l'inspection d'URL.");
    return null;
  }

  const scSiteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || config.siteUrl;

  try {
    const response = await fetch(
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionUrl: url,
          siteUrl: scSiteUrl,
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`URL Inspection API Error: ${response.status} - ${JSON.stringify(errBody)}`);
    }

    const data = await response.json();
    const result = data.inspectionResult?.indexStatusResult;

    if (!result) {
      return {
        indexStatus: "UNKNOWN",
        verdict: "Résultat d'inspection indisponible",
        coverageState: "Inconnu",
        lastCrawlTime: null,
        userCanonical: null,
        googleCanonical: null,
      };
    }

    const verdict = result.verdict || "UNKNOWN";
    const statusMap: Record<string, "INDEXED" | "NOT_INDEXED" | "UNKNOWN"> = {
      INDEXED: "INDEXED",
      NEUTRAL: "NOT_INDEXED",
      PARTIALLY_INDEXED: "INDEXED",
    };

    return {
      indexStatus: statusMap[verdict] || "UNKNOWN",
      verdict: verdict === "INDEXED" ? "Indexée" : verdict === "NEUTRAL" ? "Non indexée (Exclue/Erreur)" : verdict,
      coverageState: result.coverageState || "Non renseigné",
      lastCrawlTime: result.lastCrawlTime || null,
      userCanonical: result.userCanonical || null,
      googleCanonical: result.googleCanonical || null,
    };
  } catch (error) {
    console.error(`Search Console : Erreur lors de l'inspection de l'URL ${url} :`, error);
    return null;
  }
}
