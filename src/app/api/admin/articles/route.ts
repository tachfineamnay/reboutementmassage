import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArticleCreateSchema } from "@/lib/schemas";

const ARTICLE_INCLUDE = {
  seo: true,
  content: true,
  coverImage: { select: { id: true, url: true, filename: true } },
} as const;

// ─── GET /api/admin/articles ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const locale = searchParams.get("locale");
  const q = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Number(searchParams.get("limit") ?? "20"));

  const validStatus =
    status === "PUBLISHED" || status === "DRAFT" || status === "READY" || status === "ARCHIVED"
      ? (status as "PUBLISHED" | "DRAFT" | "READY" | "ARCHIVED")
      : undefined;

  const validLocale =
    locale === "FR" || locale === "EN" || locale === "ES"
      ? (locale as "FR" | "EN" | "ES")
      : undefined;

  const where = {
    ...(validStatus ? { status: validStatus } : {}),
    ...(validLocale ? { locale: validLocale } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: ARTICLE_INCLUDE,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({ articles, total, page, limit, pages: Math.ceil(total / limit) });
}

// ─── POST /api/admin/articles ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });

  const parsed = ArticleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Unicité [locale, slug]
  const existing = await prisma.article.findUnique({
    where: { locale_slug: { locale: data.locale, slug: data.slug } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ce slug est déjà utilisé pour cette langue." },
      { status: 409 }
    );
  }

  // Création article + ArticleContent vide + ArticleSeo vide en transaction
  const article = await prisma.$transaction(async (tx) => {
    const created = await tx.article.create({
      data: {
        locale: data.locale,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? null,
        status: data.status,
        coverImageId: data.coverImageId ?? null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });

    // ArticleContent vide — prêt pour l'éditeur
    await tx.articleContent.create({
      data: {
        articleId: created.id,
        editorJson: undefined,
        html: null,
        plainText: null,
        wordCount: 0,
        readingTime: 0,
      },
    });

    // ArticleSeo vide — prêt pour le panneau SEO
    await tx.articleSeo.create({
      data: {
        articleId: created.id,
        score: 0,
      },
    });

    return created;
  });

  // Récupère l'article complet avec relations
  const full = await prisma.article.findUnique({
    where: { id: article.id },
    include: ARTICLE_INCLUDE,
  });

  return NextResponse.json(full, { status: 201 });
}
