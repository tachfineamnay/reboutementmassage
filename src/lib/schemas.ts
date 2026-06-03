// ─────────────────────────────────────────────────────────────────────────────
// Schémas Zod partagés entre API Routes et Server Actions
// Alignés sur prisma/schema.prisma
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const LocaleSchema = z.enum(["FR", "EN", "ES"]);
export type LocaleType = z.infer<typeof LocaleSchema>;

export const ArticleStatusSchema = z.enum([
  "DRAFT",
  "READY",
  "PUBLISHED",
  "ARCHIVED",
]);
export type ArticleStatusType = z.infer<typeof ArticleStatusSchema>;

export const LandingSectionStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);
export type LandingSectionStatusType = z.infer<typeof LandingSectionStatusSchema>;

export const LeadStatusSchema = z.enum([
  "CAPTURED",
  "MOCKED",
  "SENT_TO_GHL",
  "FAILED",
  "ARCHIVED",
]);
export type LeadStatusType = z.infer<typeof LeadStatusSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Article ──────────────────────────────────────────────────────────────────

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ArticleCreateSchema = z.object({
  locale: LocaleSchema.default("FR"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .max(200)
    .regex(slugRegex, "Slug invalide (minuscules, chiffres, tirets uniquement)"),
  title: z.string().min(1, "Le titre est requis").max(200),
  excerpt: z.string().max(500).optional().nullable(),
  status: ArticleStatusSchema.default("DRAFT"),
  coverImageId: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const ArticleUpdateSchema = ArticleCreateSchema.partial();

export type ArticleCreateInput = z.infer<typeof ArticleCreateSchema>;
export type ArticleUpdateInput = z.infer<typeof ArticleUpdateSchema>;

// ─── ArticleContent ───────────────────────────────────────────────────────────

export const ArticleContentSchema = z.object({
  editorJson: z.any().optional().nullable(),   // Document ProseMirror/Tiptap
  html: z.string().optional().nullable(),
  plainText: z.string().optional().nullable(),
  wordCount: z.number().int().min(0).default(0),
  readingTime: z.number().int().min(0).default(0),
});

export type ArticleContentInput = z.infer<typeof ArticleContentSchema>;

// ─── ArticleSeo ───────────────────────────────────────────────────────────────

export const ArticleSeoSchema = z.object({
  focusKeyword: z.string().max(100).optional().nullable(),
  seoTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  canonical: z.string().url().optional().nullable().or(z.literal("")),
  ogTitle: z.string().max(90).optional().nullable(),
  ogDescription: z.string().max(200).optional().nullable(),
  ogImageId: z.string().optional().nullable(),
  noindex: z.boolean().default(false),
});

export type ArticleSeoInput = z.infer<typeof ArticleSeoSchema>;

// ─── MediaAsset ───────────────────────────────────────────────────────────────

export const MediaAssetCreateSchema = z.object({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  url: z.string().min(1),
  localPath: z.string().min(1),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  size: z.number().int().positive(),
  altFr: z.string().max(200).optional().nullable(),
  altEn: z.string().max(200).optional().nullable(),
  altEs: z.string().max(200).optional().nullable(),
});

export const MediaAssetUpdateSchema = MediaAssetCreateSchema.partial();

export type MediaAssetCreateInput = z.infer<typeof MediaAssetCreateSchema>;
export type MediaAssetUpdateInput = z.infer<typeof MediaAssetUpdateSchema>;

// ─── LandingSection ───────────────────────────────────────────────────────────

export const LandingSectionCreateSchema = z.object({
  type: z.string().min(1).max(50),
  locale: LocaleSchema.default("FR"),
  status: LandingSectionStatusSchema.default("DRAFT"),
  placement: z.number().int().min(0).default(0),
  title: z.string().max(200).optional().nullable(),
  subtitle: z.string().max(300).optional().nullable(),
  body: z.string().optional().nullable(),
  ctaLabel: z.string().max(100).optional().nullable(),
  ctaHref: z.string().max(500).optional().nullable(),
  imageId: z.string().optional().nullable(),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
});

export const LandingSectionUpdateSchema = LandingSectionCreateSchema.partial();

export type LandingSectionCreateInput = z.infer<typeof LandingSectionCreateSchema>;
export type LandingSectionUpdateInput = z.infer<typeof LandingSectionUpdateSchema>;

// ─── LeadSubmission ───────────────────────────────────────────────────────────

export const LeadSubmissionCreateSchema = z.object({
  firstName: z.string().min(2).max(120),
  contact: z.string().min(3).max(255),
  type: z.string().min(2).max(255),
  context: z.string().max(4000).optional().nullable(),
  locale: LocaleSchema.default("FR"),
  selectedDayLabel: z.string().max(120).optional().nullable(),
  selectedTime: z.string().min(1).max(20),
  selectedAt: z.string().datetime(),
  timezone: z.string().max(120).optional().nullable(),
  pageUrl: z.string().max(1000).optional().nullable(),
  utm: z.record(z.string(), z.string()).default({}),
  tags: z.array(z.string().max(100)).default([]),
  status: LeadStatusSchema.default("CAPTURED"),
  ghlContactId: z.string().optional().nullable(),
  errorMessage: z.string().max(4000).optional().nullable(),
});

export const LeadSubmissionUpdateSchema = LeadSubmissionCreateSchema.partial();

export type LeadSubmissionCreateInput = z.infer<typeof LeadSubmissionCreateSchema>;
export type LeadSubmissionUpdateInput = z.infer<typeof LeadSubmissionUpdateSchema>;

// ─── ArticleMetric ────────────────────────────────────────────────────────────

export const ArticleMetricUpsertSchema = z.object({
  articleId: z.string().min(1),
  date: z.string().date(),         // "YYYY-MM-DD"
  clicks: z.number().int().min(0).default(0),
  impressions: z.number().int().min(0).default(0),
  ctr: z.number().min(0).max(1).default(0),
  position: z.number().min(0).default(0),
  organicSessions: z.number().int().min(0).default(0),
  storyViews: z.number().int().min(0).default(0),
  ctaClicks: z.number().int().min(0).default(0),
  leads: z.number().int().min(0).default(0),
});

export type ArticleMetricUpsertInput = z.infer<typeof ArticleMetricUpsertSchema>;

// ─── Audits Google ────────────────────────────────────────────────────────────

export const ArticlePageSpeedAuditSchema = z.object({
  articleId: z.string().min(1),
  url: z.string().url(),
  strategy: z.string().default("mobile"),
  performanceScore: z.number().int().min(0).max(100),
  seoScore: z.number().int().min(0).max(100),
  accessibilityScore: z.number().int().min(0).max(100),
  lcp: z.string().optional().nullable(),
  cls: z.string().optional().nullable(),
  raw: z.any().optional().nullable(),
});

export type ArticlePageSpeedAuditInput = z.infer<typeof ArticlePageSpeedAuditSchema>;

export const ArticleUrlInspectionSchema = z.object({
  articleId: z.string().min(1),
  url: z.string().url(),
  indexStatus: z.string().optional().nullable(),
  verdict: z.string().optional().nullable(),
  coverageState: z.string().optional().nullable(),
  lastCrawlTime: z.string().datetime().optional().nullable(),
  userCanonical: z.string().optional().nullable(),
  googleCanonical: z.string().optional().nullable(),
  raw: z.any().optional().nullable(),
});

export type ArticleUrlInspectionInput = z.infer<typeof ArticleUrlInspectionSchema>;
