"use client";

import { useEffect } from "react";
import Image from "next/image";
import CampaignFaq from "@/components/campaign/CampaignFaq";
import CampaignHero from "@/components/campaign/CampaignHero";
import CampaignProcess from "@/components/campaign/CampaignProcess";
import DifferenceBlock from "@/components/campaign/DifferenceBlock";
import ForYouIfBlock from "@/components/campaign/ForYouIfBlock";
import MobileStickyCta from "@/components/campaign/MobileStickyCta";
import OfferBlock from "@/components/campaign/OfferBlock";
import ProofBadges from "@/components/campaign/ProofBadges";
import SharedFooter from "@/components/SharedFooter";
import SharedHeader from "@/components/SharedHeader";
import { CDMX_PRIVATE_SESSION_CAMPAIGNS, CDMX_STATIC_WA_URLS } from "@/data/campaign-landings";
import { trackGrowthEvent } from "@/lib/growth/tracking";

const config = CDMX_PRIVATE_SESSION_CAMPAIGNS.es;

/* ─────────────────────────────────────────────
   WhatsApp icon SVG (shared)
───────────────────────────────────────────── */
function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Benefits section — Sección beneficios
───────────────────────────────────────────── */
const BENEFITS = [
  {
    icon: "🧠",
    title: "Menos estrés mental",
    body: "El sistema nervioso se regula. La mente se calma cuando el cuerpo suelta.",
  },
  {
    icon: "🪶",
    title: "Cuerpo más ligero",
    body: "Las tensiones acumuladas se liberan. El cuerpo recupera su fluidez natural.",
  },
  {
    icon: "🌬️",
    title: "Mejor respiración",
    body: "El trabajo en la caja torácica y el diafragma devuelve amplitud respiratoria real.",
  },
  {
    icon: "⚡",
    title: "Más energía y claridad",
    body: "Cuando el cuerpo no gasta energía en mantener la tensión, la vitalidad vuelve.",
  },
];

