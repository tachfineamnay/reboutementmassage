"use client";

import Image from "next/image";
import { useEffect } from "react";
import CampaignLeadForm from "@/components/CampaignLeadForm";
import MetaViewContent from "@/components/MetaViewContent";
import SharedFooter from "@/components/SharedFooter";
import SharedHeader from "@/components/SharedHeader";
import type { CampaignLandingConfig } from "@/data/campaign-landings";

function Arrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
      <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
      <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

export default function CdmxPrivateSessionPage({ config }: { config: CampaignLandingConfig }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-density", "compact");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "editorial");
    document.documentElement.lang = config.htmlLang;
  }, [config.htmlLang]);

  return (
    <>
      <MetaViewContent
        contentName={config.tracking.viewContentName}
        contentCategory={config.tracking.contentCategory}
        lang={config.language}
      />
      <SharedHeader
        lang={config.language}
        activePage="seances"
        heroStyle="dark"
        ctaHrefOverride="#solicitud"
        ctaLabelOverride={config.hero.cta}
      />
      <main>
        <section className="campaign-hero" id="top">
          <div className="campaign-hero__photo" aria-hidden="true">
            <Image
              src="/hero.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center 30%" }}
            />
            <div className="campaign-hero__vignette" />
          </div>

          <div className="campaign-hero__inner">
            <div className="campaign-hero__copy">
              <span className="eyebrow eyebrow--gold">{config.hero.eyebrow}</span>
              <h1 className="campaign-hero__title">
                <span>{config.hero.title[0]}</span>
                <span className="hh-italic">{config.hero.title[1]}</span>
              </h1>
              <p className="campaign-hero__sub">{config.hero.subtitle}</p>
              <div className="hero-cta-group">
                <a href="#solicitud" className="btn-primary" id="cdmx-hero-form-cta">
                  <span>{config.hero.cta}</span>
                  <Arrow />
                </a>
                <span className="hero-cta-note hero-cta-note--light">{config.hero.note}</span>
              </div>
            </div>

            <div className="campaign-hero__proofs" aria-label="Pruebas de confianza">
              {config.trust.map((item) => (
                <div className="campaign-proof" key={`${item.value}-${item.label}`}>
                  <span className="campaign-proof__value">{item.value}</span>
                  <span className="campaign-proof__label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="campaign-situations">
          <div className="container">
            <div className="campaign-section-head">
              <span className="eyebrow eyebrow--gold">{config.sections.situationsEyebrow}</span>
              <h2 className="section-title">{config.sections.situationsTitle}</h2>
              <p className="section-sub">{config.sections.situationsSub}</p>
            </div>
            <div className="campaign-situations__grid">
              {config.situations.map((item) => (
                <article className="campaign-situation" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="campaign-difference">
          <div className="campaign-difference__image">
            <Image
              src="/practice-01.webp"
              alt={config.sections.differenceImageAlt}
              fill
              sizes="(max-width: 920px) 100vw, 42vw"
              style={{ objectFit: "cover", objectPosition: "center 35%" }}
            />
          </div>
          <div className="campaign-difference__copy">
            <span className="eyebrow eyebrow--gold">{config.difference.eyebrow}</span>
            <h2 className="section-title section-title--cream">{config.difference.title}</h2>
            <p className="campaign-difference__body">{config.difference.body}</p>
            <ul className="campaign-difference__list">
              {config.difference.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="campaign-process">
          <div className="container">
            <div className="campaign-section-head">
              <span className="eyebrow eyebrow--gold">{config.sections.processEyebrow}</span>
              <h2 className="section-title">{config.sections.processTitle}</h2>
            </div>
            <div className="campaign-process__grid">
              {config.process.map((step, index) => (
                <article className="campaign-process-step" key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CampaignLeadForm config={config} id="solicitud" />

        <section className="campaign-faq">
          <div className="container container--narrow">
            <span className="eyebrow eyebrow--gold">{config.sections.faqEyebrow}</span>
            <h2 className="section-title">{config.sections.faqTitle}</h2>
            <div className="seances-faq__list">
              {config.faq.map((item) => (
                <article className="seances-faq__item" key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SharedFooter lang={config.language} />
    </>
  );
}
