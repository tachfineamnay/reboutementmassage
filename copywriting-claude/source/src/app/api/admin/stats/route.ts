import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { computeSeoScore } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [total, published, ready, drafts, articles] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "READY" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.findMany({
      select: {
        title: true,
        coverImageId: true,
        excerpt: true,
        seo: {
          select: {
            seoTitle: true,
            metaDescription: true,
            focusKeyword: true,
            ogImageId: true,
          },
        },
        content: {
          select: { wordCount: true },
        },
      },
    }),
  ]);

  const scores = articles.map((a) =>
    computeSeoScore({
      title: a.title,
      seoTitle: a.seo?.seoTitle,
      metaDescription: a.seo?.metaDescription,
      focusKeyword: a.seo?.focusKeyword,
      ogImageId: a.seo?.ogImageId,
      coverImageId: a.coverImageId,
      excerpt: a.excerpt,
      wordCount: a.content?.wordCount,
    })
  );

  const globalScore =
    scores.length > 0
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 0;

  const missingSeo = scores.filter((s) => s < 80).length;

  return NextResponse.json({
    total,
    published,
    ready,
    drafts,
    globalSeoScore: globalScore,
    missingSeo,
  });
}
