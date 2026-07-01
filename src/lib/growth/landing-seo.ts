import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { absoluteUrl, renderJsonLd } from "@/lib/seo";
import { localeToLang } from "@/lib/growth/types";

export function landingCanonical(landing: any): string {
  if (landing.canonical) return landing.canonical;
  const lang = localeToLang(landing.locale);
  return absoluteUrl(`/${lang}/${landing.slug}`);
}

export function buildLandingMetadata(
  landing: any,
  alternates?: Record<string, string>
): Metadata {
  const canonical = landingCanonical(landing);
  const imageUrl = landing.ogImage?.url ? absoluteUrl(landing.ogImage.url) : absoluteUrl("/og-image.png");

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

export function buildLandingJsonLd(landing: any) {
  const canonical = landingCanonical(landing);
  const faq = Array.isArray(landing.faq) ? landing.faq : [];

  // Assurer qu'aucune promesse médicale n'est formulée dans la description
  const cleanDescription = (landing.metaDescription ?? landing.heroSubtitle ?? "")
    .replace(/(guérir|soigner|traiter|cure|miracle|maladie|pathologie)/gi, "accompagner")
    .slice(0, 300);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
      name: landing.seoTitle ?? landing.heroTitle,
      description: cleanDescription || undefined,
      inLanguage: localeToLang(landing.locale),
    },
    {
      "@type": "Service",
      "@id": `${canonical}#service`,
      name: landing.seoTitle ?? landing.heroTitle,
      description: cleanDescription || undefined,
      url: canonical,
      areaServed: landing.areaServed
        ? {
            "@type": "AdministrativeArea",
            name: landing.areaServed,
          }
        : undefined,
      provider: {
        "@type": "Person",
        name: "Grégory Tordjman",
        jobTitle: "Créateur de la Méthode TMS®",
      },
      serviceType: ["Accompagnement corporel", "Méthode TMS®", "French Body Reset"],
      ...(landing.offer && landing.offer.showPrice && landing.offer.priceAmount
        ? {
            offers: {
              "@type": "Offer",
              price: String(landing.offer.priceAmount),
              priceCurrency: landing.offer.currency || "EUR",
              availability: "https://schema.org/InStock",
              url: canonical,
            },
          }
        : {}),
    },
  ];

  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq
        .filter((item: any): item is { question: string; answer: string } =>
          typeof item === "object" && item !== null && "question" in item
        )
        .map((item: any) => ({
          "@type": "Question",
          name: String(item.question),
          acceptedAnswer: {
            "@type": "Answer",
            text: String(item.answer),
          },
        })),
    });
  }

  return renderJsonLd({ "@context": "https://schema.org", "@graph": graph });
}

export async function resolveTestimonialForLanding(landing: any): Promise<any> {
  let testimonial: any = null;

  let selectedIds: string[] = [];
  try {
    if (Array.isArray(landing.testimonialIds)) {
      selectedIds = landing.testimonialIds;
    } else if (typeof landing.testimonialIds === "string") {
      selectedIds = JSON.parse(landing.testimonialIds);
    }
  } catch {}

  if (selectedIds.length > 0) {
    testimonial = await prisma.testimonial.findFirst({
      where: {
        id: { in: selectedIds },
        status: "LIVE",
        consentWebsite: true,
      },
      include: {
        mediaAsset: true,
        posterImage: true,
      },
    });
  }

  if (!testimonial) {
    testimonial = await prisma.testimonial.findFirst({
      where: {
        destinationId: landing.destinationId,
        locale: landing.locale,
        status: "LIVE",
        consentWebsite: true,
      },
      include: {
        mediaAsset: true,
        posterImage: true,
      },
      orderBy: [
        { priority: "desc" },
        { emotionalScore: "desc" },
        { credibilityScore: "desc" },
      ],
    });
  }

  return testimonial;
}
