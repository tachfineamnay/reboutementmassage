import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArticleSeoSchema } from "@/lib/schemas";
import { computeSeoScore } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/articles/[id]/seo — Upsert des métadonnées SEO
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });

  const parsed = ArticleSeoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Récupère l'article pour le calcul du score
  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      title: true,
      coverImageId: true,
      excerpt: true,
      content: { select: { wordCount: true } },
    },
  });
  if (!article)
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });

  const score = computeSeoScore({
    title: article.title,
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    focusKeyword: data.focusKeyword,
    ogImageId: data.ogImageId,
    coverImageId: article.coverImageId,
    excerpt: article.excerpt,
    wordCount: article.content?.wordCount,
  });

  const seo = await prisma.articleSeo.upsert({
    where: { articleId: id },
    create: {
      articleId: id,
      focusKeyword: data.focusKeyword ?? null,
      seoTitle: data.seoTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      canonical: data.canonical || null,
      ogTitle: data.ogTitle ?? null,
      ogDescription: data.ogDescription ?? null,
      ogImageId: data.ogImageId ?? null,
      noindex: data.noindex ?? false,
      score,
    },
    update: {
      focusKeyword: data.focusKeyword ?? null,
      seoTitle: data.seoTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      canonical: data.canonical || null,
      ogTitle: data.ogTitle ?? null,
      ogDescription: data.ogDescription ?? null,
      ogImageId: data.ogImageId ?? null,
      noindex: data.noindex ?? false,
      score,
    },
  });

  return NextResponse.json(seo);
}

// GET /api/admin/articles/[id]/seo
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const seo = await prisma.articleSeo.findUnique({ where: { articleId: id } });
  if (!seo)
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  return NextResponse.json(seo);
}
