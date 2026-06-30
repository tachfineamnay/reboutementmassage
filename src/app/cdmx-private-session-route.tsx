import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CdmxPrivateSessionPage from "@/app/cdmx-private-session-page";
import {
  getCdmxCampaignAlternates,
  getCdmxPrivateSessionCampaign,
  type CampaignLandingConfig,
} from "@/data/campaign-landings";
import { absoluteUrl, renderJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string }>;
};

type CampaignLocale = "fr" | "en" | "es";

function absoluteAlternates() {
  const alternates = getCdmxCampaignAlternates();

  return Object.fromEntries(
    Object.entries(alternates).map(([locale, route]) => [locale, absoluteUrl(route)])
  );
}

export async function generateCdmxPrivateSessionMetadata(
  { params }: PageProps,
  expectedLocale: CampaignLocale
): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== expectedLocale) return {};

  const config = getCdmxPrivateSessionCampaign(expectedLocale);
  if (!config) return {};

  const canonical = absoluteUrl(config.route);
  const imageUrl = absoluteUrl("/og-image.png");

  return {
    metadataBase: new URL(absoluteUrl()),
    title: config.meta.title,
    description: config.meta.description,
    alternates: {
      canonical,
      languages: absoluteAlternates(),
    },
    openGraph: {
      type: "website",
      locale: config.htmlLang,
      url: canonical,
      siteName: "Méthode TMS®",
      title: config.meta.title,
      description: config.meta.description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: config.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.meta.title,
      description: config.meta.description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

function structuredData(config: CampaignLandingConfig) {
  const canonical = absoluteUrl(config.route);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: config.meta.title,
        description: config.meta.description,
        inLanguage: config.htmlLang,
      },
      {
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: config.meta.title,
        description: config.meta.description,
        url: canonical,
        areaServed: "Ciudad de México",
        provider: {
          "@type": "Person",
          name: "Grégory Tordjman",
        },
        serviceType: ["Méthode TMS®", "Private manual therapy", "French Body Reset"],
      },
    ],
  };
}

export async function renderCdmxPrivateSessionRoute(
  { params }: PageProps,
  expectedLocale: CampaignLocale
) {
  const { lang } = await params;
  if (lang !== expectedLocale) notFound();

  const config = getCdmxPrivateSessionCampaign(expectedLocale);
  if (!config) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderJsonLd(structuredData(config)) }}
      />
      <CdmxPrivateSessionPage config={config} />
    </>
  );
}
