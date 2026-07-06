import type { Data } from "@puckeditor/core";
import { z } from "zod";

export const PUCK_EDITOR = "puck" as const;
export const PUCK_BUILDER_VERSION = 1 as const;

export const PUCK_BLOCK_TYPES = [
  "HeroSection",
  "PainChipsSection",
  "ProofBadgesSection",
  "OfferSection",
  "DifferenceSection",
  "TestimonialSection",
  "ProcessSection",
  "LeadFormSection",
  "FAQSection",
  "FinalCtaSection",
] as const;

const idSchema = z.string().min(1);
const optionalText = z.string().trim().optional().default("");
const text = z.string().trim();
const stringList = z.array(z.string().trim().min(1)).default([]);
const whatsappIntentSchema = z
  .enum(["default", "book_intent", "more_info_intent", "testimonial_cta", "sticky_cta"])
  .default("book_intent");

export const puckRootPropsSchema = z
  .object({
    pageStyle: z.enum(["premium-reset", "wellness-editorial", "clinical-clean"]).default("premium-reset"),
    density: z.enum(["conversion", "editorial", "premium"]).default("conversion"),
    locale: z.enum(["FR", "EN", "ES"]).default("FR"),
  })
  .strict();

export const badgeSchema = z
  .object({
    value: text.min(1),
    label: text.min(1),
  })
  .strict();

export const faqItemSchema = z
  .object({
    question: text.min(1),
    answer: text.min(1),
  })
  .strict();

export const offerCardSchema = z
  .object({
    title: text.min(1),
    subtitle: optionalText,
    description: optionalText,
    includes: stringList,
    ctaLabel: text.min(1).default("WhatsApp"),
    whatsappIntent: whatsappIntentSchema,
  })
  .strict();

export const leadOptionSchema = z
  .object({
    value: text.min(1),
    label: text.min(1),
  })
  .strict();

export const heroSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["immersive", "split", "compact"]).default("immersive"),
    eyebrow: optionalText,
    title: text.min(1),
    subtitle: optionalText,
    body: optionalText,
    microNote: optionalText,
    primaryCta: text.min(1).default("WhatsApp"),
    secondaryCta: optionalText,
    secondaryHref: optionalText,
    proofLine: optionalText,
    imageSrc: optionalText,
    imageAlt: optionalText,
  })
  .strict();

export const painChipsSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["chips", "checklist"]).default("chips"),
    title: text.min(1),
    body: optionalText,
    items: stringList,
  })
  .strict();

export const proofBadgesSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["stat-grid", "compact"]).default("stat-grid"),
    badges: z.array(badgeSchema).default([]),
  })
  .strict();

export const offerSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["cards", "single"]).default("cards"),
    title: text.min(1),
    bullets: stringList,
    launchRateLine: optionalText,
    showPrice: z.boolean().default(false),
    priceLabel: optionalText,
    priceValue: optionalText,
    ctaLabel: text.min(1).default("WhatsApp"),
    whatsappIntent: whatsappIntentSchema,
    cards: z.array(offerCardSchema).default([]),
  })
  .strict();

export const differenceSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["image-copy", "copy-first"]).default("image-copy"),
    title: text.min(1),
    body: optionalText,
    points: stringList,
    imageSrc: optionalText,
    imageAlt: optionalText,
  })
  .strict();

export const testimonialSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["video", "quote"]).default("video"),
    quote: optionalText,
    attribution: optionalText,
    posterSrc: optionalText,
    videoSrc: optionalText,
    cta: optionalText,
  })
  .strict();

export const processSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["numbered", "compact"]).default("numbered"),
    eyebrow: optionalText,
    title: text.min(1),
    steps: stringList,
  })
  .strict();

export const leadFormSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["short", "extended"]).default("short"),
    label: optionalText,
    headline: text.min(1),
    sub: optionalText,
    tensionLabel: optionalText,
    tensionPlaceholder: optionalText,
    whatsappLabel: optionalText,
    whatsappPlaceholder: optionalText,
    submit: optionalText,
    needOptions: z.array(leadOptionSchema).default([]),
    complianceText: optionalText,
  })
  .strict();

