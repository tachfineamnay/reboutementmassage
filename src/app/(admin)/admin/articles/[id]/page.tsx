import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import ArticleEditor from "@/components/admin/ArticleEditor";
import ArticleJsonLdEditor from "@/components/admin/ArticleJsonLdEditor";
import ArticleLocaleSwitcher from "@/components/admin/ArticleLocaleSwitcher";
import {
  normalizeEntityTargets,
  normalizeEvidenceNotes,
  normalizeFaqItems,
  type GeoChecklistItem,
} from "@/lib/geo";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureAdminSchema();

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: article ? `${article.title} — GT Dash` : "Article — GT Dash",
    robots: { index: false, follow: false },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  await ensureAdminSchema();

  const { id } = await params;

  const [article, metrics] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        locale: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        seo: {
          select: {
            seoTitle: true,
            metaDescription: true,
            focusKeyword: true,
            noindex: true,
            score: true,
            llmReadabilityScore: true,
            atomicAnswerPresent: true,
            answerCoverageScore: true,
            geoChecklist: true,
            primaryQuestion: true,
            answerIntent: true,
            targetAudience: true,
            geoLocation: true,
            businessGoal: true,
            entityTargets: true,
            faqItems: true,
            evidenceNotes: true,
            customJsonLd: true,
            aeoScore: true,
            geoScore: true,
            eeatScore: true,
          },
        },
        content: {
          select: {
            editorJson: true,
            plainText: true,
            html: true,
            wordCount: true,
            readingTime: true,
          },
        },
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

      <ArticleLocaleSwitcher
        articleId={article.id}
        initialLocale={article.locale}
        slug={article.slug}
        status={article.status}
      />

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
            llmReadabilityScore: article.seo?.llmReadabilityScore ?? 0,
            atomicAnswerPresent: article.seo?.atomicAnswerPresent ?? false,
            answerCoverageScore: article.seo?.answerCoverageScore ?? 0,
            geoChecklist: (article.seo?.geoChecklist as GeoChecklistItem[] | null) ?? [],
            primaryQuestion: article.seo?.primaryQuestion ?? "",
            answerIntent: article.seo?.answerIntent ?? "",
            targetAudience: article.seo?.targetAudience ?? "",
            geoLocation: article.seo?.geoLocation ?? "",
            businessGoal: article.seo?.businessGoal ?? "",
            entityTargets: normalizeEntityTargets(article.seo?.entityTargets),
            faqItems: normalizeFaqItems(article.seo?.faqItems),
            evidenceNotes: normalizeEvidenceNotes(article.seo?.evidenceNotes),
            aeoScore: article.seo?.aeoScore ?? 0,
            geoScore: article.seo?.geoScore ?? 0,
            eeatScore: article.seo?.eeatScore ?? 0,
          },
        }}
        googleMetrics={{
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: avgCtr,
          position: avgPosition,
        }}
      />

      <ArticleJsonLdEditor
        articleId={article.id}
        initialValue={article.seo?.customJsonLd ?? []}
      />
    </div>
  );
}
