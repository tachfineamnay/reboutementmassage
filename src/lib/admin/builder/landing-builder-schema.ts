import { z } from "zod";

export const LandingBuilderTemplateSchema = z.enum([
  "MOBILE_WHATSAPP_FIRST",
  "PREMIUM_PRIVATE_SESSION",
  "B2B_HOSPITALITY",
  "FORMATION_LEADGEN",
  "SEO_LOCAL_SERVICE",
  "EVENT_WORKSHOP",
]);

const OptionalStringSchema = z
  .preprocess((value) => (value == null ? "" : value), z.string().trim())
  .transform((value) => value || null);
const TextareaListSchema = z.array(z.string().trim().min(1)).default([]);
const BuilderOptionSchema = z.object({
  value: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

export const LandingBuilderSchema = z.object({
  market: z.object({
    destinationId: z.string().trim().min(1),
    locale: z.enum(["FR", "EN", "ES"]),
    slug: z.string().trim().min(1),
    template: LandingBuilderTemplateSchema.default("MOBILE_WHATSAPP_FIRST"),
  }),
  offer: z.object({
    offerId: OptionalStringSchema,
    whatsappChannelId: OptionalStringSchema,
    trackingProfileId: OptionalStringSchema,
    crmRoutingRuleId: OptionalStringSchema,
  }),
  hero: z.object({
    heroTitle: z.string().trim().min(1),
    heroSubtitle: z.string().trim().default(""),
    microNote: z.string().trim().default(""),
    primaryCta: z.string().trim().min(1).default("WhatsApp"),
    secondaryCta: z.string().trim().default("Réserver"),
    heroImageId: OptionalStringSchema,
    imageAlt: z.string().trim().default(""),
  }),
  proof: z.object({
    badges: z.array(BuilderOptionSchema).default([]),
    painChips: TextareaListSchema,
    processSteps: TextareaListSchema,
    testimonialIds: TextareaListSchema,
  }),
  conversion: z.object({
    leadSegment: z.string().trim().default("b2c_premium"),
    formHeadline: z.string().trim().default("Demande rapide"),
    urgencyOptions: z.array(BuilderOptionSchema).default([]),
    complianceText: OptionalStringSchema,
  }),
  seo: z.object({
    seoTitle: z.string().trim().default(""),
    metaDescription: z.string().trim().default(""),
    canonical: OptionalStringSchema,
    noindex: z.boolean().default(true),
    xDefault: z.boolean().default(false),
    hreflangGroupId: OptionalStringSchema,
  }),
});

export type LandingBuilderInput = z.infer<typeof LandingBuilderSchema>;
export type LandingBuilderTemplate = z.infer<typeof LandingBuilderTemplateSchema>;
