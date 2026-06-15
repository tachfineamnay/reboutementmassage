import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { ArticleUpdateSchema } from "@/lib/schemas";
import { revalidateArticlePublicPaths } from "@/lib/article-cache";

type Params = { params: Promise<{ id: string }> };

const ARTICLE_INCLUDE = {
  seo: true,
  content: true,
  coverImage: { select: { id: true, url: true, filename: true, altFr: true, altEn: true, altEs: true } },
} as const;

// ─── GET /api/admin/articles/[id] ────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await ensureAdminSchema();

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: ARTICLE_INCLUDE,
  });
  if (!article)
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  return NextResponse.json(article);
}

// ─── PATCH /api/admin/articles/[id] ──────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await ensureAdminSchema();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });

  const parsed = ArticleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const current = await prisma.article.findUnique({
    where: { id },
    select: { locale: true, slug: true },
  });
  if (!current)
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  // Vérifie unicité du slug si changement
  if (data.slug || data.locale) {
    const newLocale = data.locale ?? current.locale;
    const newSlug = data.slug ?? current.slug;

    const conflict = await prisma.article.findFirst({
      where: { locale: newLocale, slug: newSlug, NOT: { id } },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé pour cette langue." },
        { status: 409 }
      );
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.translationGroupId !== undefined && { translationGroupId: data.translationGroupId }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.coverImageId !== undefined && { coverImageId: data.coverImageId }),
      ...(data.publishedAt !== undefined && {
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      }),
    },
    include: ARTICLE_INCLUDE,
  });

  revalidateArticlePublicPaths(current, article);

  return NextResponse.json(article);
}

// ─── PUT /api/admin/articles/[id] (alias PATCH pour compatibilité) ────────────
export { PATCH as PUT };

// ─── DELETE /api/admin/articles/[id] ─────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await ensureAdminSchema();

  const { id } = await params;

  // Vérifie existence
  const exists = await prisma.article.findUnique({
    where: { id },
    select: { id: true, locale: true, slug: true },
  });
  if (!exists)
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  await prisma.article.delete({ where: { id } });
  revalidateArticlePublicPaths(exists);
  return NextResponse.json({ success: true });
}
