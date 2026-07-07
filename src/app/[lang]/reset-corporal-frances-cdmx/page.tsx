import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import { CDMX_PRIVATE_SESSION_CAMPAIGNS } from "@/data/campaign-landings";
import ResetCorporalPage from "@/app/reset-corporal-frances-page";

type PageProps = {
  params: Promise<{ lang: string }>;
};

// Only expose the ES route at this slug; other locales get notFound
const ALLOWED_LANG = "es";
const config = CDMX_PRIVATE_SESSION_CAMPAIGNS.es;
const CANONICAL = "/es/reset-corporal-frances-cdmx";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== ALLOWED_LANG) return { robots: { index: false, follow: false } };

  return {
    metadataBase: new URL(absoluteUrl()),
    title: config.meta.title,
    description: config.meta.description,
    alternates: {
      canonical: absoluteUrl(CANONICAL),
      languages: {
        es: absoluteUrl(CANONICAL),
        "x-default": absoluteUrl(CANONICAL),
      },
    },
    openGraph: {
      type: "website",
      locale: "es_MX",
      url: absoluteUrl(CANONICAL),
      title: config.meta.title,
      description: config.meta.description,
      images: [
        {
          url: absoluteUrl("/og-image.png"),
          width: 1200,
          height: 630,
          alt: "French Body Reset en CDMX — Grégory Tordjman",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.meta.title,
      description: config.meta.description,
      images: [absoluteUrl("/og-image.png")],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "French Body Reset en CDMX",
  description: config.meta.description,
  url: absoluteUrl(CANONICAL),
  provider: {
    "@type": "Person",
    name: "Grégory Tordjman",
    url: absoluteUrl("/es"),
  },
  areaServed: {
    "@type": "City",
    name: "Ciudad de México",
    addressCountry: "MX",
  },
  serviceType: "Manual therapy session",
  offers: [
    {
      "@type": "Offer",
      name: "Body Reset Fix",
      description: "Sesión puntual para una tensión prioritaria: espalda, cuello, hombros o lumbar.",
    },
    {
      "@type": "Offer",
      name: "Body Reset Full",
      description: "Sesión completa de reset corporal: espalda, cuello, pelvis, respiración y sistema nervioso.",
    },
  ],
});

export default async function ResetCorporalRoute({ params }: PageProps) {
  const { lang } = await params;
  if (lang !== ALLOWED_LANG) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ResetCorporalPage />
    </>
  );
}
