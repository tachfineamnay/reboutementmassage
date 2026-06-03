import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeancesPage from "../../seances-page";
import { absoluteUrl, isLocale, LOCALE_TO_LANGUAGE } from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string }>;
};

const SEANCES_META: Record<string, { title: string; description: string; slug: string }> = {
  fr: {
    title: "Séances privées — Méthode TMS® | Grégory Tordjman",
    description:
      "Séances de thérapie manuelle privées avec Grégory Tordjman, créateur de la Méthode TMS®. Intervention à domicile, hôtel, villa, yacht. Réponse personnelle sous 12h.",
    slug: "seances",
  },
  en: {
    title: "Private sessions — Méthode TMS® | Grégory Tordjman",
    description:
      "Private manual therapy sessions with Grégory Tordjman, creator of the Méthode TMS®. On-site at home, hotel, villa, yacht. Personal reply within 12h.",
    slug: "sessions",
  },
  es: {
    title: "Sesiones privadas — Método TMS® | Grégory Tordjman",
    description:
      "Sesiones privadas de terapia manual con Grégory Tordjman, creador del Método TMS®. Intervención a domicilio, hotel, villa, yate. Respuesta personal en 12h.",
    slug: "sesiones",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const meta = SEANCES_META[lang] ?? SEANCES_META.fr;
  const imageUrl = absoluteUrl("/og-image.png");
  const canonicalUrl = absoluteUrl(`/${lang}/${meta.slug}`);

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "x-default": absoluteUrl("/fr/seances"),
        fr: absoluteUrl("/fr/seances"),
        en: absoluteUrl("/en/sessions"),
        es: absoluteUrl("/es/sesiones"),
      },
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: canonicalUrl,
      siteName: "Méthode TMS®",
      title: meta.title,
      description: meta.description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "Séances privées — Méthode TMS®" }],
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
  const meta = SEANCES_META[lang] ?? SEANCES_META.fr;
  const pageUrl = absoluteUrl(`/${lang}/${meta.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${pageUrl}#service`,
        name: "Séances privées — Méthode TMS®",
        description: meta.description,
        url: pageUrl,
        provider: {
          "@type": "Person",
          name: "Grégory Tordjman",
          "@id": `${absoluteUrl()}#gregory-tordjman`,
        },
        areaServed: "International",
        serviceType: [
          "Thérapie manuelle privée",
          "Reboutement",
          "Séance à domicile",
          "Intervention hôtel villa yacht",
        ],
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          availabilityStarts: "2014-01-01",
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

export default async function SeancesRoute({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(lang)) }}
      />
      <SeancesPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