function BenefitsSection() {
  return (
    <section className="fbr-benefits" aria-label="Beneficios del French Body Reset">
      <div className="container">
        <div className="fbr-benefits__head">
          <span className="eyebrow eyebrow--gold">Qué cambia</span>
          <h2 className="fbr-benefits__title">Lo que puedes sentir después de una sesión</h2>
          <p className="fbr-benefits__disclaimer">
            * Los resultados son individuales y no constituyen una promesa médica.
          </p>
        </div>
        <ul className="fbr-benefits__grid" role="list">
          {BENEFITS.map((b) => (
            <li key={b.title} className="fbr-benefit-card">
              <span className="fbr-benefit-card__icon" aria-hidden="true">
                {b.icon}
              </span>
              <h3 className="fbr-benefit-card__title">{b.title}</h3>
              <p className="fbr-benefit-card__body">{b.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Corporate & hospitality section
───────────────────────────────────────────── */
function CorporateSection() {
  return (
    <section className="fbr-corporate" aria-label="Sesiones corporativas y VIP">
      <div className="container container--narrow">
        <div className="fbr-corporate__card">
          <div className="fbr-corporate__badge">
            <span className="eyebrow eyebrow--gold">Corporate & Hospitality</span>
          </div>
          <h2 className="fbr-corporate__title">Sesiones privadas para clientes VIP</h2>
          <p className="fbr-corporate__body">
            Sesiones privadas para clientes VIP, hoteles, hospitality, residencias, eventos y
            equipos. Atención discreta, premium y personalizada.
          </p>
          <a
            href={CDMX_STATIC_WA_URLS.corporate}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary fbr-corporate__cta"
            id="corporate-cta"
            aria-label="Pedir información sobre sesiones corporativas de French Body Reset"
          >
            <WhatsAppIcon />
            <span>Pedir información corporativa</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Mid-page CTA strip (CTA #3)
───────────────────────────────────────────── */
function MidPageCtaStrip() {
  return (
    <section className="fbr-mid-cta" aria-label="Reserva tu sesión">
      <div className="container">
        <p className="fbr-mid-cta__text">
          ¿Dudas sobre qué formato elegir? Escríbenos y te orientamos.
        </p>
        <div className="fbr-mid-cta__actions">
          <a
            href={CDMX_STATIC_WA_URLS.book_intent}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            id="mid-cta-book"
            aria-label="Reservar sesión de French Body Reset por WhatsApp"
          >
            <WhatsAppIcon />
            <span>Reservar por WhatsApp</span>
          </a>
          <a
            href={CDMX_STATIC_WA_URLS.more_info_intent}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            id="mid-cta-info"
            aria-label="Pedir información sobre French Body Reset por WhatsApp"
          >
            Pedir información
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Compliance note (medical disclaimer)
───────────────────────────────────────────── */
function ComplianceNote() {
  return (
    <aside className="fbr-compliance" aria-label="Nota de conformidad médica">
      <div className="container container--narrow">
        <p className="fbr-compliance__text">
          <strong>Nota importante:</strong> Esta sesión no sustituye diagnóstico ni tratamiento
          médico. Si tienes una lesión, dolor intenso o condición médica importante, consulta
          primero con un profesional de salud.
        </p>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────
   Logo block — visual anchor
───────────────────────────────────────────── */
function LogoAnchor() {
  return (
    <div className="fbr-logo-anchor" aria-hidden="true">
      <div className="container">
        <div className="fbr-logo-anchor__inner">
          <Image
            src="/logo-badge.png"
            alt="French Body Reset — Grégory Tordjman"
            width={80}
            height={80}
            className="fbr-logo-anchor__img"
          />
          <span className="fbr-logo-anchor__name eyebrow eyebrow--gold">
            French Body Reset · CDMX
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Final CTA — both buttons open WhatsApp
───────────────────────────────────────────── */
function FbrFinalCta() {
  return (
    <section className="campaign-final-cta" id="cta-final">
      <div className="container container--narrow">
        <h2 className="campaign-final-cta__title">
          Tu cuerpo no necesita más ruido. Necesita un reset preciso.
        </h2>
        <p className="campaign-final-cta__body">
          Reserva simple por WhatsApp. Sin formularios complicados. Atención premium en CDMX.
        </p>
        <div className="campaign-final-cta__actions">
          <a
            href={CDMX_STATIC_WA_URLS.book_intent}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            id="final-cta-book"
            aria-label="Reservar sesión de French Body Reset por WhatsApp"
          >
            <WhatsAppIcon />
            <span>Reservar por WhatsApp</span>
          </a>
          <a
            href={CDMX_STATIC_WA_URLS.more_info_intent}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            id="final-cta-info"
            aria-label="Pedir información sobre French Body Reset por WhatsApp"
          >
            Pedir información
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main page component
───────────────────────────────────────────── */
export default function ResetCorporalPage() {
  useEffect(() => {
    document.documentElement.setAttribute("data-density", "compact");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "editorial");
    document.documentElement.lang = "es";
    document.body.classList.add("has-campaign-sticky");

    trackGrowthEvent("landing_viewed", {
      language: "es",
      city: "cdmx",
      country: "Mexico",
      locale: "es",
      offer: "french_body_reset",
      offerType: "private_session",
      content_name: "reset_corporal_frances_cdmx",
    });

    return () => {
      document.body.classList.remove("has-campaign-sticky");
    };
  }, []);

  return (
    <>
      <SharedHeader
        lang="ES"
        activePage="seances"
        heroStyle="dark"
        ctaHrefOverride={CDMX_STATIC_WA_URLS.book_intent}
        ctaLabelOverride="Reservar por WhatsApp"
        ctaExternal
      />

      <main className="campaign-page" id="main-content">
        {/* 1. Hero — 2 WhatsApp CTAs */}
        <CampaignHero config={config} />

        {/* 2. Manifeste — No es un masaje */}
        <DifferenceBlock config={config} />

        {/* 3. Beneficios */}
        <BenefitsSection />

        {/* 4. Ofertas — Fix & Full */}
        <OfferBlock config={config} />

        {/* Mid-page strip CTA (#3) */}
        <MidPageCtaStrip />

        {/* 5. Para ti si… */}
        <ForYouIfBlock config={config} />

        {/* Proof badges */}
        <ProofBadges config={config} />

        {/* Logo visual anchor */}
        <LogoAnchor />

        {/* 6. Proceso de reserva */}
        <CampaignProcess config={config} />

        {/* 7. Corporate & Hospitality */}
        <CorporateSection />

        {/* 8. FAQ */}
        <CampaignFaq config={config} />

        {/* Compliance note */}
        <ComplianceNote />

        {/* 9. CTA final — ambos botones abren WhatsApp */}
        <FbrFinalCta />
      </main>

      <SharedFooter lang="ES" />

      {/* Sticky CTA mobile */}
      <MobileStickyCta config={config} />
    </>
  );
}
