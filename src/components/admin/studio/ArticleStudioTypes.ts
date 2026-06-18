import type { ContentStats, TiptapContent } from "@/components/admin/TiptapEditor";
import type { EvidenceNotes, FaqItem, GeoChecklistItem } from "@/lib/geo";

export type Locale = "FR" | "EN" | "ES";
export type ArticleStatus = "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type StudioMobileTab = "chat" | "article" | "seo" | "image" | "langues" | "publish";
export type StudioSection = "brief" | "draft" | "seo" | "image" | "publish";

export type ArticleData = {
  id: string;
  locale: Locale;
  title: string;
  slug: string;
  excerpt: string;
  status: ArticleStatus;
  publishedAt: string | null;
  updatedAt: string;
  coverImageId: string;
  coverImageUrl: string;
  coverImageAltFr: string;
  coverImageAltEn: string;
  coverImageAltEs: string;
  content: {
    editorJson: TiptapContent;
    plainText: string;
    html: string;
    wordCount: number;
    readingTime: number;
  };
  seo: {
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    noindex: boolean;
    score: number;
    llmReadabilityScore: number;
    atomicAnswerPresent: boolean;
    answerCoverageScore: number;
    geoChecklist: GeoChecklistItem[];
    primaryQuestion: string;
    answerIntent: string;
    targetAudience: string;
    geoLocation: string;
    businessGoal: string;
    entityTargets: string[];
    faqItems: FaqItem[];
    evidenceNotes: EvidenceNotes;
    aeoScore: number;
    geoScore: number;
    eeatScore: number;
  };
};

export type GoogleMetrics = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type TiptapChangePayload = {
  editorJson: TiptapContent;
  html: string;
  plainText: string;
  stats: ContentStats;
};

export type AiAction =
  | "brief"
  | "outline"
  | "draft"
  | "revise"
  | "seo"
  | "faq"
  | "translate"
  | "imagePrompt";

export type ArticlePatch = {
  title?: string;
  excerpt?: string;
  contentHtml?: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  primaryQuestion?: string;
  answerIntent?: string;
  targetAudience?: string;
  geoLocation?: string;
  businessGoal?: string;
  entityTargets?: string[];
  faqItems?: FaqItem[];
  evidenceNotes?: EvidenceNotes;
  imagePrompt?: string;
  altFr?: string;
  altEn?: string;
  altEs?: string;
};

export type ArticleAiResponse = {
  message: string;
  patch: ArticlePatch;
  warnings: string[];
};

export type TiptapContentCommand = {
  id: string;
  html: string;
  mode: "insert" | "replace";
};
