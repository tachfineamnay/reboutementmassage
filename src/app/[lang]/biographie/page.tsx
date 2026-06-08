import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BiographyPage from "../../biography-page";
import {
  absoluteUrl,
  createIdentityJsonLd,
  createWebPageJsonLd,
  graphJsonLd,
  isLocale,
  localizedPath,
  LOCALE_TO_LANGUAGE,
  renderJsonLd,
  routeAlternates,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string }>;
};

const BIO_META: Record<string, { title: string; description: string; slug: string }> = {
  fr: {
    title: "Biographie — Grégory Tordjman | Créateur de la Méthode TMS®",
    description:
      "Découvrez le parcours de Grégory Tordjman, praticien manuel depuis 2006 et créateur de la Méthode TMS®, une approche de terrain fondée sur l'observation, le geste adapté et les limites professionnelles.",
    slug: "biographie",
  },
  en: {
    title: "Biography — Grégory Tordjman | Creator of the Méthode TMS®",
    description:
      "Discover Grégory Tordjman's journey as a hands-on practitioner since 2006 and creator of the Méthode TMS®, a field-based approach centred on observation, adapted gesture and professional boundaries.",
    slug: "biography",
  },
  es: {
    title: "Biografía — Grégory Tordjman | Creador del Método TMS®",
    description:
      "Descubra el recorrido de Grégory Tordjman, practicante manual desde 2006 y creador del Método TMS®, un enfoque de campo basado en observación, gesto adaptado y límites profesionales.",
    slug: "biografia",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const meta = BIO_META[lang] ?? BIO_META.fr;
  const imageUrl = absoluteUrl("/og-image.png");
  const canonicalUrl = absoluteUrl(localizedPath("biography", lang));

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: routeAlternates("biography"),
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: canonicalUrl,
      siteName: "Méthode TMS®",
      title: meta.title,
      description: meta.description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "Grégory Tordjman — Méthode TMS®" }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

function structuredData(lang: string) {
  const locale = isLocale(lang) ? lang : "fr";
  const meta = BIO_META[locale] ?? BIO_META.fr;
  return graphJsonLd([
    createIdentityJsonLd(locale),
    createWebPageJsonLd({
      locale,
      routeKey: "biography",
      title: meta.title,
      description: meta.description,
      aboutId: `${absoluteUrl()}#gregory-tordjman`,
    }),
  ]);
}

export default async function BiographyRoute({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderJsonLd(structuredData(lang)) }}
      />
      <BiographyPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
