import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DynamicLandingPage from "@/app/dynamic-landing-page";
import { prisma } from "@/lib/prisma";
import { growthLandingInclude } from "@/lib/growth/types";
import { buildLandingMetadata, buildLandingJsonLd } from "@/lib/growth/landing-seo";
import { absoluteUrl } from "@/lib/seo";
import { isLocale } from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
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
  if (!isLocale(lang) || RESERVED_SLUGS.has(slug)) return {};

  const landing = await prisma.landingPage.findUnique({
    where: { locale_slug: { locale: lang.toUpperCase() as "FR" | "EN" | "ES", slug } },
  });

  if (!landing) return {};

  const { preview } = await searchParams;
  if (landing.status !== "LIVE" && preview !== landing.previewToken) return { robots: { index: false } };

  let alternates: Record<string, string> | undefined;
  if (landing.hreflangGroupId) {
    const group = await prisma.landingPage.findMany({
      where: { hreflangGroupId: landing.hreflangGroupId, status: "LIVE" },
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

  return buildLandingMetadata(landing, alternates);
}

export default async function GrowthLandingRoute({ params, searchParams }: PageProps) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || RESERVED_SLUGS.has(slug)) notFound();

  const locale = lang.toUpperCase() as "FR" | "EN" | "ES";
  const landing = await prisma.landingPage.findUnique({
    where: { locale_slug: { locale, slug } },
    include: growthLandingInclude,
  });

  if (!landing) notFound();

  const { preview } = await searchParams;
  const isPreview = preview === landing.previewToken;

  if (landing.status !== "LIVE" && !isPreview) notFound();

  const jsonLd = buildLandingJsonLd(landing);

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <DynamicLandingPage landing={landing} isPreview={isPreview} />
    </>
  );
}
