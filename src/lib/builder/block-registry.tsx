"use client";

import {
  DifferenceSection,
  FAQSection,
  FinalCtaSection,
  HeroSection,
  LeadFormSection,
  OfferSection,
  PainChipsSection,
  ProcessSection,
  ProofBadgesSection,
  TestimonialSection,
} from "@/components/landing/blocks";
import type { TmsLandingComponents } from "@/lib/builder/puck-data-schema";
import type { ComponentType } from "react";

export const puckComponentRegistry = {
  HeroSection,
  PainChipsSection,
  ProofBadgesSection,
  OfferSection,
  DifferenceSection,
  TestimonialSection,
  ProcessSection,
  LeadFormSection,
  FAQSection,
  FinalCtaSection,
} satisfies {
  [K in keyof TmsLandingComponents]: ComponentType<TmsLandingComponents[K]>;
};

type PuckCategory = {
  title: string;
  defaultExpanded?: boolean;
  components: Array<keyof TmsLandingComponents>;
};

export const puckCategories: Record<string, PuckCategory> = {
  conversion: {
    title: "Conversion",
    defaultExpanded: true,
    components: ["HeroSection", "LeadFormSection", "FinalCtaSection"],
  },
  proof: {
    title: "Preuve",
    defaultExpanded: true,
    components: ["ProofBadgesSection", "TestimonialSection"],
  },
  offer: {
    title: "Offre",
    components: ["OfferSection"],
  },
  method: {
    title: "Méthode",
    components: ["PainChipsSection", "DifferenceSection", "ProcessSection"],
  },
  faq: {
    title: "FAQ",
    components: ["FAQSection"],
  },
};
