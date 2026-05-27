import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "../landing-page";
import {
  absoluteUrl,
  isLocale,
  languageAlternates,
  LOCALE_TO_LANGUAGE,
  LOCALES,
  localePath,
  META_BY_LOCALE,
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
  const canonicalPath = localePath(lang);
  const imageUrl = absoluteUrl("/og-image.png");

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      languages: languageAlternates(),
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
  const pageUrl = absoluteUrl(localePath(locale));
  const logoUrl = absoluteUrl("/logo.png");
  const imageUrl = absoluteUrl("/portrait.webp");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl()}#website`,
        name: "Méthode TMS®",
        url: absoluteUrl(),
        inLanguage: locale,
      },
      {
        "@type": "Organization",
        "@id": `${absoluteUrl()}#organization`,
        name: "Méthode TMS®",
        url: absoluteUrl(),
        logo: logoUrl,
      },
      {
        "@type": "Person",
        "@id": `${absoluteUrl()}#gregory-tordjman`,
        name: "Grégory Tordjman",
        url: pageUrl,
        image: imageUrl,
        jobTitle: "Praticien en thérapie manuelle",
        brand: {
          "@id": `${absoluteUrl()}#organization`,
        },
        knowsAbout: [
          "Méthode TMS®",
          "Thérapie manuelle",
          "Reboutement",
          "Massage thérapeutique",
          "Hospitality de luxe",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${pageUrl}#service`,
        name: "Méthode TMS® - demande privée",
        url: pageUrl,
        image: imageUrl,
        provider: {
          "@id": `${absoluteUrl()}#gregory-tordjman`,
        },
        areaServed: "International",
        serviceType: [
          "Thérapie manuelle",
          "Reboutement",
          "Massage thérapeutique",
          "Intervention privée en hôtel, villa et yacht",
        ],
      },
    ],
  };
}

export default async function LocalizedPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(lang)) }}
      />
      <LandingPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
