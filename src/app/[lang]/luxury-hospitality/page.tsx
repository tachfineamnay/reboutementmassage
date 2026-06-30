import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MetaViewContent from "@/components/MetaViewContent";
import SharedContactForm from "@/components/SharedContactForm";
import SharedFooter from "@/components/SharedFooter";
import SharedHeader from "@/components/SharedHeader";
import {
  absoluteUrl,
  createB2BServiceJsonLd,
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
  type Locale,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ lang: string }>;
};

const B2B_COPY: Record<Locale, {
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  cta: string;
  outcomes: string[];
  offersTitle: string;
  offers: Array<{ title: string; text: string }>;
  territoriesTitle: string;
  territories: string[];
  faq: Array<{ question: string; answer: string }>;
}> = {
  fr: {
    title: "Hôtellerie de luxe & spas — Méthode TMS® | Grégory Tordjman",
    description:
      "Workshops hospitality, séances privées et accompagnement sur site avec Grégory Tordjman pour hôtels de luxe, spas, villas, yachts et équipes internationales.",
    eyebrow: "B2B hospitality · Spas cinq étoiles · VIP",
    headline: "Une présence manuelle précise pour les expériences qui exigent de la continuité.",
    intro:
      "Praticien depuis 2006, Grégory Tordjman accompagne les établissements haut de gamme avec des séances privées, des workshops sur site et un cadre Méthode TMS® adapté aux contraintes de l'hospitality.",
    cta: "Organiser un échange B2B",
    outcomes: [
      "Accompagnement manuel discret, organisé selon le contexte du client.",
      "Formation pratique des équipes spa et wellness.",
      "Intervention mobile en hôtel, villa, yacht ou résidence privée.",
      "Positionnement international Caraïbes, Mexique et marchés anglophones/hispanophones.",
    ],
    offersTitle: "Offres B2B",
    offers: [
      {
        title: "Hospitality training",
        text: "Ateliers sur site pour travailler observation, gestes, consentement et limites applicables par les équipes spa dans leur champ professionnel.",
      },
      {
        title: "VIP sessions",
        text: "Séances privées assurées par Grégory, après échange sur le contexte, les attentes et les éventuelles précautions.",
      },
      {
        title: "Consulting spa",
        text: "Analyse du parcours client, clarification du cadre d'intervention et conception d'une expérience signature cohérente avec l'établissement.",
      },
    ],
    territoriesTitle: "Territoires prioritaires",
    territories: ["Caraïbes", "Mexique", "France", "Yachts", "Villas privées", "Marchés EN/ES"],
    faq: [
      {
        question: "La Méthode TMS® peut-elle être formée à une équipe spa ?",
        answer: "Oui. Les workshops B2B transmettent des gestes, des repères et des limites adaptés au niveau de responsabilité de l'équipe. Ils n'élargissent pas son champ professionnel et ne confèrent aucun titre médical.",
      },
      {
        question: "Grégory se déplace-t-il hors de France ?",
        answer: "Oui. Les interventions internationales sont possibles sur demande, notamment pour hôtels, villas, yachts et partenaires hospitality.",
      },
    ],
  },
  en: {
    title: "Luxury hospitality & spas — TMS Method® | Grégory Tordjman",
    description:
      "Hospitality workshops, private sessions and on-site support with Grégory Tordjman for luxury hotels, spas, villas, yachts and international teams.",
    eyebrow: "B2B hospitality · Five-star spas · VIP",
    headline: "Precise hands-on presence for experiences that require continuity.",
    intro:
      "A hands-on practitioner since 2006, Grégory Tordjman supports high-end properties with private sessions, on-site workshops and a Méthode TMS® framework adapted to hospitality operations.",
    cta: "Start a B2B conversation",
    outcomes: [
      "Discreet hands-on support organised around each guest's context.",
      "Practical training for spa and wellness teams.",
      "Mobile intervention in hotels, villas, yachts or private residences.",
      "International focus across the Caribbean, Mexico and English/Spanish-speaking markets.",
    ],
    offersTitle: "B2B offers",
    offers: [
      {
        title: "Hospitality training",
        text: "On-site workshops covering observation, gestures, consent and boundaries within each spa team's professional scope.",
      },
      {
        title: "VIP sessions",
        text: "Private sessions delivered by Grégory after discussing the context, expectations and relevant precautions.",
      },
      {
        title: "Spa consulting",
        text: "Guest-journey review, clarification of the intervention framework and design of a signature experience aligned with the property.",
      },
    ],
    territoriesTitle: "Priority territories",
    territories: ["Caribbean", "Mexico", "France", "Yachts", "Private villas", "EN/ES markets"],
    faq: [
      {
        question: "Can the TMS Method® be taught to a spa team?",
        answer: "Yes. B2B workshops transmit gestures, practical guidance and boundaries suited to the team's responsibilities. They do not expand professional scope or grant any medical title.",
      },
      {
        question: "Does Grégory travel outside France?",
        answer: "Yes. International interventions are available on request for hotels, villas, yachts and hospitality partners.",
      },
    ],
  },
  es: {
    title: "Hospitalidad de lujo & spas — Método TMS® | Grégory Tordjman",
    description:
      "Workshops hospitality, sesiones privadas y acompañamiento in situ con Grégory Tordjman para hoteles de lujo, spas, villas, yates y equipos internacionales.",
    eyebrow: "B2B hospitality · Spas cinco estrellas · VIP",
    headline: "Una presencia manual precisa para experiencias que exigen continuidad.",
    intro:
      "Practicante desde 2006, Grégory Tordjman acompaña establecimientos de alta gama con sesiones privadas, workshops in situ y un marco Método TMS® adaptado a la hospitalidad.",
    cta: "Iniciar una conversación B2B",
    outcomes: [
      "Acompañamiento manual discreto, organizado según el contexto del huésped.",
      "Formación práctica de equipos spa y wellness.",
      "Intervención móvil en hoteles, villas, yates o residencias privadas.",
      "Foco internacional en Caribe, México y mercados anglófonos/hispanohablantes.",
    ],
    offersTitle: "Ofertas B2B",
    offers: [
      {
        title: "Hospitality training",
        text: "Talleres in situ sobre observación, gestos, consentimiento y límites aplicables por los equipos spa en su ámbito profesional.",
      },
      {
        title: "Sesiones VIP",
        text: "Sesiones privadas realizadas por Grégory después de conversar sobre el contexto, las expectativas y las precauciones relevantes.",
      },
      {
        title: "Consultoría spa",
        text: "Análisis del recorrido del huésped, definición del marco de intervención y diseño de una experiencia firma coherente con el establecimiento.",
      },
    ],
    territoriesTitle: "Territorios prioritarios",
    territories: ["Caribe", "México", "Francia", "Yates", "Villas privadas", "Mercados EN/ES"],
    faq: [
      {
        question: "¿El Método TMS® puede enseñarse a un equipo spa?",
        answer: "Sí. Los workshops B2B transmiten gestos, pautas y límites adaptados a la responsabilidad del equipo. No amplían su ámbito profesional ni conceden ningún título médico.",
      },
      {
        question: "¿Grégory se desplaza fuera de Francia?",
        answer: "Sí. Las intervenciones internacionales son posibles bajo solicitud para hoteles, villas, yates y partners hospitality.",
      },
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const copy = B2B_COPY[lang];
  const canonical = absoluteUrl(localizedPath("luxuryHospitality", lang));
  const imageUrl = absoluteUrl("/og-image.png");

  return {
    metadataBase: new URL(absoluteUrl()),
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: routeAlternates("luxuryHospitality"),
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: canonical,
      siteName: "Méthode TMS®",
      title: copy.title,
      description: copy.description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: copy.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

function structuredData(locale: Locale) {
  const copy = B2B_COPY[locale];
  return graphJsonLd([
    createIdentityJsonLd(locale),
    createB2BServiceJsonLd(locale),
    createProfessionalServiceJsonLd({
      locale,
      routeKey: "luxuryHospitality",
      name: "Luxury hospitality hands-on support - Méthode TMS®",
      description: copy.description,
      serviceType: ["Hospitality training", "VIP sessions", "Spa consulting", "On-site hands-on support"],
    }),
    createWebPageJsonLd({
      locale,
      routeKey: "luxuryHospitality",
      title: copy.title,
      description: copy.description,
      aboutId: `${absoluteUrl(localizedPath("luxuryHospitality", locale))}#b2b-service`,
    }),
    createFaqJsonLd(copy.faq),
  ]);
}

export default async function LuxuryHospitalityPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const copy = B2B_COPY[lang];
  const language = LOCALE_TO_LANGUAGE[lang];

  return (
    <>
      <MetaViewContent contentName="luxury_hospitality" contentCategory="manual_therapy" lang={language} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderJsonLd(structuredData(lang)) }}
      />
      <SharedHeader lang={language} activePage="workshops" heroStyle="dark" />
      <main>
        <section
          style={{
            minHeight: "82vh",
            display: "grid",
            alignItems: "end",
            position: "relative",
            overflow: "hidden",
            color: "var(--cream)",
            background: "var(--ink)",
          }}
        >
          <Image
            src="/hero.webp"
            alt={copy.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", opacity: 0.42 }}
          />
          <div
            style={{
              position: "relative",
              width: "min(1120px, calc(100% - 40px))",
              margin: "0 auto",
              padding: "160px 0 84px",
            }}
          >
            <p className="eyebrow eyebrow--gold">{copy.eyebrow}</p>
            <h1
              style={{
                maxWidth: "860px",
                margin: "18px 0 22px",
                fontFamily: "var(--serif)",
                fontSize: "clamp(44px, 8vw, 92px)",
                fontWeight: 300,
                lineHeight: 0.94,
              }}
            >
              {copy.headline}
            </h1>
            <p style={{ maxWidth: "680px", fontSize: "18px", lineHeight: 1.65, color: "rgba(247,241,229,.86)" }}>
              {copy.intro}
            </p>
            <a href="#contact" className="btn-primary" style={{ marginTop: "28px" }}>
              {copy.cta}
            </a>
          </div>
        </section>

        <section style={{ background: "var(--cream)", padding: "72px 0" }}>
          <div style={{ width: "min(1120px, calc(100% - 40px))", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
              {copy.outcomes.map((outcome) => (
                <p key={outcome} style={{ margin: 0, paddingTop: "18px", borderTop: "1px solid rgba(26,23,20,.18)", lineHeight: 1.6 }}>
                  {outcome}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "84px 0", background: "var(--forest-light)" }}>
          <div style={{ width: "min(1120px, calc(100% - 40px))", margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(34px, 5vw, 62px)", fontWeight: 300, margin: "0 0 36px" }}>
              {copy.offersTitle}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px" }}>
              {copy.offers.map((offer) => (
                <article key={offer.title} style={{ borderLeft: "2px solid var(--gold)", paddingLeft: "22px" }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: "20px" }}>{offer.title}</h3>
                  <p style={{ margin: 0, color: "var(--mid)", lineHeight: 1.65 }}>{offer.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "var(--forest)", color: "var(--cream)" }}>
          <div style={{ width: "min(1120px, calc(100% - 40px))", margin: "0 auto" }}>
            <p className="eyebrow eyebrow--gold">{copy.territoriesTitle}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "24px" }}>
              {copy.territories.map((territory) => (
                <span key={territory} style={{ border: "1px solid rgba(247,241,229,.3)", padding: "10px 14px", fontSize: "14px" }}>
                  {territory}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "84px 0", background: "var(--cream)" }} id="faq">
          <div style={{ width: "min(860px, calc(100% - 40px))", margin: "0 auto" }}>
            <p className="eyebrow eyebrow--gold">FAQ</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(34px, 5vw, 58px)", fontWeight: 300, margin: "14px 0 32px" }}>
              {lang === "fr"
                ? "Questions fréquentes des établissements."
                : lang === "en"
                  ? "Frequently asked questions from properties."
                  : "Preguntas frecuentes de los establecimientos."}
            </h2>
            <div style={{ display: "grid", gap: "26px" }}>
              {copy.faq.map((item) => (
                <article key={item.question} style={{ borderTop: "1px solid rgba(26,23,20,.18)", paddingTop: "20px" }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: "20px" }}>{item.question}</h3>
                  <p style={{ margin: 0, color: "var(--mid)", lineHeight: 1.7 }}>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SharedContactForm lang={language} id="contact" />
      </main>
      <SharedFooter lang={language} />
    </>
  );
}
