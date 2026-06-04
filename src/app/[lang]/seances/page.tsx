import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeancesPage from "../../seances-page";
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

const INTERNAL_LINKS = {
  fr: {
    home: "/fr",
    training: "/fr/stages-workshops",
  },
  en: {
    home: "/en",
    training: "/en/stages-workshops",
  },
  es: {
    home: "/es",
    training: "/es/stages-workshops",
  },
} as const;

type PageProps = {
  params: Promise<{ lang: string }>;
};

const SEANCES_META: Record<string, { title: string; description: string; slug: string }> = {
  fr: {
    title: "Séance de reboutement & thérapie manuelle — Méthode TMS® | Grégory Tordjman",
    description:
      "Séance privée de reboutement TMS®, thérapie manuelle de précision et massage thérapeutique avec Grégory Tordjman. Soulagement des blocages, tensions profondes et restrictions articulaires à domicile, hôtel, villa ou yacht.",
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

const SEANCES_FAQ: Record<string, Array<{ question: string; answer: string }>> = {
  fr: [
    {
      question: "Qu'est-ce qu'une séance de reboutement TMS® ?",
      answer:
        "Une séance de reboutement TMS® est une intervention manuelle précise qui s'inspire du reboutement traditionnel tout en l'inscrivant dans la Méthode TMS® : lecture du corps, travail ciblé des blocages, tensions profondes, restrictions articulaires et compensations anciennes.",
    },
    {
      question: "Quelle différence entre reboutement, massage thérapeutique et ostéopathie ?",
      answer:
        "La Méthode TMS® ne remplace pas un suivi médical. Elle associe une lecture corporelle fine, un toucher manuel direct et des repères personnalisés. Le reboutement apporte l'ancrage traditionnel, le massage thérapeutique le travail tissulaire, et la méthode construit une réponse adaptée au corps présent.",
    },
    {
      question: "Quand demander une séance ?",
      answer:
        "Une demande est pertinente lorsque le corps bloque, lorsque les tensions reviennent, ou après un voyage, une saison intense, un effort physique, un stress prolongé ou une fatigue corporelle profonde.",
    },
  ],
  en: [
    {
      question: "What is a TMS® Manual Therapy session?",
      answer:
        "A TMS® Manual Therapy session is a precise hands-on intervention inspired by traditional French bonesetting, therapeutic bodywork and deep body reading. It focuses on blockages, deep tension, joint restrictions and long-standing compensation patterns.",
    },
    {
      question: "Is it the same as bonesetting or massage?",
      answer:
        "No. The TMS® Method does not replace medical care. It uses traditional bonesetting as a cultural reference, therapeutic bodywork as a manual layer, and a personalised body reading to adapt the session to the person and context.",
    },
    {
      question: "When should I request a session?",
      answer:
        "A session is relevant when the body locks up, when tension returns, after travel, intense work periods, physical effort, prolonged stress or deep fatigue.",
    },
  ],
  es: [
    {
      question: "¿Qué es una sesión de Terapia manual TMS®?",
      answer:
        "Una sesión de Terapia manual TMS® es una intervención manual precisa inspirada en el reboutement tradicional francés, la lectura corporal y el masaje terapéutico profundo. Trabaja bloqueos, tensiones profundas, restricciones articulares y compensaciones antiguas.",
    },
    {
      question: "¿Es lo mismo que un huesero, un sobador o un masaje?",
      answer:
        "No. El Método TMS® no sustituye un seguimiento médico. Toma el reboutement tradicional como referencia cultural, integra el trabajo manual terapéutico y adapta cada sesión al cuerpo, al contexto y a la necesidad del momento.",
    },
    {
      question: "¿Cuándo solicitar una sesión?",
      answer:
        "Cuando el cuerpo se bloquea, cuando las tensiones vuelven, después de un viaje, una temporada intensa, un esfuerzo físico, estrés prolongado o fatiga corporal profunda.",
    },
  ],
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
  const links = INTERNAL_LINKS[locale];

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
        "Therapeutic massage",
        "Home session",
        "Hotel villa yacht intervention",
      ],
    }),
    createWebPageJsonLd({
      locale,
      routeKey: "sessions",
      title: meta.title,
      description: `${meta.description} Related pages: ${absoluteUrl(links.home)} and ${absoluteUrl(links.training)}.`,
      aboutId: `${absoluteUrl()}#gregory-tordjman`,
    }),
    createFaqJsonLd(SEANCES_FAQ[locale] ?? SEANCES_FAQ.fr),
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
