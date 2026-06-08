import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ArticleSeoSchema } from "@/lib/schemas";
import {
  auditGeoContent,
  normalizeEntityTargets,
  normalizeEvidenceNotes,
  normalizeFaqItems,
} from "@/lib/geo";
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
  const entityTargets = normalizeEntityTargets(data.entityTargets);
  const faqItems = normalizeFaqItems(data.faqItems);
  const evidenceNotes = normalizeEvidenceNotes(data.evidenceNotes);

  // Récupère l'article pour le calcul du score
  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      title: true,
      coverImageId: true,
      excerpt: true,
      content: {
        select: {
          wordCount: true,
          plainText: true,
          html: true,
          editorJson: true,
        },
      },
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
  const geoAudit = auditGeoContent({
    title: article.title,
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    focusKeyword: data.focusKeyword,
    plainText: article.content?.plainText,
    html: article.content?.html,
    editorJson: article.content?.editorJson,
    primaryQuestion: data.primaryQuestion,
    answerIntent: data.answerIntent,
    targetAudience: data.targetAudience,
    geoLocation: data.geoLocation,
    businessGoal: data.businessGoal,
    entityTargets,
    faqItems,
    evidenceNotes,
    authorName: "Grégory Tordjman",
  });

  const seoData = {
    focusKeyword: data.focusKeyword ?? null,
    seoTitle: data.seoTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    canonical: data.canonical || null,
    ogTitle: data.ogTitle ?? null,
    ogDescription: data.ogDescription ?? null,
    ogImageId: data.ogImageId ?? null,
    noindex: data.noindex ?? false,
    score,
    primaryQuestion: data.primaryQuestion ?? null,
    answerIntent: data.answerIntent ?? null,
    targetAudience: data.targetAudience ?? null,
    geoLocation: data.geoLocation ?? null,
    businessGoal: data.businessGoal ?? null,
    entityTargets,
    faqItems,
    evidenceNotes,
    aeoScore: geoAudit.aeoScore,
    geoScore: geoAudit.geoScore,
    eeatScore: geoAudit.eeatScore,
    llmReadabilityScore: geoAudit.llmReadabilityScore,
    atomicAnswerPresent: geoAudit.atomicAnswerPresent,
    schemaValidation: geoAudit.schemaValidation,
    geoChecklist: geoAudit.checklist,
    answerCoverageScore: geoAudit.answerCoverageScore,
    lastGeoAuditAt: new Date(),
  };

  const seo = await prisma.articleSeo.upsert({
    where: { articleId: id },
    create: {
      articleId: id,
      ...seoData,
    },
    update: seoData,
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
