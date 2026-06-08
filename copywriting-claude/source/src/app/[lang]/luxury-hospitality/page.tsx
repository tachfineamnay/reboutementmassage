import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
      "Formation hospitality, protocoles spa, séances VIP et consultations sur site avec Grégory Tordjman pour hôtels de luxe, villas, yachts et Caraïbes/Mexique.",
    eyebrow: "B2B hospitality · Spas cinq étoiles · VIP",
    headline: "Un protocole manuel premium pour les expériences qui ne peuvent pas s'arrêter.",
    intro:
      "Grégory Tordjman accompagne les établissements haut de gamme avec des sessions VIP, des formations sur site et des protocoles Méthode TMS® adaptés aux contraintes de l'hôtellerie de luxe.",
    cta: "Organiser un échange B2B",
    outcomes: [
      "Réponse corporelle discrète pour clients exigeants.",
      "Formation pratique des équipes spa et wellness.",
      "Intervention mobile en hôtel, villa, yacht ou résidence privée.",
      "Positionnement international Caraïbes, Mexique et marchés anglophones/hispanophones.",
    ],
    offersTitle: "Offres B2B",
    offers: [
      {
        title: "Hospitality training",
        text: "Ateliers sur site pour transmettre des gestes, limites et protocoles applicables par des équipes spa.",
      },
      {
        title: "VIP sessions",
        text: "Séances privées assurées par Grégory pour dirigeants, familles, sportifs, artistes et guests premium.",
      },
      {
        title: "Consulting spa",
        text: "Audit de l'expérience corporelle, adaptation des parcours et création d'une offre signature Méthode TMS®.",
      },
    ],
    territoriesTitle: "Territoires prioritaires",
    territories: ["Caraïbes", "Mexique", "France", "Yachts", "Villas privées", "Marchés EN/ES"],
    faq: [
      {
        question: "La Méthode TMS® peut-elle être formée à une équipe spa ?",
        answer: "Oui. Les formations B2B sont construites pour transmettre des protocoles pratiques, lisibles et adaptés au niveau de responsabilité de l'équipe.",
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
      "Hospitality training, spa protocols, VIP sessions and on-site consulting with Grégory Tordjman for luxury hotels, villas, yachts, the Caribbean and Mexico.",
    eyebrow: "B2B hospitality · Five-star spas · VIP",
    headline: "Premium manual therapy support for experiences that cannot stop.",
    intro:
      "Grégory Tordjman supports high-end properties with VIP sessions, on-site training and TMS Method® protocols adapted to luxury hospitality operations.",
    cta: "Start a B2B conversation",
    outcomes: [
      "Discreet bodywork response for demanding guests.",
      "Practical training for spa and wellness teams.",
      "Mobile intervention in hotels, villas, yachts or private residences.",
      "International focus across the Caribbean, Mexico and English/Spanish-speaking markets.",
    ],
    offersTitle: "B2B offers",
    offers: [
      {
        title: "Hospitality training",
        text: "On-site workshops to transmit practical gestures, boundaries and protocols for spa teams.",
      },
      {
        title: "VIP sessions",
        text: "Private sessions by Grégory for executives, families, athletes, artists and premium guests.",
      },
      {
        title: "Spa consulting",
        text: "Body-experience audit, guest journey adaptation and creation of a signature TMS Method® offer.",
      },
    ],
    territoriesTitle: "Priority territories",
    territories: ["Caribbean", "Mexico", "France", "Yachts", "Private villas", "EN/ES markets"],
    faq: [
      {
        question: "Can the TMS Method® be taught to a spa team?",
        answer: "Yes. B2B trainings are designed to transmit practical, clear protocols adapted to the team's scope of responsibility.",
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
      "Formación hospitality, protocolos spa, sesiones VIP y consultoría in situ con Grégory Tordjman para hoteles de lujo, villas, yates, Caribe y México.",
    eyebrow: "B2B hospitality · Spas cinco estrellas · VIP",
    headline: "Soporte manual premium para experiencias que no pueden detenerse.",
    intro:
      "Grégory Tordjman acompaña establecimientos de alta gama con sesiones VIP, formación in situ y protocolos Método TMS® adaptados a la hospitalidad de lujo.",
    cta: "Iniciar una conversación B2B",
    outcomes: [
      "Respuesta corporal discreta para huéspedes exigentes.",
      "Formación práctica de equipos spa y wellness.",
      "Intervención móvil en hoteles, villas, yates o residencias privadas.",
      "Foco internacional en Caribe, México y mercados anglófonos/hispanohablantes.",
    ],
    offersTitle: "Ofertas B2B",
    offers: [
      {
        title: "Hospitality training",
        text: "Talleres in situ para transmitir gestos, límites y protocolos aplicables por equipos spa.",
      },
      {
        title: "Sesiones VIP",
        text: "Sesiones privadas realizadas por Grégory para directivos, familias, deportistas, artistas y huéspedes premium.",
      },
      {
        title: "Consultoría spa",
        text: "Auditoría de la experiencia corporal, adaptación del recorrido y creación de una oferta firma Método TMS®.",
      },
    ],
    territoriesTitle: "Territorios prioritarios",
    territories: ["Caribe", "México", "Francia", "Yates", "Villas privadas", "Mercados EN/ES"],
    faq: [
      {
        question: "¿El Método TMS® puede enseñarse a un equipo spa?",
        answer: "Sí. Las formaciones B2B transmiten protocolos prácticos, claros y adaptados al nivel de responsabilidad del equipo.",
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
      name: "Luxury hospitality manual therapy - Méthode TMS®",
      description: copy.description,
      serviceType: ["Hospitality training", "VIP sessions", "Spa consulting", "On-site manual therapy"],
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

        <SharedContactForm lang={language} id="contact" />
      </main>
      <SharedFooter lang={language} />
    </>
  );
}
