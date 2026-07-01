import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import DynamicLandingPage from "@/app/dynamic-landing-page";
import { prisma } from "@/lib/prisma";
import { growthLandingInclude } from "@/lib/growth/types";
import { buildLandingMetadata, buildLandingJsonLd, resolveTestimonialForLanding } from "@/lib/growth/landing-seo";
import { absoluteUrl } from "@/lib/seo";
import { isLocale } from "@/lib/seo";
import CookieSetterClient from "@/components/admin/growth/CookieSetterClient";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ preview?: string; previewVariant?: string }>;
};

const RESERVED_SLUGS = new Set([
  "biography",
  "biographie",
  "biografia",
  "sessions",
  "seances",
  "sesiones",
  "stories",
  "stages-workshops",
  "luxury-hospitality",
  "hotellerie-luxe",
  "hospitalidad-lujo",
  "llms.txt",
]);

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const { preview, previewVariant } = await searchParams;
  if (!isLocale(lang) || RESERVED_SLUGS.has(slug)) return {};

  const landing = await prisma.landingPage.findUnique({
    where: { locale_slug: { locale: lang.toUpperCase() as "FR" | "EN" | "ES", slug } },
  });

  if (!landing) return {};

  const isPreview = preview === landing.previewToken;
  if (landing.status !== "LIVE" && !isPreview) return { robots: { index: false, follow: false } };

  // Détecter l'expérience A/B active pour le titre / description
  let activeVariant: any = null;
  const runningExperiment = await prisma.experiment.findFirst({
    where: { landingPageId: landing.id, status: "RUNNING" },
    include: { variants: true },
  });

  if (runningExperiment && runningExperiment.variants.length > 0) {
    if (previewVariant) {
      activeVariant = runningExperiment.variants.find((v) => v.id === previewVariant);
    } else {
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get(`exp_${runningExperiment.id}`)?.value;
      if (cookieVal) {
        activeVariant = runningExperiment.variants.find((v) => v.id === cookieVal);
      }
    }
  }

  // Appliquer les surcharges du test A/B sur le titre/meta
  const landingForMetadata = { ...landing };
  if (activeVariant) {
    if (activeVariant.heroTitle) landingForMetadata.heroTitle = activeVariant.heroTitle;
    if (activeVariant.heroSubtitle) landingForMetadata.heroSubtitle = activeVariant.heroSubtitle;
  }

  let alternates: Record<string, string> | undefined;
  if (landingForMetadata.hreflangGroupId) {
    const group = await prisma.landingPage.findMany({
      where: { hreflangGroupId: landingForMetadata.hreflangGroupId, status: "LIVE" },
    });
    alternates = Object.fromEntries(
      group.map((item) => [
        item.locale.toLowerCase(),
        absoluteUrl(`/${item.locale.toLowerCase()}/${item.slug}`),
      ])
    );
    const xDefault = group.find((item) => item.xDefault);
    if (xDefault) {
      alternates["x-default"] = absoluteUrl(`/${xDefault.locale.toLowerCase()}/${xDefault.slug}`);
    }
  }

  const forceNoIndex = landingForMetadata.status !== "LIVE" || isPreview || landingForMetadata.noindex;
  const finalLanding = {
    ...landingForMetadata,
    noindex: forceNoIndex,
  };

  return buildLandingMetadata(finalLanding, alternates);
}

