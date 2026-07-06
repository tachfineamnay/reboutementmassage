import { z } from "zod";

export const LandingBuilderSchema = z.object({
  market: z.object({
    destinationId: z.string().min(1),
    locale: z.enum(["FR", "EN", "ES"]),
    slug: z.string().min(1),
  }),
  offer: z.object({
    offerId: z.string().nullable(),
    whatsappChannelId: z.string().nullable(),
  }),
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().default(""),
    primaryCta: z.string().default("WhatsApp"),
    secondaryCta: z.string().default("Réserver"),
    heroImageId: z.string().nullable(),
    imageAlt: z.string().default(""),
  }),
  proof: z.object({
    badges: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    testimonialIds: z.array(z.string()).default([]),
  }),
  conversion: z.object({
    leadSegment: z.string().default("b2c_premium"),
    formHeadline: z.string().default("Demande rapide"),
    urgencyOptions: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  }),
  seo: z.object({
    seoTitle: z.string().default(""),
    metaDescription: z.string().default(""),
    noindex: z.boolean().default(true),
  }),
});

export type LandingBuilderInput = z.infer<typeof LandingBuilderSchema>;
