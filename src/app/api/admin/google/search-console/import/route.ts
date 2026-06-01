import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleConfig } from "@/lib/google/oauth";
import { fetchSearchAnalytics } from "@/lib/google/search-console";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/google/search-console/import
 * Déclenche la synchronisation manuelle des données Search Console pour les articles.
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const config = getGoogleConfig();
  if (!config) {
    return NextResponse.json({ status: "non_configure", message: "API Google non configurée." });
  }

  try {
    // Calcul de la plage de dates (28 jours, glissante de 2 jours en arrière pour le délai Search Console)
    const now = Date.now();
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const toDateString = (d: Date) => d.toISOString().split("T")[0];
    const startDate = toDateString(thirtyDaysAgo);
    const endDate = toDateString(twoDaysAgo);

    console.log(`Google SC Import : Lancement pour la période ${startDate} à ${endDate}...`);
    const rows = await fetchSearchAnalytics(startDate, endDate);

    if (rows.length === 0) {
      return NextResponse.json({
        status: "success",
        importedCount: 0,
        message: "Aucune donnée retournée par la Search Console.",
      });
    }

    // Récupérer tous les articles publiés
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, locale: true },
    });

    let importedCount = 0;

    for (const row of rows) {
      // row.keys: [date, pageUrl]
      const [dateStr, pageUrl] = row.keys;
      if (!dateStr || !pageUrl) continue;

      // Extraire le slug et la locale potentielle du chemin URL de la page
      // Format attendu: https://domaine.com/stories/mon-slug ou /stories/fr/mon-slug
      let pathname = "";
      try {
        pathname = new URL(pageUrl).pathname;
      } catch {
        // Fallback si la Search Console renvoie des chemins relatifs
        pathname = pageUrl;
      }

      if (!pathname.includes("/stories")) continue;

      // Enlever le préfixe /stories/
      const cleanPath = pathname.replace(/^\/stories\/?/, ""); // ex: "fr/mon-slug" ou "mon-slug"
      const segments = cleanPath.split("/").filter(Boolean);

      let slug = "";
      if (segments.length === 2) {
        // Format legacy /stories/[locale]/[slug]
        slug = segments[1];
      } else if (segments.length === 1) {
        // Format standard /stories/[slug]
        slug = segments[0];
      } else {
        continue;
      }

      // Chercher l'article correspondant par slug
      const matchedArticle = articles.find(
        (a) => a.slug.toLowerCase() === slug.toLowerCase()
      );

      if (!matchedArticle) continue;

      const dateObj = new Date(dateStr);

      // Enregistrement incrémental dans ArticleMetric
      await prisma.articleMetric.upsert({
        where: {
          articleId_date: {
            articleId: matchedArticle.id,
            date: dateObj,
          },
        },
        create: {
          articleId: matchedArticle.id,
          date: dateObj,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
        update: {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
      });

      importedCount++;
    }

    console.log(`Google SC Import : Fin d'importation. ${importedCount} lignes insérées/mises à jour.`);

    return NextResponse.json({
      status: "success",
      importedCount,
      message: `${importedCount} lignes de métriques importées avec succès.`,
    });
  } catch (error) {
    console.error("Google SC Import : Erreur lors de la synchronisation :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'importation Search Console." },
      { status: 500 }
    );
  }
}
