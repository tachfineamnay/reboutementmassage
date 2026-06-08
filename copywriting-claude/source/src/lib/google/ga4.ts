import { getAccessToken, getGoogleConfig } from "./oauth";

export type Ga4Metrics = {
  sessions: number;
  storyViewCount: number;
  storyCtaClickCount: number;
  leadSubmittedCount: number;
};

/**
 * Récupère le trafic et les événements clés d'une page (ex: /stories/mon-slug) depuis Google Analytics 4.
 */
export async function fetchPageTraffic(pagePath: string): Promise<Ga4Metrics | null> {
  const config = getGoogleConfig();
  const accessToken = await getAccessToken();

  if (!config || !config.ga4PropertyId || !accessToken) {
    console.warn("GA4 : API non configurée ou property ID manquant.");
    return null;
  }

  try {
    // S'assurer que le pagePath commence par un slash
    const cleanPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${config.ga4PropertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }, { name: "eventName" }],
          metrics: [{ name: "sessions" }, { name: "eventCount" }],
          dimensionFilter: {
            filter: {
              fieldName: "pagePath",
              stringFilter: {
                matchType: "EXACT",
                value: cleanPath,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`GA4 API Error: ${response.status} - ${JSON.stringify(errBody)}`);
    }

    const data = await response.json();
    
    // Par défaut à 0
    let sessions = 0;
    let storyViewCount = 0;
    let storyCtaClickCount = 0;
    let leadSubmittedCount = 0;

    const rows = data.rows || [];

    for (const row of rows) {
      // row.dimensionValues : [0] = pagePath, [1] = eventName
      const eventName = row.dimensionValues?.[1]?.value;
      
      // row.metricValues : [0] = sessions, [1] = eventCount
      const rowSessions = Number(row.metricValues?.[0]?.value || 0);
      const eventCount = Number(row.metricValues?.[1]?.value || 0);

      // Le nombre de sessions total est la somme sur la page
      // (GA4 associe les sessions à tous les événements d'une même page)
      if (rowSessions > sessions) {
        sessions = rowSessions; // on prend le max ou on additionne intelligemment
      }

      if (eventName === "story_view") {
        storyViewCount += eventCount;
      } else if (eventName === "story_cta_click") {
        storyCtaClickCount += eventCount;
      } else if (eventName === "lead_submitted") {
        leadSubmittedCount += eventCount;
      }
    }

    return {
      sessions,
      storyViewCount,
      storyCtaClickCount,
      leadSubmittedCount,
    };
  } catch (error) {
    console.error(`GA4 : Erreur lors de la récupération des rapports pour ${pagePath} :`, error);
    return null;
  }
}
