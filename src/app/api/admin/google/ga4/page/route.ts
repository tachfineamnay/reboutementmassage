import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleConfig } from "@/lib/google/oauth";
import { fetchPageTraffic } from "@/lib/google/ga4";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/google/ga4/page
 * Paramètre de requête : ?articleId=...
 * Retourne les données de trafic GA4 pour cet article.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const config = getGoogleConfig();
  if (!config || !config.ga4PropertyId) {
    return NextResponse.json({ status: "non_configure", message: "API GA4 non configurée." });
  }

  try {
    const { searchParams } = req.nextUrl;
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json({ error: "articleId manquant." }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { slug: true, locale: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article non trouvé." }, { status: 404 });
    }

    const pagePath = `/stories/${article.slug}`;

    console.log(`GA4 API : Récupération du rapport pour le chemin : ${pagePath}...`);
    const trafficData = await fetchPageTraffic(pagePath);

    if (!trafficData) {
      return NextResponse.json(
        { error: "Impossible de récupérer les données GA4 auprès de Google." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      pagePath,
      result: trafficData,
    });
  } catch (error) {
    console.error("GA4 API : Erreur lors de la récupération :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des rapports GA4." },
      { status: 500 }
    );
  }
}
