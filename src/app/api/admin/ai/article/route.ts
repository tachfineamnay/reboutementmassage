import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import {
  OpenAIConfigurationError,
  OpenAIRequestError,
  createOpenAIJsonResponse,
} from "@/lib/openai";
import { sanitizeHtml } from "@/lib/utils";

const AiActionSchema = z.enum([
  "brief",
  "outline",
  "draft",
  "revise",
  "seo",
  "faq",
  "translate",
  "imagePrompt",
]);

const LocaleSchema = z.enum(["FR", "EN", "ES"]);

const FaqItemSchema = z.object({
  question: z.string().max(300),
  answer: z.string().max(2000),
});

const EvidenceNotesSchema = z.object({
  experience: z.string().max(4000).default(""),
  precautions: z.string().max(4000).default(""),
});

const ArticlePatchFields = {
  title: z.string().max(200),
  excerpt: z.string().max(500),
  contentHtml: z.string().max(60000),
  seoTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  focusKeyword: z.string().max(100),
  primaryQuestion: z.string().max(300),
  answerIntent: z.string().max(80),
  targetAudience: z.string().max(300),
  geoLocation: z.string().max(200),
  businessGoal: z.string().max(300),
  entityTargets: z.array(z.string().max(120)).max(20),
  faqItems: z.array(FaqItemSchema).max(12),
  evidenceNotes: EvidenceNotesSchema,
  imagePrompt: z.string().max(3000),
  altFr: z.string().max(200),
  altEn: z.string().max(200),
  altEs: z.string().max(200),
};

const ArticlePatchSchema = z.object(ArticlePatchFields).partial();

// Structured Outputs requires every property to be present. The model uses
// null for fields that should not be changed; normalizeResponse removes them.
const ArticleAiPatchSchema = z.object({
  title: ArticlePatchFields.title.nullable(),
  excerpt: ArticlePatchFields.excerpt.nullable(),
  contentHtml: ArticlePatchFields.contentHtml.nullable(),
  seoTitle: ArticlePatchFields.seoTitle.nullable(),
  metaDescription: ArticlePatchFields.metaDescription.nullable(),
  focusKeyword: ArticlePatchFields.focusKeyword.nullable(),
  primaryQuestion: ArticlePatchFields.primaryQuestion.nullable(),
  answerIntent: ArticlePatchFields.answerIntent.nullable(),
  targetAudience: ArticlePatchFields.targetAudience.nullable(),
  geoLocation: ArticlePatchFields.geoLocation.nullable(),
  businessGoal: ArticlePatchFields.businessGoal.nullable(),
  entityTargets: ArticlePatchFields.entityTargets.nullable(),
  faqItems: ArticlePatchFields.faqItems.nullable(),
  evidenceNotes: ArticlePatchFields.evidenceNotes.nullable(),
  imagePrompt: ArticlePatchFields.imagePrompt.nullable(),
  altFr: ArticlePatchFields.altFr.nullable(),
  altEn: ArticlePatchFields.altEn.nullable(),
  altEs: ArticlePatchFields.altEs.nullable(),
});

const ArticleAiRequestSchema = z.object({
  action: AiActionSchema,
  articleId: z.string().min(1),
  locale: LocaleSchema,
  topic: z.string().max(500).optional().default(""),
  title: z.string().max(200).optional().default(""),
  excerpt: z.string().max(500).optional().default(""),
  contentPlainText: z.string().max(60000).optional().default(""),
  seo: z.record(z.string(), z.unknown()).optional().default({}),
  instruction: z.string().max(2000).optional().default(""),
  targetLanguage: z.string().max(40).optional(),
});

const ArticleAiResponseSchema = z.object({
  message: z.string().max(4000),
  patch: ArticleAiPatchSchema,
  warnings: z.array(z.string().max(500)),
});

type ArticleAiResponse = z.infer<typeof ArticleAiResponseSchema>;
type NormalizedArticleAiResponse = Omit<ArticleAiResponse, "patch"> & {
  patch: z.infer<typeof ArticlePatchSchema>;
};

