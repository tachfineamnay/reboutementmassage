"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Language } from "@/data/copy";
import SharedHeader from "@/components/SharedHeader";
import SharedFooter from "@/components/SharedFooter";
import SharedContactForm from "@/components/SharedContactForm";

/* ──────────────────────────────────────────────────────────
   Reveal-on-scroll
   ────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function Reveal({
  as: Tag = "div",
  delay = 0,
  children,
  className = "",
  style = {},
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  delay?: number;
  children: React.ReactNode;
}) {
  const [ref, shown] = useReveal();
  const s: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(20px)",
    transition: `opacity .8s cubic-bezier(.25,.1,.25,1), transform .8s cubic-bezier(.25,.1,.25,1)`,
    transitionDelay: `${delay}s`,
    ...style,
  };
  return (
    <Tag ref={ref} className={className} style={s} {...rest}>
      {children}
    </Tag>
  );
}

/* ──────────────────────────────────────────────────────────
   Arrow SVG
   ────────────────────────────────────────────────────────── */
const Arrow = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
    <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
    <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
  </svg>
);

/* Header moved to SharedHeader component */

/* ──────────────────────────────────────────────────────────
   01 — Hero (dark editorial, full-bleed)
   ────────────────────────────────────────────────────────── */
function WsHero({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Stages & Workshops · Méthode TMS®",
      h1: ["Transmettre ce qui", "ne s'improvise pas."],
      sub: "Des formations pratiques et exigeantes pour les thérapeutes, praticiens spa et équipes qui veulent intégrer la Méthode TMS® à leur pratique.",
      cta: "Demander une place",
      ctaSec: "Voir les formats",
      metaLabel: "Transmission professionnelle · Pratique depuis 2006",
    },
    EN: {
      eyebrow: "Stages & Workshops · Méthode TMS®",
      h1: ["Transmitting what", "cannot be improvised."],
      sub: "Practical and demanding training for therapists, spa practitioners and teams who want to integrate the Méthode TMS® into their practice.",
      cta: "Request a place",
      ctaSec: "View formats",
      metaLabel: "Professional transmission · Practising since 2006",
    },
    ES: {
      eyebrow: "Stages & Workshops · Método TMS®",
      h1: ["Transmitir lo que", "no se improvisa."],
      sub: "Formaciones prácticas y exigentes para terapeutas, profesionales spa y equipos que quieren integrar el Método TMS® en su práctica.",
      cta: "Solicitar una plaza",
      ctaSec: "Ver formatos",
      metaLabel: "Transmisión profesional · Práctica desde 2006",
    },
  }[lang];

  return (
    <section className="bio-hero ws-hero" id="top">
      <div className="bio-hero__grid">
        <div className="bio-hero__text">
          <Reveal delay={0.05}>
            <div className="eyebrow eyebrow--gold">{t.eyebrow}</div>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="bio-hero__h1">
              <span className="hh-line">{t.h1[0]}</span>
              <span className="hh-line hh-italic">{t.h1[1]}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.35}>
            <p className="bio-hero__sub">{t.sub}</p>
          </Reveal>
          <Reveal delay={0.48}>
            <div className="hero-cta-group">
              <a href="#inscription" className="btn-primary" id="ws-hero-cta">
                <span>{t.cta}</span>
                <Arrow />
              </a>
              <a href="#formats" className="btn-inline bio-hero__btn-sec" id="ws-hero-sec">
                <span>{t.ctaSec}</span>
                <Arrow />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="bio-hero__photo" delay={0.18}>
          <Image
            src="/practice-01.webp"
            alt={lang === "FR"
              ? "Formation à la Méthode TMS® — transmission du geste thérapeutique"
              : lang === "EN"
              ? "Méthode TMS® training — transmitting the therapeutic gesture"
              : "Formación Método TMS® — transmisión del gesto terapéutico"}
            fill
            priority
            sizes="(max-width: 920px) 100vw, 46vw"
            style={{ objectFit: "cover", objectPosition: "center 40%", filter: "saturate(.85) contrast(1.04) brightness(.88)" }}
          />
          <span className="bio-hero__cap eyebrow eyebrow--gold">
            {t.metaLabel}
          </span>
        </Reveal>
      </div>

      <div className="hero-scroll hero-scroll--ink" aria-hidden="true">
        <svg width="10" height="36" viewBox="0 0 10 36" fill="none">
          <line x1="5" y1="0" x2="5" y2="26" stroke="currentColor" strokeWidth="0.6" />
          <polyline points="1.5,22 5,30 8.5,22" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </svg>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   02 — Pour qui (profiles style, cream bg)
   ────────────────────────────────────────────────────────── */
