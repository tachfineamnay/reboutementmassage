import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArticleContentSchema } from "@/lib/schemas";
import { countWords, estimateReadingTime } from "@/lib/utils";
import { revalidateArticlePublicPaths } from "@/lib/article-cache";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/articles/[id]/content — Upsert du contenu
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });

  const parsed = ArticleContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { locale: true, slug: true },
  });
  if (!article)
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });

  // Calcule wordCount + readingTime si plainText fourni
  const wordCount =
    data.wordCount ?? (data.plainText ? countWords(data.plainText) : 0);
  const readingTime =
    data.readingTime ?? (data.plainText ? estimateReadingTime(data.plainText) : 0);

  const content = await prisma.articleContent.upsert({
    where: { articleId: id },
    create: {
      articleId: id,
      editorJson: data.editorJson ?? undefined,
      html: data.html ?? null,
      plainText: data.plainText ?? null,
      wordCount,
      readingTime,
    },
    update: {
      editorJson: data.editorJson ?? undefined,
      html: data.html ?? null,
      plainText: data.plainText ?? null,
      wordCount,
      readingTime,
    },
  });

  revalidateArticlePublicPaths(article);

  return NextResponse.json(content);
}

// GET /api/admin/articles/[id]/content
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const content = await prisma.articleContent.findUnique({
    where: { articleId: id },
  });
  if (!content)
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  return NextResponse.json(content);
}