const ARTICLE_AI_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["message", "patch", "warnings"],
  properties: {
    message: { type: "string" },
    patch: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        excerpt: { type: "string" },
        contentHtml: { type: "string" },
        seoTitle: { type: "string" },
        metaDescription: { type: "string" },
        focusKeyword: { type: "string" },
        primaryQuestion: { type: "string" },
        answerIntent: { type: "string" },
        targetAudience: { type: "string" },
        geoLocation: { type: "string" },
        businessGoal: { type: "string" },
        entityTargets: {
          type: "array",
          items: { type: "string" },
        },
        faqItems: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["question", "answer"],
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
            },
          },
        },
        evidenceNotes: {
          type: "object",
          additionalProperties: false,
          properties: {
            experience: { type: "string" },
            precautions: { type: "string" },
          },
        },
        imagePrompt: { type: "string" },
        altFr: { type: "string" },
        altEn: { type: "string" },
        altEs: { type: "string" },
      },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

const ACTION_LABELS: Record<z.infer<typeof AiActionSchema>, string> = {
  brief: "produire un brief stratégique SEO/AEO/GEO",
  outline: "proposer un plan H2/H3 utile et publiable",
  draft: "rédiger un draft d'article en HTML simple",
  revise: "réviser le contenu selon l'instruction utilisateur",
  seo: "optimiser les champs SEO/AEO/GEO",
  faq: "proposer une FAQ visible",
  translate: "proposer une adaptation localisée",
  imagePrompt: "générer un prompt d'image principale et des textes alt",
};

function buildPrompt(input: z.infer<typeof ArticleAiRequestSchema>) {
  const targetLanguage = input.targetLanguage ? `\nLangue cible: ${input.targetLanguage}` : "";
  const seo = JSON.stringify(input.seo, null, 2);

  return [
    `Action: ${input.action} (${ACTION_LABELS[input.action]})`,
    `Article ID: ${input.articleId}`,
    `Locale source: ${input.locale}${targetLanguage}`,
    `Topic: ${input.topic || "(non renseigné)"}`,
    `Titre actuel: ${input.title || "(non renseigné)"}`,
    `Extrait actuel: ${input.excerpt || "(non renseigné)"}`,
    `Instruction utilisateur: ${input.instruction || "(aucune)"}`,
    `SEO actuel:\n${seo}`,
    `Texte visible actuel:\n${input.contentPlainText || "(vide)"}`,
  ].join("\n\n");
}

function normalizeResponse(response: ArticleAiResponse): NormalizedArticleAiResponse {
  const patch = ArticlePatchSchema.parse(
    Object.fromEntries(
      Object.entries(response.patch).filter(([, value]) => value !== null)
    )
  );

  return {
    ...response,
    patch: {
      ...patch,
      ...(patch.contentHtml
        ? { contentHtml: sanitizeHtml(patch.contentHtml) }
        : {}),
    },
  };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ArticleAiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const system = [
    "Tu es un assistant éditorial senior pour un studio d'articles SEO, AEO et GEO.",
    "Tu proposes des changements, tu ne publies jamais et tu ne supprimes rien.",
    "Réponds uniquement avec le JSON demandé.",
    "Dans patch, renseigne chaque champ et utilise null pour tout champ qui ne doit pas être modifié.",
    "Si tu proposes du contenu d'article, utilise du HTML simple compatible Tiptap: h2, h3, p, ul, ol, li, strong, em, blockquote.",
    "Évite les promesses médicales, reste prudent, factuel et utile.",
  ].join("\n");

  try {
    const result = await createOpenAIJsonResponse({
      system,
      user: buildPrompt(parsed.data),
      schemaName: "article_studio_response",
      jsonSchema: ARTICLE_AI_JSON_SCHEMA,
      outputSchema: ArticleAiResponseSchema,
    });

    return NextResponse.json(normalizeResponse(result));
  } catch (error) {
    if (error instanceof OpenAIConfigurationError) {
      return NextResponse.json(
        {
          error:
            "IA non configurée. Ajoutez OPENAI_API_KEY côté serveur pour activer le Studio IA.",
        },
        { status: 503 }
      );
    }

    if (error instanceof OpenAIRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Réponse IA invalide", details: error.flatten() },
        { status: 502 }
      );
    }

    console.error("[article-ai] Unexpected error:", error);
    return NextResponse.json({ error: "Erreur IA inattendue." }, { status: 500 });
  }
}
