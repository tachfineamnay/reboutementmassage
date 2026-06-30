import type { Metadata } from "next";
import type { LandingPage } from "@prisma/client";
import { absoluteUrl, renderJsonLd } from "@/lib/seo";
import { localeToLang } from "@/lib/growth/types";

export function landingCanonical(landing: LandingPage): string {
  if (landing.canonical) return landing.canonical;
  const lang = localeToLang(landing.locale);
  return absoluteUrl(`/${lang}/${landing.slug}`);
}

export function buildLandingMetadata(
  landing: LandingPage,
  alternates?: Record<string, string>
): Metadata {
  const canonical = landingCanonical(landing);
  const imageUrl = absoluteUrl("/og-image.png");

  return {
    title: landing.seoTitle ?? landing.heroTitle,
    description: landing.metaDescription ?? landing.heroSubtitle ?? undefined,
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      locale: localeToLang(landing.locale),
      url: canonical,
      siteName: "Méthode TMS®",
      title: landing.seoTitle ?? landing.heroTitle,
      description: landing.metaDescription ?? undefined,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: landing.seoTitle ?? landing.heroTitle,
      description: landing.metaDescription ?? undefined,
      images: [imageUrl],
    },
    robots: landing.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function buildLandingJsonLd(landing: LandingPage) {
  const canonical = landingCanonical(landing);
  const faq = Array.isArray(landing.faq) ? landing.faq : [];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
      name: landing.seoTitle ?? landing.heroTitle,
      description: landing.metaDescription,
      inLanguage: localeToLang(landing.locale),
    },
    {
      "@type": "Service",
      "@id": `${canonical}#service`,
      name: landing.seoTitle ?? landing.heroTitle,
      description: landing.metaDescription,
      url: canonical,
      areaServed: landing.areaServed ?? undefined,
      provider: { "@type": "Person", name: "Grégory Tordjman" },
      serviceType: ["Méthode TMS®", "French Body Reset"],
    },
  ];

  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq
        .filter((item): item is { question: string; answer: string } =>
          typeof item === "object" && item !== null && "question" in item
        )
        .map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    });
  }

  return renderJsonLd({ "@context": "https://schema.org", "@graph": graph });
}
