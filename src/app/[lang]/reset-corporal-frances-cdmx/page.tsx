import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, renderJsonLd } from "@/lib/seo";
import { CDMX_PRIVATE_SESSION_CAMPAIGNS, CDMX_WHATSAPP_URL } from "@/data/campaign-landings";
import { RESET_CORPORAL_AEO_QUESTIONS } from "@/data/reset-corporal-aeo";
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

const SERVICE_ID = `${absoluteUrl(CANONICAL)}#service`;
const PERSON_ID = `${absoluteUrl("/es/biografia")}#gregory-tordjman`;

// Visible FAQ = quick AEO questions + the detailed FAQ accordion shown on the page.
const VISIBLE_FAQ = [
  ...RESET_CORPORAL_AEO_QUESTIONS.map((item) => ({ question: item.q, answer: item.a })),
  ...config.faq,
];

const jsonLd = renderJsonLd({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Grégory Tordjman",
      url: absoluteUrl("/es/biografia"),
      jobTitle: "Practicante manual · creador del Método TMS®",
    },
    {
      "@type": "Service",
      "@id": SERVICE_ID,
      name: "Reset Corporal Francés en CDMX",
      alternateName: ["French Body Reset", "Body Reset CDMX", "Sesión manual profunda en CDMX"],
      description: config.meta.description,
      url: absoluteUrl(CANONICAL),
      serviceType: "Trabajo corporal manual profundo",
      provider: { "@id": PERSON_ID },
      areaServed: [
        { "@type": "City", name: "Ciudad de México" },
        { "@type": "City", name: "CDMX" },
        { "@type": "Country", name: "Mexico" },
      ],
      offers: [
        {
          "@type": "Offer",
          name: "Body Reset Fix",
          description:
            "Sesión manual profunda enfocada en una zona prioritaria: espalda cargada, cuello rígido, hombros o lumbar.",
          url: CDMX_WHATSAPP_URL,
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Body Reset Full",
          description:
            "Experiencia más completa para espalda, cuello, hombros, pelvis, respiración y tensión global.",
          url: CDMX_WHATSAPP_URL,
          availability: "https://schema.org/InStock",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${absoluteUrl(CANONICAL)}#faq`,
      mainEntity: VISIBLE_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${absoluteUrl(CANONICAL)}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "French Body Reset",
          item: absoluteUrl("/es"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Reset Corporal Francés en CDMX",
          item: absoluteUrl(CANONICAL),
        },
      ],
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
