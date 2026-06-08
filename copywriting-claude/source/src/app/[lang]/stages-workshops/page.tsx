import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkshopsPage from "../../workshops-page";
import {
  absoluteUrl,
  createCourseJsonLd,
  createEducationEventJsonLd,
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

const WS_META: Record<string, { title: string; description: string; slug: string }> = {
  fr: {
    title: "Formation reboutement TMS® — Stages & Workshops | Grégory Tordjman",
    description:
      "Formations pratiques en Méthode TMS® animées par Grégory Tordjman : reboutement TMS®, lecture corporelle, thérapie manuelle de précision, workshops intensifs et formation équipe spa.",
    slug: "stages-workshops",
  },
  en: {
    title: "TMS® Manual Therapy Training | French Bonesetting Workshops",
    description:
      "Practical Méthode TMS® training with Grégory Tordjman: traditional French bonesetting-inspired precision, body reading, therapeutic bodywork, spa team training and intensive workshops.",
    slug: "stages-workshops",
  },
  es: {
    title: "Formación Terapia manual TMS® | Reboutement francés",
    description:
      "Formaciones prácticas en Método TMS® con Grégory Tordjman: reboutement tradicional francés, lectura corporal, masaje terapéutico profundo, formación equipo spa y workshops intensivos.",
    slug: "stages-workshops",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const meta = WS_META[lang] ?? WS_META.fr;
  const imageUrl = absoluteUrl("/og-image.png");
  const canonicalUrl = absoluteUrl(localizedPath("stagesWorkshops", lang));

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: routeAlternates("stagesWorkshops"),
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
  const locale = isLocale(lang) ? lang : "fr";
  const meta = WS_META[locale] ?? WS_META.fr;
  return graphJsonLd([
    createIdentityJsonLd(locale),
    createCourseJsonLd(locale),
    createEducationEventJsonLd(locale),
    createWebPageJsonLd({
      locale,
      routeKey: "stagesWorkshops",
      title: meta.title,
      description: meta.description,
      aboutId: `${absoluteUrl()}#gregory-tordjman`,
    }),
  ]);
}

export default async function WorkshopsRoute({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderJsonLd(structuredData(lang)) }}
      />
      <WorkshopsPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
