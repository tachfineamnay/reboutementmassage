import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkshopsPage from "../../workshops-page";
import { absoluteUrl, isLocale, LOCALE_TO_LANGUAGE } from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string }>;
};

const WS_META: Record<string, { title: string; description: string; slug: string }> = {
  fr: {
    title: "Stages & Workshops — Méthode TMS® | Formation pour thérapeutes",
    description:
      "Formations pratiques en Méthode TMS® animées par Grégory Tordjman : workshops intensifs, stages de pratique, formation équipe spa et certification. Pour thérapeutes, praticiens et équipes hospitality.",
    slug: "stages-workshops",
  },
  en: {
    title: "Stages & Workshops — Méthode TMS® | Training for therapists",
    description:
      "Practical Méthode TMS® training with Grégory Tordjman: intensive workshops, practice stages, spa team training and certification. For therapists, practitioners and hospitality teams.",
    slug: "stages-workshops",
  },
  es: {
    title: "Stages & Workshops — Método TMS® | Formación para terapeutas",
    description:
      "Formaciones prácticas en Método TMS® con Grégory Tordjman: workshops intensivos, stages de práctica, formación equipo spa y certificación. Para terapeutas, profesionales y equipos de hospitality.",
    slug: "stages-workshops",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const meta = WS_META[lang] ?? WS_META.fr;
  const imageUrl = absoluteUrl("/og-image.png");
  const canonicalUrl = absoluteUrl(`/${lang}/${meta.slug}`);

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "x-default": absoluteUrl("/fr/stages-workshops"),
        fr: absoluteUrl("/fr/stages-workshops"),
        en: absoluteUrl("/en/stages-workshops"),
        es: absoluteUrl("/es/stages-workshops"),
      },
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: canonicalUrl,
      siteName: "Méthode TMS®",
      title: meta.title,
      description: meta.description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "Méthode TMS® — Stages & Workshops" }],
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
  const meta = WS_META[lang] ?? WS_META.fr;
  const pageUrl = absoluteUrl(`/${lang}/${meta.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationEvent",
        "@id": `${pageUrl}#training`,
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        organizer: {
          "@type": "Person",
          name: "Grégory Tordjman",
          "@id": `${absoluteUrl()}#gregory-tordjman`,
        },
        about: {
          "@type": "Thing",
          name: "Méthode TMS®",
        },
        audience: {
          "@type": "Audience",
          audienceType: "Therapists, Spa teams, Hospitality professionals",
        },
      },
      {
        "@type": "Course",
        name: "Formation Méthode TMS®",
        description: meta.description,
        url: pageUrl,
        provider: {
          "@type": "Person",
          name: "Grégory Tordjman",
          "@id": `${absoluteUrl()}#gregory-tordjman`,
        },
        hasCourseInstance: [
          {
            "@type": "CourseInstance",
            courseMode: "onsite",
            name: "Workshop intensif 1 jour",
          },
          {
            "@type": "CourseInstance",
            courseMode: "onsite",
            name: "Stage de pratique 3 jours",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: meta.title,
        description: meta.description,
        inLanguage: lang,
      },
    ],
  };
}

export default async function WorkshopsRoute({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(lang)) }}
      />
      <WorkshopsPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