export const faqSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["accordion", "compact"]).default("accordion"),
    eyebrow: optionalText,
    title: text.min(1),
    items: z.array(faqItemSchema).default([]),
  })
  .strict();

export const finalCtaSectionPropsSchema = z
  .object({
    id: idSchema,
    variant: z.enum(["centered", "banner"]).default("centered"),
    title: text.min(1),
    body: optionalText,
    primary: text.min(1).default("WhatsApp"),
    secondary: optionalText,
  })
  .strict();

const contentItemBaseSchema = z
  .object({
    readOnly: z.record(z.string(), z.boolean()).optional(),
  })
  .strict();

export const puckContentItemSchema = z.discriminatedUnion("type", [
  contentItemBaseSchema.extend({ type: z.literal("HeroSection"), props: heroSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("PainChipsSection"), props: painChipsSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("ProofBadgesSection"), props: proofBadgesSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("OfferSection"), props: offerSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("DifferenceSection"), props: differenceSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("TestimonialSection"), props: testimonialSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("ProcessSection"), props: processSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("LeadFormSection"), props: leadFormSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("FAQSection"), props: faqSectionPropsSchema }),
  contentItemBaseSchema.extend({ type: z.literal("FinalCtaSection"), props: finalCtaSectionPropsSchema }),
]);

export const puckDataSchema = z
  .object({
    root: z
      .object({
        props: puckRootPropsSchema,
      })
      .strict(),
    content: z.array(puckContentItemSchema).default([]),
  })
  .strict();

export const puckLandingContentSchema = z
  .object({
    editor: z.literal(PUCK_EDITOR),
    builderVersion: z.literal(PUCK_BUILDER_VERSION),
    puckData: puckDataSchema,
  })
  .passthrough();

export type TmsPuckRootProps = z.infer<typeof puckRootPropsSchema>;
export type BadgeItem = z.infer<typeof badgeSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type OfferCardItem = z.infer<typeof offerCardSchema>;
export type LeadOptionItem = z.infer<typeof leadOptionSchema>;
export type HeroSectionProps = z.infer<typeof heroSectionPropsSchema>;
export type PainChipsSectionProps = z.infer<typeof painChipsSectionPropsSchema>;
export type ProofBadgesSectionProps = z.infer<typeof proofBadgesSectionPropsSchema>;
export type OfferSectionProps = z.infer<typeof offerSectionPropsSchema>;
export type DifferenceSectionProps = z.infer<typeof differenceSectionPropsSchema>;
export type TestimonialSectionProps = z.infer<typeof testimonialSectionPropsSchema>;
export type ProcessSectionProps = z.infer<typeof processSectionPropsSchema>;
export type LeadFormSectionProps = z.infer<typeof leadFormSectionPropsSchema>;
export type FAQSectionProps = z.infer<typeof faqSectionPropsSchema>;
export type FinalCtaSectionProps = z.infer<typeof finalCtaSectionPropsSchema>;

export type TmsLandingComponents = {
  HeroSection: HeroSectionProps;
  PainChipsSection: PainChipsSectionProps;
  ProofBadgesSection: ProofBadgesSectionProps;
  OfferSection: OfferSectionProps;
  DifferenceSection: DifferenceSectionProps;
  TestimonialSection: TestimonialSectionProps;
  ProcessSection: ProcessSectionProps;
  LeadFormSection: LeadFormSectionProps;
  FAQSection: FAQSectionProps;
  FinalCtaSection: FinalCtaSectionProps;
};

export type TmsPuckData = Data<TmsLandingComponents, TmsPuckRootProps>;
export type TmsPuckContent = z.infer<typeof puckLandingContentSchema>;

export function parsePuckData(value: unknown): TmsPuckData {
  return puckDataSchema.parse(value) as TmsPuckData;
}

export function safeParsePuckData(value: unknown) {
  return puckDataSchema.safeParse(value);
}

export function parsePuckLandingContent(value: unknown): TmsPuckContent {
  return puckLandingContentSchema.parse(value);
}

export function safeParsePuckLandingContent(value: unknown) {
  return puckLandingContentSchema.safeParse(value);
}