export default async function GrowthLandingRoute({ params, searchParams }: PageProps) {
  const { lang, slug } = await params;
  const { preview, previewVariant } = await searchParams;
  if (!isLocale(lang) || RESERVED_SLUGS.has(slug)) notFound();

  const locale = lang.toUpperCase() as "FR" | "EN" | "ES";
  const landing = await prisma.landingPage.findUnique({
    where: { locale_slug: { locale, slug } },
    include: growthLandingInclude,
  });

  if (!landing) notFound();

  const isPreview = preview === landing.previewToken;
  if (landing.status !== "LIVE" && !isPreview) notFound();

  // 1. Détecter s'il y a un test A/B en cours
  let activeVariant: any = null;
  const runningExperiment = await prisma.experiment.findFirst({
    where: { landingPageId: landing.id, status: "RUNNING" },
    include: { variants: true },
  });

  let shouldSetCookie = false;
  if (runningExperiment && runningExperiment.variants.length > 0) {
    if (previewVariant) {
      activeVariant = runningExperiment.variants.find((v) => v.id === previewVariant);
    } else {
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get(`exp_${runningExperiment.id}`)?.value;
      if (cookieVal) {
        activeVariant = runningExperiment.variants.find((v) => v.id === cookieVal);
      }

      if (!activeVariant) {
        const totalSplit = runningExperiment.variants.reduce((sum, v) => sum + v.trafficSplit, 0);
        const rand = Math.random() * (totalSplit || 100);
        let cumulative = 0;
        for (const v of runningExperiment.variants) {
          cumulative += v.trafficSplit;
          if (rand <= cumulative) {
            activeVariant = v;
            break;
          }
        }
        if (!activeVariant) activeVariant = runningExperiment.variants[0];
        shouldSetCookie = true;
      }
    }
  }

  // 2. Résoudre le témoignage avec fallback automatique
  const testimonial = await resolveTestimonialForLanding(landing);
  if (testimonial) {
    landing.content = {
      ...(landing.content as any || {}),
      testimonial: {
        posterSrc: testimonial.posterImage?.url ?? testimonial.mediaAsset?.url ?? "/practice-01.webp",
        videoSrc: testimonial.mediaAsset?.url ?? testimonial.mediaAsset?.externalUrl ?? "",
        cta: testimonial.quoteShort ?? "Écrire sur WhatsApp",
        testimonialId: testimonial.id,
      },
    };
  }

  // 3. Appliquer les surcharges de la variante A/B
  if (activeVariant) {
    if (activeVariant.heroTitle) landing.heroTitle = activeVariant.heroTitle;
    if (activeVariant.heroSubtitle) landing.heroSubtitle = activeVariant.heroSubtitle;
    if (activeVariant.primaryCta) landing.primaryCta = activeVariant.primaryCta;

    if (activeVariant.testimonialId) {
      const overrideTestimonial = await prisma.testimonial.findUnique({
        where: { id: activeVariant.testimonialId },
        include: { mediaAsset: true, posterImage: true },
      });
      if (overrideTestimonial) {
        landing.content = {
          ...(landing.content as any || {}),
          testimonial: {
            posterSrc: overrideTestimonial.posterImage?.url ?? overrideTestimonial.mediaAsset?.url ?? "/practice-01.webp",
            videoSrc: overrideTestimonial.mediaAsset?.url ?? overrideTestimonial.mediaAsset?.externalUrl ?? "",
            cta: overrideTestimonial.quoteShort ?? "Écrire sur WhatsApp",
            testimonialId: overrideTestimonial.id,
          },
        };
      }
    }

    if (activeVariant.contentOverrides && typeof activeVariant.contentOverrides === "object") {
      landing.content = {
        ...(landing.content as any || {}),
        ...(activeVariant.contentOverrides as Record<string, any>),
      };
    }
  }

  const jsonLd = buildLandingJsonLd(landing);

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: jsonLd }} />
      
      {/* Écriture du cookie de variante A/B */}
      {shouldSetCookie && activeVariant && runningExperiment && (
        <CookieSetterClient name={`exp_${runningExperiment.id}`} value={activeVariant.id} />
      )}

      {/* Bannière de débogage A/B en Preview */}
      {activeVariant && isPreview && (
        <div
          role="status"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            color: "white",
            fontSize: "12px",
            textAlign: "center",
            padding: "8px",
            fontWeight: "bold",
            position: "sticky",
            top: 0,
            zIndex: 9999,
          }}
        >
          🧪 Variante A/B active : <strong>{activeVariant.name}</strong> ({activeVariant.trafficSplit}% split)
        </div>
      )}

      <DynamicLandingPage landing={landing} isPreview={isPreview} variantId={activeVariant?.id} />
    </>
  );
}