function WsPourQui({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "01 — Pour qui",
      title: "À qui s'adressent les workshops Méthode TMS® ?",
      sub: "Des formats pratiques pour professionnels du geste, équipes spa et projets de reconversion sérieusement cadrés.",
      items: [
        {
          num: "01",
          italic: "Thérapeutes manuels.",
          note: "Professionnels souhaitant approfondir l'observation corporelle, la qualité du toucher et l'adaptation du geste à leur propre champ de compétence.",
        },
        {
          num: "02",
          italic: "Praticiens spa & wellness.",
          note: "Masseurs, soignants en hôtels 5 étoiles ou resorts. Intégrer une approche structurelle à une offre déjà premium.",
        },
        {
          num: "03",
          italic: "Équipes hospitality.",
          note: "Responsables spa, directeurs de wellness, managers de conciergeries. Former son équipe à la précision et à la discrétion du geste.",
        },
        {
          num: "04",
          italic: "Praticiens en reconversion.",
          note: "Professionnels en transition qui cherchent un apprentissage manuel rigoureux, avec des limites d'usage clairement posées.",
        },
      ],
    },
    EN: {
      eyebrow: "01 — For whom",
      title: "Who are Méthode TMS® workshops for?",
      sub: "Practical formats for hands-on professionals, spa teams and carefully framed career-transition projects.",
      items: [
        {
          num: "01",
          italic: "Manual therapists.",
          note: "Professionals seeking to deepen body observation, quality of touch and adaptation of gesture within their own scope of practice.",
        },
        {
          num: "02",
          italic: "Spa & wellness practitioners.",
          note: "Masseurs, therapists in 5-star hotels or resorts. Integrate a structural approach into an already premium offering.",
        },
        {
          num: "03",
          italic: "Hospitality teams.",
          note: "Spa managers, wellness directors, concierge managers. Train your team in the precision and discretion of the gesture.",
        },
        {
          num: "04",
          italic: "Practitioners in transition.",
          note: "Professionals in transition seeking rigorous hands-on learning with clearly stated boundaries of use.",
        },
      ],
    },
    ES: {
      eyebrow: "01 — Para quién",
      title: "¿A quién se dirigen los workshops del Método TMS®?",
      sub: "Formatos prácticos para profesionales del gesto, equipos spa y proyectos de reconversión bien definidos.",
      items: [
        {
          num: "01",
          italic: "Terapeutas manuales.",
          note: "Profesionales que desean profundizar en la observación corporal, la calidad del tacto y la adaptación del gesto a su propio ámbito profesional.",
        },
        {
          num: "02",
          italic: "Profesionales spa & wellness.",
          note: "Masajistas, terapeútas en hoteles 5 estrellas o resorts. Integrar un enfoque estructural en una oferta ya premium.",
        },
        {
          num: "03",
          italic: "Equipos de hospitality.",
          note: "Responsables spa, directores de wellness, managers de concierge. Formar a su equipo en la precisión y discreción del gesto.",
        },
        {
          num: "04",
          italic: "Practicantes en reconversión.",
          note: "Profesionales en transición que buscan un aprendizaje manual riguroso con límites de uso claramente definidos.",
        },
      ],
    },
  }[lang];

  return (
    <section className="ws-pour-qui">
      <div className="ws-pour-qui__grid">
        <div className="ws-pour-qui__text">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title section-title--cream ws-pour-qui__title">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub section-sub--light">{t.sub}</p>
          </Reveal>

          <ul className="profiles-list ws-profiles-list">
            {t.items.map((item, i) => (
              <Reveal as="li" key={i} delay={0.2 + i * 0.08} className="profile-row">
                <span className="profile-index">{item.num}</span>
                <span className="profile-rule" />
                <div className="profile-text">
                  <p className="profile-italic">{item.italic}</p>
                  <p className="profile-note">{item.note}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="ws-pour-qui__photo" delay={0.1}>
          <Image
            src="/profiles.webp"
            alt={lang === "FR"
              ? "Praticien en formation à la Méthode TMS®"
              : lang === "EN"
              ? "Practitioner training in the Méthode TMS®"
              : "Profesional en formación del Método TMS®"}
            fill
            sizes="(max-width: 920px) 100vw, 42vw"
            style={{ objectFit: "cover", objectPosition: "center 25%" }}
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   03 — Ce qu'on transmet (3 pilliers pédagogiques)
   ────────────────────────────────────────────────────────── */
function WsPedagogie({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "02 — Pédagogie",
      title: "Ce qu'on apprend. Ce qu'on ressent. Ce qu'on garde.",
      sub: "La Méthode TMS® ne s'enseigne pas en cours théorique. Elle se transmet dans les mains.",
      items: [
        {
          tag: "01",
          label: "Le geste de précision",
          title: "Lecture manuelle du corps",
          body: "Observer la posture, la mobilité et les réactions au toucher. Développer une palpation attentive et un geste adapté — sans sortir de son champ de compétence.",
        },
        {
          tag: "02",
          label: "L'approche globale",
          title: "Corps entier · Plusieurs niveaux",
          body: "Relier posture, respiration, rythme et contexte exprimé. Formuler des observations utiles sans transformer la pratique en diagnostic.",
        },
        {
          tag: "03",
          label: "L'application terrain",
          title: "Protocoles · Contextes · Éthique",
          body: "Adapter l'intervention aux environnements exigeants : hôtel, villa, yacht, espace spa. Travailler la posture professionnelle, le consentement, les limites et la discrétion.",
        },
      ],
    },
    EN: {
      eyebrow: "02 — Pedagogy",
      title: "What you learn. What you feel. What you keep.",
      sub: "The Méthode TMS® is not taught in theory. It is transmitted through the hands.",
      items: [
        {
          tag: "01",
          label: "The precise gesture",
          title: "Manual body reading",
          body: "Observe posture, mobility and responses to touch. Develop attentive palpation and an adapted gesture without exceeding one's professional scope.",
        },
        {
          tag: "02",
          label: "The global approach",
          title: "Whole body · Multiple levels",
          body: "Connect posture, breathing, rhythm and the context expressed by the person. Form useful observations without turning practice into diagnosis.",
        },
        {
          tag: "03",
          label: "Field application",
          title: "Protocols · Contexts · Ethics",
          body: "Adapt the intervention to demanding settings: hotel, villa, yacht or spa. Work on professional conduct, consent, boundaries and discretion.",
        },
      ],
    },
    ES: {
      eyebrow: "02 — Pedagogía",
      title: "Lo que se aprende. Lo que se siente. Lo que se conserva.",
      sub: "El Método TMS® no se enseña en teoría. Se transmite a través de las manos.",
      items: [
        {
          tag: "01",
          label: "El gesto de precisión",
          title: "Lectura manual del cuerpo",
          body: "Observar la postura, la movilidad y las respuestas al tacto. Desarrollar una palpación atenta y un gesto adaptado sin exceder el propio ámbito profesional.",
        },
        {
          tag: "02",
          label: "El enfoque global",
          title: "Cuerpo entero · Múltiples niveles",
          body: "Relacionar postura, respiración, ritmo y contexto expresado. Formular observaciones útiles sin convertir la práctica en diagnóstico.",
        },
        {
          tag: "03",
          label: "Aplicación en terreno",
          title: "Protocolos · Contextos · Ética",
          body: "Adaptar la intervención a entornos exigentes: hotel, villa, yate o spa. Trabajar la conducta profesional, el consentimiento, los límites y la discreción.",
        },
      ],
    },
  }[lang];

  return (
    <section className="practices ws-pedagogy">
      <div className="container">
        <div className="practices-head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub">{t.sub}</p>
          </Reveal>
        </div>

        <div className="practices-grid">
          <Reveal className="practice practice--lead" delay={0}>
            <div className="practice-image">
              <Image
                src="/practice-01.webp"
                alt={lang === "FR" ? "Transmission du geste de la Méthode TMS®" : "Transmitting the Méthode TMS® gesture"}
                fill
                sizes="(max-width: 920px) 100vw, 55vw"
                style={{ objectFit: "cover", objectPosition: "center 35%" }}
              />
            </div>
            <div className="practice-body">
              <div className="practice-meta">
                <span className="eyebrow eyebrow--gold">{t.items[0].tag} — {t.items[0].label}</span>
              </div>
              <h3 className="practice-title">{t.items[0].title}</h3>
              <p className="practice-text">{t.items[0].body}</p>
            </div>
          </Reveal>

          <div className="practices-stack">
            <Reveal className="practice practice--small" delay={0.1}>
              <div className="practice-meta">
                <span className="eyebrow eyebrow--gold">{t.items[1].tag} — {t.items[1].label}</span>
              </div>
              <h3 className="practice-title practice-title--sm">{t.items[1].title}</h3>
              <p className="practice-text">{t.items[1].body}</p>
            </Reveal>

            <span className="rule-gold" />

            <Reveal className="practice practice--small" delay={0.2}>
              <div className="practice-meta">
                <span className="eyebrow eyebrow--gold">{t.items[2].tag} — {t.items[2].label}</span>
              </div>
              <h3 className="practice-title practice-title--sm">{t.items[2].title}</h3>
              <p className="practice-text">{t.items[2].body}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   04 — Formats (cards numérotées)
   ────────────────────────────────────────────────────────── */
function WsFormats({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "03 — Formats",
      title: "Un format adapté à chaque contexte.",
      sub: "Les formations Méthode TMS® s'organisent selon vos contraintes professionnelles.",
      formats: [
        {
          num: "01",
          name: "Workshop intensif",
          duration: "1 journée",
          desc: "Introduction aux fondamentaux de la Méthode TMS®. Lecture du corps, gestes de base, cas pratiques. Idéal pour découvrir l'approche ou enrichir une pratique existante.",
          detail: "8h · Groupe réduit · Matériel inclus",
        },
        {
          num: "02",
          name: "Stage de pratique",
          duration: "3 jours",
          desc: "Immersion complète dans la méthode. Protocoles complets, travail en binôme, retours individuels de Grégory. La formation de référence pour les praticiens.",
          detail: "24h · 6 à 10 participants · Suivi post-formation",
        },
        {
          num: "03",
          name: "Formation équipe spa",
          duration: "Sur mesure",
          desc: "Formation dédiée aux équipes hospitality, spas d'hôtels ou de resorts. Contenu adapté à votre cadre, vos profils clients et votre offre de prestations.",
          detail: "Déplacement possible · Intra-établissement · Devis sur demande",
        },
      ],
      cta: "Demander le programme complet",
    },
    EN: {
      eyebrow: "03 — Formats",
      title: "A format adapted to each context.",
      sub: "Méthode TMS® training is organised around your professional constraints.",
      formats: [
        {
          num: "01",
          name: "Intensive workshop",
          duration: "1 day",
          desc: "Introduction to the fundamentals of the Méthode TMS®. Body reading, basic gestures, practical cases. Ideal for discovering the approach or enriching an existing practice.",
          detail: "8h · Small group · Materials included",
        },
        {
          num: "02",
          name: "Practice stage",
          duration: "3 days",
          desc: "Full immersion in the method. Complete protocols, pair work, individual feedback from Grégory. The reference training for practitioners.",
          detail: "24h · 6 to 10 participants · Post-training follow-up",
        },
        {
          num: "03",
          name: "Spa team training",
          duration: "Tailored",
          desc: "Training dedicated to hospitality teams, hotel or resort spas. Content adapted to your setting, guest profiles and service offering.",
          detail: "On-site possible · In-house · Quote on request",
        },
      ],
      cta: "Request the full programme",
    },
    ES: {
      eyebrow: "03 — Formatos",
      title: "Un formato adaptado a cada contexto.",
      sub: "Las formaciones Método TMS® se organizan según sus necesidades profesionales.",
      formats: [
        {
          num: "01",
          name: "Workshop intensivo",
          duration: "1 día",
          desc: "Introducción a los fundamentos del Método TMS®. Lectura corporal, gestos básicos, casos prácticos. Ideal para descubrir el enfoque o enriquecer una práctica existente.",
          detail: "8h · Grupo reducido · Material incluido",
        },
        {
          num: "02",
          name: "Stage de práctica",
          duration: "3 días",
          desc: "Inmersión completa en el método. Protocolos completos, trabajo en pareja, feedback individual de Grégory. La formación de referencia para los profesionales.",
          detail: "24h · 6 a 10 participantes · Seguimiento post-formación",
        },
        {
          num: "03",
          name: "Formación equipo spa",
          duration: "A medida",
          desc: "Formación dedicada a equipos de hospitality, spas de hoteles o resorts. Contenido adaptado a su entorno, perfiles de huéspedes y oferta de servicios.",
          detail: "Desplazamiento posible · In-house · Presupuesto a petición",
        },
      ],
      cta: "Solicitar el programa completo",
    },
  }[lang];

  return (
    <section className="ws-formats" id="formats">
      <div className="container">
        <div className="ws-formats__head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title ws-formats__title">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub">{t.sub}</p>
          </Reveal>
        </div>

        <div className="ws-formats__grid">
          {t.formats.map((f, i) => (
            <Reveal className="ws-format-card" key={i} delay={0.1 + i * 0.08}>
              <div className="ws-format-card__top">
                <span className="ws-format-card__num">{f.num}</span>
                <span className="ws-format-card__duration eyebrow eyebrow--gold">{f.duration}</span>
              </div>
              <h3 className="ws-format-card__name">{f.name}</h3>
              <p className="ws-format-card__desc">{f.desc}</p>
              <p className="ws-format-card__detail">{f.detail}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="section-cta-row">
            <a href="#inscription" className="btn-inline" id="ws-formats-cta">
              <span>{t.cta}</span>
              <Arrow />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   05 — Chiffres (trust-bar style, dark)
   ────────────────────────────────────────────────────────── */
/* ──────────────────────────────────────────────────────────
   06 — Citations (voix de praticiens)
   ────────────────────────────────────────────────────────── */
function WsFramework({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "04 — Cadre de transmission",
      title: "Ce que la formation pose clairement.",
      items: [
        {
          quote: "La Méthode TMS® enrichit une pratique existante. Elle ne confère aucun titre médical et ne remplace pas la formation réglementaire propre à chaque métier.",
          author: "Champ professionnel",
          location: "Responsabilité",
        },
        {
          quote: "Le consentement, les contre-indications, la capacité à interrompre un geste et l'orientation vers un professionnel de santé font partie de l'apprentissage.",
          author: "Limites",
          location: "Sécurité",
        },
        {
          quote: "Chaque format précise les objectifs, le public, la durée et les conditions d'application avant toute inscription ou intervention en établissement.",
          author: "Programme",
          location: "Transparence",
        },
      ],
    },
    EN: {
      eyebrow: "04 — Training scope",
      title: "What the training states clearly.",
      items: [
        {
          quote: "The Méthode TMS® enriches an existing practice. It grants no medical title and does not replace the regulated training required for each profession.",
          author: "Professional scope",
          location: "Responsibility",
        },
        {
          quote: "Consent, contraindications, knowing when to stop a gesture and referring to healthcare professionals are part of the learning process.",
          author: "Boundaries",
          location: "Safety",
        },
        {
          quote: "Each format specifies objectives, audience, duration and conditions of application before enrolment or an on-site intervention.",
          author: "Programme",
          location: "Transparency",
        },
      ],
    },
    ES: {
      eyebrow: "04 — Marco de transmisión",
      title: "Lo que la formación establece claramente.",
      items: [
        {
          quote: "El Método TMS® enriquece una práctica existente. No concede ningún título médico ni sustituye la formación reglamentaria propia de cada profesión.",
          author: "Ámbito profesional",
          location: "Responsabilidad",
        },
        {
          quote: "El consentimiento, las contraindicaciones, saber detener un gesto y orientar hacia profesionales sanitarios forman parte del aprendizaje.",
          author: "Límites",
          location: "Seguridad",
        },
        {
          quote: "Cada formato precisa objetivos, público, duración y condiciones de aplicación antes de la inscripción o intervención en un establecimiento.",
          author: "Programa",
          location: "Transparencia",
        },
      ],
    },
  }[lang];

  return (
    <section className="ws-citations">
      <div className="container">
        <div className="ws-citations__head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title ws-citations__title">{t.title}</h2>
          </Reveal>
        </div>
        <div className="ws-citations__grid">
          {t.items.map((item, i) => (
            <Reveal className="ws-citation" key={i} delay={0.1 + i * 0.1}>
              <blockquote className="ws-citation__quote">
                <span className="ws-citation__mark" aria-hidden="true">&quot;</span>
                {item.quote}
              </blockquote>
              <div className="ws-citation__footer">
                <span className="ws-citation__author">{item.author}</span>
                <span className="ws-citation__loc">{item.location}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   07 — Comment ça se passe (how-it-works style)
   ────────────────────────────────────────────────────────── */
function WsComment({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Comment ça se passe",
      steps: [
        { word: "Demande.", sub: "Envoyez votre profil, votre contexte et le format souhaité pour une étude personnelle." },
        { word: "Échange.", sub: "Un appel court pour valider le niveau, les attentes et le contexte de votre pratique." },
        { word: "Formation.", sub: "Immersion pratique avec Grégory. Petit groupe. Feedback individuel. Contenu transmissible le lendemain." },
      ],
    },
    EN: {
      eyebrow: "How it works",
      steps: [
        { word: "Request.", sub: "Send your profile, context and preferred format for personal review." },
        { word: "Exchange.", sub: "A brief call to validate level, expectations and the context of your practice." },
        { word: "Training.", sub: "Hands-on immersion with Grégory. Small group. Individual feedback. Content transmissible from the next day." },
      ],
    },
    ES: {
      eyebrow: "Cómo funciona",
      steps: [
        { word: "Solicitud.", sub: "Envíe su perfil, contexto y formato deseado para una revisión personal." },
        { word: "Intercambio.", sub: "Una breve llamada para validar el nivel, las expectativas y el contexto de su práctica." },
        { word: "Formación.", sub: "Inmersión práctica con Grégory. Grupo pequeño. Feedback individual. Contenido transmisible al día siguiente." },
      ],
    },
  }[lang];

  return (
    <section className="how ws-comment">
      <div className="container">
        <Reveal>
          <div className="how-eyebrow">
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </div>
        </Reveal>
        <div className="how-grid">
          {t.steps.map((s, i) => (
            <Reveal className="how-step" key={i} delay={i * 0.1}>
              <p className="how-word">{s.word}</p>
              <p className="how-sub">{s.sub}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   08 — CTA final / Inscription
   ────────────────────────────────────────────────────────── */
function WsCta({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Méthode TMS® · Transmission · Pratique depuis 2006",
      title: "Prêt à intégrer\nla Méthode TMS®?",
      sub: "Grégory répond personnellement à chaque demande. Sélection sur profil.",
      cta: "Envoyer une demande",
      phone: "+33 6 65 51 77 35",
      note: "Programme et conditions sur demande",
    },
    EN: {
      eyebrow: "Méthode TMS® · Training · Practising since 2006",
      title: "Ready to integrate\nthe Méthode TMS®?",
      sub: "Grégory replies personally to every request. Selection based on profile.",
      cta: "Send a request",
      phone: "+33 6 65 51 77 35",
      note: "Programme and conditions on request",
    },
    ES: {
      eyebrow: "Método TMS® · Formación · Práctica desde 2006",
      title: "¿Listo para integrar\nel Método TMS®?",
      sub: "Grégory responde personalmente a cada solicitud. Selección por perfil.",
      cta: "Enviar una solicitud",
      phone: "+33 6 65 51 77 35",
      note: "Programa y condiciones bajo solicitud",
    },
  }[lang];

  return (
    <section className="brand-sig ws-cta" id="ws-cta-section">
      <div className="brand-sig__bg" aria-hidden="true" />
      <div className="container">
        <Reveal className="brand-sig__inner ws-cta__inner">
          <div className="brand-sig__logo-wrap">
            <div className="brand-sig__logo-ring" aria-hidden="true" />
            <Image
              src="/logo-badge.png"
              alt="Méthode TMS® by Grégory Tordjman — Logo officiel"
              width={300}
              height={300}
              className="brand-sig__logo-img"
            />
          </div>
          <div className="brand-sig__copy">
            <Reveal delay={0.1}>
              <span className="eyebrow eyebrow--gold brand-sig__eyebrow">{t.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="brand-sig__headline ws-cta__headline">{t.title}</h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="brand-sig__sub">{t.sub}</p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="brand-sig__cta-row">
                <a href="#inscription" className="btn-primary" id="ws-cta-final">
                  <span>{t.cta}</span>
                  <Arrow />
                </a>
                <div className="ws-cta__contact">
                  <a href={`tel:${t.phone.replace(/\s/g, "")}`} className="brand-sig__note ws-cta__phone">
                    {t.phone}
                  </a>
                  <span className="ws-cta__note">{t.note}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* Footer moved to SharedFooter component */

/* ──────────────────────────────────────────────────────────
   Root export
   ────────────────────────────────────────────────────────── */
export default function WorkshopsPage({ initialLang }: { initialLang: Language }) {
  const lang = initialLang;

  useEffect(() => {
    document.documentElement.setAttribute("data-density", "editorial");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "cream");
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  return (
    <>
      <SharedHeader lang={lang} activePage="workshops" heroStyle="light" />
      <main>
        <WsHero lang={lang} />
        <WsPourQui lang={lang} />
        <WsPedagogie lang={lang} />
        <WsFormats lang={lang} />
        <WsFramework lang={lang} />
        <WsComment lang={lang} />
        <WsCta lang={lang} />
        <SharedContactForm lang={lang} id="inscription" />
      </main>
      <SharedFooter lang={lang} />
    </>
  );
}
