import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BiographyPage from "../../biography-page";
import { absoluteUrl, isLocale, LOCALE_TO_LANGUAGE } from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string }>;
};

const BIO_META: Record<string, { title: string; description: string; slug: string }> = {
  fr: {
    title: "Biographie — Grégory Tordjman | Créateur de la Méthode TMS®",
    description:
      "Découvrez le parcours de Grégory Tordjman, créateur de la Méthode TMS®, praticien en thérapie manuelle de précision pour clients privés, hôtels, villas, yachts et conciergeries.",
    slug: "biographie",
  },
  en: {
    title: "Biography — Grégory Tordjman | Creator of the Méthode TMS®",
    description:
      "Discover the journey of Grégory Tordjman, creator of the Méthode TMS®, international precision manual therapy practitioner for private clients, hotels, villas, yachts and concierges.",
    slug: "biography",
  },
  es: {
    title: "Biografía — Grégory Tordjman | Creador del Método TMS®",
    description:
      "Descubra el recorrido de Grégory Tordjman, creador del Método TMS®, terapeuta manual de precisión para clientes privados, hoteles, villas, yates y concierges.",
    slug: "biografia",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const meta = BIO_META[lang] ?? BIO_META.fr;
  const imageUrl = absoluteUrl("/og-image.png");
  const canonicalUrl = absoluteUrl(`/${lang}/${meta.slug}`);

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "x-default": absoluteUrl("/fr/biographie"),
        fr: absoluteUrl("/fr/biographie"),
        en: absoluteUrl("/en/biography"),
        es: absoluteUrl("/es/biografia"),
      },
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
  const meta = BIO_META[lang] ?? BIO_META.fr;
  const pageUrl = absoluteUrl(`/${lang}/${meta.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${absoluteUrl()}#gregory-tordjman`,
        name: "Grégory Tordjman",
        url: pageUrl,
        image: absoluteUrl("/portrait.webp"),
        jobTitle: "Praticien en thérapie manuelle · Créateur de la Méthode TMS®",
        description: meta.description,
        brand: {
          "@type": "Brand",
          name: "Méthode TMS®",
        },
        knowsAbout: [
          "Méthode TMS®",
          "Thérapie manuelle",
          "Reboutement",
          "Massage thérapeutique",
          "Fasciathérapie",
          "Hospitality de luxe",
        ],
        hasOccupation: {
          "@type": "Occupation",
          name: "Thérapeute manuel",
        },
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: meta.title,
        description: meta.description,
        inLanguage: lang,
        about: {
          "@id": `${absoluteUrl()}#gregory-tordjman`,
        },
      },
    ],
  };
}

export default async function BiographyRoute({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(lang)) }}
      />
      <BiographyPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
