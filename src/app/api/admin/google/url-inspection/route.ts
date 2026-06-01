import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleConfig } from "@/lib/google/oauth";
import { inspectUrl } from "@/lib/google/search-console";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/google/url-inspection
 * Reçoit { articleId: string } et interroge l'API Google URL Inspection pour cet article.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const config = getGoogleConfig();
  if (!config) {
    return NextResponse.json({ status: "non_configure", message: "API Google non configurée." });
  }

  try {
    const body = await req.json().catch(() => null);
    const articleId = body?.articleId;

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

    // URL absolue publique de l'article sur le site
    const absoluteArticleUrl = `${config.siteUrl}/stories/${article.slug}`;

    console.log(`URL Inspection : Inspection de l'URL : ${absoluteArticleUrl}...`);
    const inspectionData = await inspectUrl(absoluteArticleUrl);

    if (!inspectionData) {
      return NextResponse.json(
        { error: "Impossible de récupérer les données d'inspection d'URL auprès de Google." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      url: absoluteArticleUrl,
      result: inspectionData,
    });
  } catch (error) {
    console.error("URL Inspection : Erreur lors de l'inspection :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inspection de l'URL." },
      { status: 500 }
    );
  }
}
