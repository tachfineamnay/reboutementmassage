import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "../landing-page";
import {
  absoluteUrl,
  createIdentityJsonLd,
  createProfessionalServiceJsonLd,
  createWebPageJsonLd,
  graphJsonLd,
  isLocale,
  localizedPath,
  LOCALE_TO_LANGUAGE,
  LOCALES,
  META_BY_LOCALE,
  renderJsonLd,
  routeAlternates,
  type Locale,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const meta = META_BY_LOCALE[lang];
  const canonicalPath = localizedPath("home", lang);
  const imageUrl = absoluteUrl("/og-image.png");

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      languages: routeAlternates("home"),
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: absoluteUrl(canonicalPath),
      siteName: "Méthode TMS®",
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Grégory Tordjman - Méthode TMS®",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function structuredData(locale: Locale) {
  const meta = META_BY_LOCALE[locale];
  return graphJsonLd([
    createIdentityJsonLd(locale),
    createWebPageJsonLd({
      locale,
      routeKey: "home",
      title: meta.title,
      description: meta.description,
      aboutId: `${absoluteUrl()}#gregory-tordjman`,
    }),
    createProfessionalServiceJsonLd({
      locale,
      routeKey: "home",
      name: "Méthode TMS® - private manual therapy",
      description: meta.description,
      serviceType: [
        "Private manual therapy",
        "Reboutement",
        "Personalised hands-on body support",
        "On-site support for hotels, villas and yachts",
      ],
    }),
  ]);
}

export default async function LocalizedPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderJsonLd(structuredData(lang)) }}
      />
      <LandingPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
