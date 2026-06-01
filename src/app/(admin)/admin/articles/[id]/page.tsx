import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleEditor from "@/components/admin/ArticleEditor";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: article ? `${article.title} — Admin TMS` : "Article — Admin TMS",
    robots: { index: false, follow: false },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;

  const [article, metrics] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        seo: true,
        content: true,
        coverImage: { select: { id: true, url: true, filename: true, altFr: true, altEn: true, altEs: true } },
      },
    }),
    prisma.articleMetric.findMany({
      where: { articleId: id },
      orderBy: { date: "desc" },
      take: 28,
    }),
  ]);

  if (!article) notFound();

  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const avgCtr = metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.ctr, 0) / metrics.length) * 100 : 0;
  const avgPosition = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.position, 0) / metrics.length : 0;

  return (
    <div className="admin-page admin-page--editor">
      {/* Breadcrumb */}
      <nav className="admin-breadcrumb-nav" aria-label="Fil d'Ariane">
        <Link href="/admin/articles" className="admin-breadcrumb">
          ← Articles
        </Link>
        <span className="admin-breadcrumb-sep">/</span>
        <span className="admin-breadcrumb-current">{article.title}</span>
      </nav>

      <ArticleEditor
        article={{
          id: article.id,
          locale: article.locale,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          status: article.status,
          publishedAt: article.publishedAt?.toISOString() ?? null,
          updatedAt: article.updatedAt.toISOString(),
          coverImageId: article.coverImage?.id ?? "",
          coverImageUrl: article.coverImage?.url ?? "",
          coverImageAltFr: article.coverImage?.altFr ?? "",
          coverImageAltEn: article.coverImage?.altEn ?? "",
          coverImageAltEs: article.coverImage?.altEs ?? "",
          content: {
            // Contenu Tiptap JSON — null si jamais édité
            editorJson: (article.content?.editorJson as Record<string, unknown> | null) ?? null,
            plainText: article.content?.plainText ?? "",
            html: article.content?.html ?? "",
            wordCount: article.content?.wordCount ?? 0,
            readingTime: article.content?.readingTime ?? 0,
          },
          seo: {
            seoTitle: article.seo?.seoTitle ?? "",
            metaDescription: article.seo?.metaDescription ?? "",
            focusKeyword: article.seo?.focusKeyword ?? "",
            noindex: article.seo?.noindex ?? false,
            score: article.seo?.score ?? 0,
          },
        }}
        googleMetrics={{
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: avgCtr,
          position: avgPosition,
        }}
      />
    </div>
  );
}
