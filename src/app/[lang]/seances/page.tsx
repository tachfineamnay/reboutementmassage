import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeancesPage from "../../seances-page";
import { SESSION_FAQ } from "@/data/service-content";
import {
  absoluteUrl,
  createFaqJsonLd,
  createIdentityJsonLd,
  createProfessionalServiceJsonLd,
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

const SEANCES_META: Record<string, { title: string; description: string; slug: string }> = {
  fr: {
    title: "Séance de reboutement & thérapie manuelle — Méthode TMS® | Grégory Tordjman",
    description:
      "Séance privée Méthode TMS® avec Grégory Tordjman : accompagnement manuel personnalisé, observation corporelle et gestes adaptés au confort, à domicile, hôtel, villa ou yacht.",
    slug: "seances",
  },
  en: {
    title: "TMS® Manual Therapy & French Bonesetting | Grégory Tordjman",
    description:
      "Private TMS® Manual Therapy session with Grégory Tordjman: a precise hands-on approach inspired by traditional French bonesetting, therapeutic bodywork and deep body reading. Home, hotel, villa or yacht.",
    slug: "sessions",
  },
  es: {
    title: "Terapia manual TMS® & reboutement francés | Grégory Tordjman",
    description:
      "Sesión privada de Terapia manual TMS® con Grégory Tordjman, inspirada en el reboutement tradicional francés, la lectura corporal y el masaje terapéutico profundo. Domicilio, hotel, villa o yate.",
    slug: "sesiones",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const meta = SEANCES_META[lang] ?? SEANCES_META.fr;
  const imageUrl = absoluteUrl("/og-image.png");
  const canonicalUrl = absoluteUrl(localizedPath("sessions", lang));

  return {
    metadataBase: new URL(absoluteUrl()),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: routeAlternates("sessions"),
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: canonicalUrl,
      siteName: "Méthode TMS®",
      title: meta.title,
      description: meta.description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "Séance de reboutement — Méthode TMS®" }],
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
  const meta = SEANCES_META[locale] ?? SEANCES_META.fr;
  return graphJsonLd([
    createIdentityJsonLd(locale),
    createProfessionalServiceJsonLd({
      locale,
      routeKey: "sessions",
      name:
        locale === "fr"
          ? "Séance de reboutement TMS® et thérapie manuelle"
          : locale === "en"
          ? "TMS® Manual Therapy and traditional French bonesetting-inspired session"
          : "Sesión de Terapia manual TMS® inspirada en el reboutement tradicional francés",
      description: meta.description,
      serviceType: [
        "Reboutement TMS®",
        "Private manual therapy",
        "Traditional French bonesetting-inspired bodywork",
        "Personalised hands-on body support",
        "Home session",
        "Hotel villa yacht intervention",
      ],
    }),
    createWebPageJsonLd({
      locale,
      routeKey: "sessions",
      title: meta.title,
      description: meta.description,
      aboutId: `${absoluteUrl()}#gregory-tordjman`,
    }),
    createFaqJsonLd(SESSION_FAQ[locale]),
  ]);
}

export default async function SeancesRoute({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderJsonLd(structuredData(lang)) }}
      />
      <SeancesPage initialLang={LOCALE_TO_LANGUAGE[lang]} />
    </>
  );
}
