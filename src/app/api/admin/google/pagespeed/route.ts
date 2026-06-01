import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleConfig } from "@/lib/google/oauth";
import { runMobileAudit } from "@/lib/google/pagespeed";
import { getArticlePublicPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/google/pagespeed
 * Reçoit { articleId: string } et lance un audit PageSpeed Insights.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const config = getGoogleConfig();
  if (!config) {
    // Si PageSpeed n'est pas configuré (ex: pas d'API key, mais on peut quand même tenter sans clé car elle est facultative)
    // Mais on a besoin de SITE_URL
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

    const absoluteArticleUrl = `${config.siteUrl}${getArticlePublicPath({ locale: article.locale, slug: article.slug })}`;

    console.log(`PageSpeed API : Lancement pour : ${absoluteArticleUrl}...`);
    const auditResult = await runMobileAudit(absoluteArticleUrl);

    if (!auditResult) {
      return NextResponse.json(
        { error: "Échec de l'audit PageSpeed Insights auprès de Google." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      url: absoluteArticleUrl,
      result: auditResult,
    });
  } catch (error) {
    console.error("PageSpeed API : Erreur lors du lancement de l'audit :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'exécution de l'audit PageSpeed." },
      { status: 500 }
    );
  }
}
