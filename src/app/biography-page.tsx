"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Language } from "@/data/copy";
import SharedHeader from "@/components/SharedHeader";
import SharedFooter from "@/components/SharedFooter";
import SharedContactForm from "@/components/SharedContactForm";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */
type BioCopy = {
  lang: Language;
};

const LANGUAGE_ROUTES: Record<Language, string> = {
  FR: "/fr",
  EN: "/en",
  ES: "/es",
};

const BIO_ROUTES: Record<Language, string> = {
  FR: "/fr/biographie",
  EN: "/en/biography",
  ES: "/es/biografia",
};

/* ──────────────────────────────────────────────────────────
   Reveal-on-scroll (same as landing page)
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
   Arrow SVG (shared)
   ────────────────────────────────────────────────────────── */
const Arrow = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
    <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
    <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
  </svg>
);

/* Header moved to SharedHeader component */

/* ──────────────────────────────────────────────────────────
   01 — Hero (cream layout with portrait)
   ────────────────────────────────────────────────────────── */
function BioHero({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Biographie · Méthode TMS®",
      h1: ["Le geste juste,", "au bon endroit."],
      sub: "Praticien manuel depuis 2006, Grégory Tordjman a développé la Méthode TMS® au contact du terrain — une approche précise, mobile et attentive aux limites de chaque personne. 9 000+ corps accompagnés, 230+ thérapeutes formés.",
      cta: "Demander une consultation privée",
      ctaSec: "Découvrir la Méthode TMS®",
      ctaSecHref: "/fr#contact",
    },
    EN: {
      eyebrow: "Biography · Méthode TMS®",
      h1: ["The right gesture,", "in the right place."],
      sub: "A hands-on practitioner since 2006, Grégory Tordjman developed the Méthode TMS® through field experience — a precise, mobile approach attentive to each person's boundaries. 9,000+ bodies supported, 230+ therapists trained.",
      cta: "Request a private consultation",
      ctaSec: "Discover the Méthode TMS®",
      ctaSecHref: "/en#contact",
    },
    ES: {
      eyebrow: "Biografía · Método TMS®",
      h1: ["El gesto preciso,", "en el lugar justo."],
      sub: "Practicante manual desde 2006, Grégory Tordjman desarrolló el Método TMS® desde la experiencia de campo — un enfoque preciso, móvil y atento a los límites de cada persona. 9.000+ cuerpos acompañados, 230+ terapeutas formados.",
      cta: "Solicitar una consulta privada",
      ctaSec: "Descubrir el Método TMS®",
      ctaSecHref: "/es#contact",
    },
  }[lang];

  return (
    <section className="bio-hero" id="top">
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
              <a href="#contact" className="btn-primary" id="bio-hero-cta">
                <span>{t.cta}</span>
                <Arrow />
              </a>
              <a href={t.ctaSecHref} className="btn-inline bio-hero__btn-sec" id="bio-hero-cta-sec">
                <span>{t.ctaSec}</span>
                <Arrow />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="bio-hero__photo" delay={0.18}>
          <Image
            src="/portrait.webp"
            alt="Portrait de Grégory Tordjman, créateur de la Méthode TMS®"
            fill
            priority
            sizes="(max-width: 920px) 100vw, 46vw"
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
          />
          <span className="bio-hero__cap eyebrow eyebrow--gold">Méthode TMS® · Depuis 2014</span>
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
   02 — Origine (parcours)
   ────────────────────────────────────────────────────────── */
function BioOrigine({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "01 — Origine",
      title: "Un parcours construit par le corps.",
      lines: [
        "Suisse, Burkina Faso, Espagne, Guadeloupe. Grégory Tordjman n'a pas suivi une formation linéaire — il a appris par les corps. Depuis 2006, il exerce en tant que praticien manuel et accompagne des particuliers, des voyageurs et des équipes hospitality aux quatre coins du monde.",
        "Chaque culture a ajouté une couche de lecture. Chaque rencontre a affiné le geste. Ce que d'autres appellent une technique, il l'a construit comme un langage — jusqu'à créer la Méthode TMS® en 2014, après des années de terrain et de transmission.",
        "Aujourd'hui, 9 000+ corps accompagnés et 230+ thérapeutes formés. Une exigence constante : observer avant d'agir, adapter le geste et orienter lorsque la situation appelle un autre professionnel de santé.",
      ],
    },
    EN: {
      eyebrow: "01 — Origin",
      title: "A path built by the body.",
      lines: [
        "Switzerland, Burkina Faso, Spain, Guadeloupe. Grégory Tordjman did not follow a linear path — he learned through bodies. Since 2006, he has practised as a hands-on practitioner, supporting private clients, travellers and hospitality teams around the world.",
        "Each culture added a layer of reading. Each encounter refined the gesture. What others call technique, he built as a language — until founding the Méthode TMS® in 2014, after years of field work and transmission.",
        "Today: 9,000+ bodies supported and 230+ therapists trained. The same discipline throughout: observe before acting, adapt the gesture and refer whenever a healthcare professional should take priority.",
      ],
    },
    ES: {
      eyebrow: "01 — Origen",
      title: "Un camino construido por el cuerpo.",
      lines: [
        "Suiza, Burkina Faso, España, Guadalupe. Grégory Tordjman no siguió una formación lineal — aprendió a través de los cuerpos. Desde 2006, ejerce como practicante manual, acompañando a particulares, viajeros y equipos de hospitality en todo el mundo.",
        "Cada cultura añadió una capa de lectura. Cada encuentro refinó el gesto. Lo que otros llaman técnica, él lo construyó como un lenguaje — hasta crear el Método TMS® en 2014, tras años de trabajo de campo y transmisión.",
        "Hoy: 9.000+ cuerpos acompañados y 230+ terapeutas formados. Una exigencia constante: observar antes de actuar, adaptar el gesto y orientar cuando debe priorizarse otro profesional de la salud.",
      ],
    },
  }[lang];

  return (
    <section className="bio-origine">
      <div className="container">
        <div className="bio-origine__inner">
          <div className="bio-origine__left">
            <Reveal>
              <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="section-title bio-origine__title">{t.title}</h2>
            </Reveal>
          </div>
          <div className="bio-origine__right">
            {t.lines.map((line, i) => (
              <Reveal key={i} delay={0.15 + i * 0.12}>
                <p className="bio-text">{line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   03 — Méthode TMS® (naissance)
   ────────────────────────────────────────────────────────── */
function BioMethode({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "02 — Méthode TMS®",
      title: "Comment est née la Méthode TMS® ?",
      sub: "Créée en 2014 après des années de terrain. Pas une promesse. Une lecture et un geste adaptés.",
      body: [
        "La Méthode TMS® s'est structurée au fil d'une pratique commencée en 2006, par l'observation répétée des postures, des mobilités et des réactions au toucher. Elle est officiellement créée en 2014, formalisée, enseignée et transmise depuis.",
        "Grégory considère la respiration, l'organisation corporelle, les zones de tension et le contexte exprimé par la personne. Cette lecture oriente la séance sans prétendre établir un diagnostic.",
        "Chaque intervention est adaptée au moment, au confort et aux limites de la personne. Lorsque la situation dépasse ce cadre, l'orientation vers un professionnel de santé prime.",
      ],
      items: [
        { num: "01", label: "Posture & Appuis", desc: "Observer comment le corps s'organise dans l'espace." },
        { num: "02", label: "Muscles & Fascias", desc: "Repérer les zones de tension et leur réponse au geste." },
        { num: "03", label: "Mobilité", desc: "Adapter le travail à l'aisance disponible, sans forcer." },
        { num: "04", label: "Respiration", desc: "Tenir compte du rythme et du relâchement perçu." },
        { num: "05", label: "Contexte", desc: "Écouter l'expérience, les attentes et les limites exprimées." },
      ],
    },
    EN: {
      eyebrow: "02 — Méthode TMS®",
      title: "How did the Méthode TMS® emerge?",
      sub: "Founded in 2014 after years of field practice. Not a promise. An adapted reading and gesture.",
      body: [
        "The Méthode TMS® took shape through professional practice begun in 2006 and repeated observation of posture, mobility and responses to touch. It was formally founded in 2014, and has been taught and transmitted ever since.",
        "Grégory considers breathing, body organisation, areas of tension and the context described by the person. This reading guides the session without claiming to provide a diagnosis.",
        "Each intervention is adapted to the moment, comfort and individual boundaries. When a situation exceeds this scope, referral to a healthcare professional takes priority.",
      ],
      items: [
        { num: "01", label: "Posture & Support", desc: "Observe how the body organises itself in space." },
        { num: "02", label: "Muscles & Fascia", desc: "Notice areas of tension and their response to touch." },
        { num: "03", label: "Mobility", desc: "Adapt the work to available ease without forcing." },
        { num: "04", label: "Breathing", desc: "Consider rhythm and the perceived ability to release." },
        { num: "05", label: "Context", desc: "Listen to the person's experience, expectations and boundaries." },
      ],
    },
    ES: {
      eyebrow: "02 — Método TMS®",
      title: "¿Cómo nació el Método TMS®?",
      sub: "Creado en 2014 tras años de práctica de campo. No una promesa. Una lectura y un gesto adaptados.",
      body: [
        "El Método TMS® se estructuró a través de una práctica profesional iniciada en 2006 y de la observación repetida de la postura, la movilidad y las respuestas al tacto. Fue fundado formalmente en 2014 y ha sido enseñado y transmitido desde entonces.",
        "Grégory considera la respiración, la organización corporal, las zonas de tensión y el contexto expresado por la persona. Esta lectura orienta la sesión sin pretender establecer un diagnóstico.",
        "Cada intervención se adapta al momento, al confort y a los límites individuales. Cuando una situación supera este marco, se prioriza la orientación a un profesional sanitario.",
      ],
      items: [
        { num: "01", label: "Postura y apoyos", desc: "Observar cómo se organiza el cuerpo en el espacio." },
        { num: "02", label: "Músculos y fascias", desc: "Percibir las zonas de tensión y su respuesta al gesto." },
        { num: "03", label: "Movilidad", desc: "Adaptar el trabajo a la soltura disponible, sin forzar." },
        { num: "04", label: "Respiración", desc: "Tener en cuenta el ritmo y la relajación percibida." },
        { num: "05", label: "Contexto", desc: "Escuchar la experiencia, las expectativas y los límites expresados." },
      ],
    },
  }[lang];

  return (
    <section className="bio-methode">
      <div className="container">
        <div className="bio-methode__head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title bio-methode__title">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="bio-methode__sub">{t.sub}</p>
          </Reveal>
        </div>

        <div className="bio-methode__body">
          <div className="bio-methode__texts">
            {t.body.map((p, i) => (
              <Reveal key={i} delay={0.1 + i * 0.1}>
                <p className="bio-text">{p}</p>
              </Reveal>
            ))}
          </div>
          <div className="bio-methode__pillars">
            {t.items.map((item, i) => (
              <Reveal className="bio-pillar" key={i} delay={0.1 + i * 0.07}>
                <span className="bio-pillar__num">{item.num}</span>
                <div className="bio-pillar__content">
                  <p className="bio-pillar__label">{item.label}</p>
                  <p className="bio-pillar__desc">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   04 — Chiffres clés (TrustBar style)
   ────────────────────────────────────────────────────────── */
function BioStats({ lang }: { lang: Language }) {
  const stats = {
    FR: [
      { value: "9 000+", label: "Corps accompagnés" },
      { value: "230+", label: "Thérapeutes formés" },
      { value: "465", label: "Workshops animés" },
      { value: "2014", label: "Méthode TMS® créée" },
    ],
    EN: [
      { value: "9,000+", label: "Bodies supported" },
      { value: "230+", label: "Therapists trained" },
      { value: "465", label: "Workshops delivered" },
      { value: "2014", label: "Méthode TMS® founded" },
    ],
    ES: [
      { value: "9.000+", label: "Cuerpos acompañados" },
      { value: "230+", label: "Terapeutas formados" },
      { value: "465", label: "Workshops realizados" },
      { value: "2014", label: "Método TMS® creado" },
    ],
  }[lang];

  return (
    <section className="trust-bar bio-stats">
      <div className="container">
        <Reveal>
          <div className="trust-bar__stats">
            {stats.map((stat, i) => (
              <div className="trust-bar__stat" key={i}>
                <span className="trust-bar__value">{stat.value}</span>
                <span className="trust-bar__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   05 — Vision (soulager sans interrompre)
   ────────────────────────────────────────────────────────── */
function BioVision({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "03 — Vision",
      title: "Soulager sans interrompre l'expérience.",
      body: [
        "Un déplacement. Un séjour. Une saison chargée. Le corps ne s'arrête pas à la porte de l'hôtel.",
        "Grégory intervient là où l'expérience doit rester intacte. Sa présence est discrète. Son action est précise. L'agenda du client n'est pas perturbé.",
        "Ce que ses clients retiennent : la continuité. Pas une pause dans le séjour — une partie du séjour.",
      ],
    },
    EN: {
      eyebrow: "03 — Vision",
      title: "Relief without interrupting the experience.",
      body: [
        "A long journey. An extended stay. A demanding season. The body doesn't stop at the hotel door.",
        "Grégory intervenes where the experience must remain intact. His presence is discreet. His action is precise. The client's schedule is not disrupted.",
        "What his clients remember: continuity. Not a pause in the stay — part of the stay.",
      ],
    },
    ES: {
      eyebrow: "03 — Visión",
      title: "Aliviar sin interrumpir la experiencia.",
      body: [
        "Un desplazamiento. Una estancia. Una temporada exigente. El cuerpo no se detiene en la puerta del hotel.",
        "Grégory interviene donde la experiencia debe permanecer intacta. Su presencia es discreta. Su acción es precisa. La agenda del cliente no se ve perturbada.",
        "Lo que sus clientes recuerdan: la continuidad. No una pausa en la estancia — parte de la estancia.",
      ],
    },
  }[lang];

  return (
    <section className="bio-vision">
      <div className="bio-vision__grid">
        <Reveal className="bio-vision__photo">
          <Image
            src="/practice-01.webp"
            alt="Intervention de thérapie manuelle dans un cadre premium"
            fill
            sizes="(max-width: 920px) 100vw, 42vw"
            style={{ objectFit: "cover", objectPosition: "center 35%" }}
          />
        </Reveal>
        <div className="bio-vision__text">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title section-title--cream bio-vision__title">{t.title}</h2>
          </Reveal>
          {t.body.map((p, i) => (
            <Reveal key={i} delay={0.15 + i * 0.1}>
              <p className="bio-text bio-text--light">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   06 — Présence internationale (environments style)
   ────────────────────────────────────────────────────────── */
function BioPresence({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "04 — Présence internationale",
      title: "Là où le corps a besoin de répondre.",
      sub: "Grégory se déplace. Il n'attend pas que le client vienne à lui.",
      items: [
        { num: "01", name: "Hôtels d'exception" },
        { num: "02", name: "Villas privées" },
        { num: "03", name: "Yachts" },
        { num: "04", name: "Conciergeries" },
        { num: "05", name: "Clients VIP" },
        { num: "06", name: "Équipes spa" },
      ],
    },
    EN: {
      eyebrow: "04 — International presence",
      title: "Where the body needs to respond.",
      sub: "Grégory travels. He doesn't wait for the client to come to him.",
      items: [
        { num: "01", name: "Premier hotels" },
        { num: "02", name: "Private villas" },
        { num: "03", name: "Yachts" },
        { num: "04", name: "Conciergeries" },
        { num: "05", name: "VIP clients" },
        { num: "06", name: "Spa teams" },
      ],
    },
    ES: {
      eyebrow: "04 — Presencia internacional",
      title: "Donde el cuerpo necesita responder.",
      sub: "Grégory se desplaza. No espera que el cliente venga a él.",
      items: [
        { num: "01", name: "Hoteles de lujo" },
        { num: "02", name: "Villas privadas" },
        { num: "03", name: "Yates" },
        { num: "04", name: "Concierges" },
        { num: "05", name: "Clientes VIP" },
        { num: "06", name: "Equipos spa" },
      ],
    },
  }[lang];

  return (
    <section className="environments bio-presence">
      <div className="container">
        <div className="environments-head">
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
        <div className="environments-grid">
          {t.items.map((item, i) => (
            <Reveal className="environment-card" key={i} delay={0.1 + i * 0.05}>
              <span className="environment-num">{item.num}</span>
              <h3 className="environment-name">{item.name}</h3>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   07 — CTA final (brand signature style)
   ────────────────────────────────────────────────────────── */
function BioCta({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Méthode TMS® · Créée en 2014 · Pratique depuis 2006",
      title: "Une demande privée.\nUne réponse personnelle.",
      sub: "Chaque demande est lue personnellement et replacée dans son contexte. 9 000+ corps accompagnés, 230+ thérapeutes formés, 465 workshops animés.",
      cta: "Demander une consultation privée",
      phone: "+33 6 65 51 77 35",
    },
    EN: {
      eyebrow: "Méthode TMS® · Founded 2014 · Since 2006",
      title: "A private request.\nA personal response.",
      sub: "Each request is personally reviewed and considered in its context. 9,000+ bodies supported, 230+ therapists trained, 465 workshops delivered.",
      cta: "Request a private consultation",
      phone: "+33 6 65 51 77 35",
    },
    ES: {
      eyebrow: "Método TMS® · Creado en 2014 · Desde 2006",
      title: "Una solicitud privada.\nUna respuesta personal.",
      sub: "Cada solicitud se revisa personalmente y se considera en su contexto. 9.000+ cuerpos acompañados, 230+ terapeutas formados, 465 workshops realizados.",
      cta: "Solicitar una consulta privada",
      phone: "+33 6 65 51 77 35",
    },
  }[lang];

  return (
    <section className="brand-sig bio-cta" id="bio-cta-section">
      <div className="brand-sig__bg" aria-hidden="true" />
      <div className="container">
        <Reveal className="brand-sig__inner bio-cta__inner">
          <div className="brand-sig__logo-wrap">
            <div className="brand-sig__logo-ring" aria-hidden="true" />
            <Image
              src="/logo-badge.png"
              alt="Thérapie Manuelle Reboutement & Massage by Grégory Tordjman — Logo officiel Méthode TMS®"
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
              <h2 className="brand-sig__headline bio-cta__headline">{t.title}</h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="brand-sig__sub">{t.sub}</p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="brand-sig__cta-row">
                <a href="#contact" className="btn-primary" id="bio-cta-final">
                  <span>{t.cta}</span>
                  <Arrow />
                </a>
                <a href={`tel:${t.phone.replace(/\s/g, "")}`} className="brand-sig__note bio-cta__phone">
                  {t.phone}
                </a>
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
export default function BiographyPage({ initialLang }: { initialLang: Language }) {
  const lang = initialLang;

  useEffect(() => {
    document.documentElement.setAttribute("data-density", "editorial");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "cream");
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  return (
    <>
      <SharedHeader lang={lang} activePage="biography" heroStyle="light" />
      <main>
        <BioHero lang={lang} />
        <BioOrigine lang={lang} />
        <BioMethode lang={lang} />
        <BioStats lang={lang} />
        <BioVision lang={lang} />
        <BioPresence lang={lang} />
        <BioCta lang={lang} />
        <SharedContactForm lang={lang} id="contact" />
      </main>
      <SharedFooter lang={lang} />
    </>
  );
}
