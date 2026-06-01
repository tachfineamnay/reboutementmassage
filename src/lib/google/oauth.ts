// Cache en mémoire pour le token d'accès Google
let cachedAccessToken: string | null = null;
let tokenExpiryTime = 0; // timestamp en millisecondes

export type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  siteUrl: string;
  ga4PropertyId?: string;
  pagespeedApiKey?: string;
};

/**
 * Récupère la configuration des variables d'environnement Google.
 */
export function getGoogleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";

  if (!clientId || !clientSecret || !refreshToken || !siteUrl) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    siteUrl: siteUrl.replace(/\/+$/, ""), // Supprimer les slashes à la fin
    ga4PropertyId: process.env.GA4_PROPERTY_ID,
    pagespeedApiKey: process.env.PAGESPEED_API_KEY,
  };
}

/**
 * Renvoie un token d'accès actif pour les APIs Google.
 * Si le token en cache est expiré ou absent, il est renouvelé.
 */
export async function getAccessToken(): Promise<string | null> {
  const config = getGoogleConfig();
  if (!config) {
    console.warn("Google API : Variables d'environnement de configuration manquantes.");
    return null;
  }

  const now = Date.now();
  // Utiliser le cache si encore valide (avec une marge de sécurité de 30 secondes)
  if (cachedAccessToken && now < tokenExpiryTime - 30000) {
    return cachedAccessToken;
  }

  try {
    console.log("Google API : Renouvellement du token d'accès Google OAuth...");
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`Échec du renouvellement OAuth : ${response.status} - ${JSON.stringify(errBody)}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Aucun access_token reçu de Google.");
    }

    cachedAccessToken = data.access_token;
    // expires_in est généralement fourni en secondes (ex: 3600)
    const expiresSeconds = Number(data.expires_in || 3600);
    tokenExpiryTime = now + expiresSeconds * 1000;

    console.log("Google API : Token d'accès renouvelé avec succès.");
    return cachedAccessToken;
  } catch (error) {
    console.error("Google API : Erreur lors du renouvellement du token d'accès OAuth :", error);
    return null;
  }
}
