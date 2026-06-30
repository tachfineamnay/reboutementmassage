"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Language } from "@/data/copy";
import MetaViewContent from "@/components/MetaViewContent";
import SharedHeader from "@/components/SharedHeader";
import SharedFooter from "@/components/SharedFooter";
import SharedContactForm from "@/components/SharedContactForm";
import { SESSION_FAQ, SESSION_PRECAUTIONS, type PublicLocale } from "@/data/service-content";

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
   01 — Hero (cream layout, portrait Grégory)
   ────────────────────────────────────────────────────────── */
function SeancesHero({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Séances privées · Méthode TMS®",
      h1: ["Une présence.", "Un geste précis."],
      sub: "Chaque séance est construite pour un corps, dans un contexte. Grégory se déplace — hôtel, villa, yacht, domicile — et intervient là où vous êtes.",
      cta: "Demander une séance",
      ctaSec: "Voir les tarifs",
      ctaSecHref: "#tarifs",
    },
    EN: {
      eyebrow: "Private sessions · Méthode TMS®",
      h1: ["One presence.", "One precise gesture."],
      sub: "Each session is built for one body, in one context. Grégory comes to you — hotel, villa, yacht, private residence — and intervenes where you are.",
      cta: "Request a session",
      ctaSec: "View rates",
      ctaSecHref: "#tarifs",
    },
    ES: {
      eyebrow: "Sesiones privadas · Método TMS®",
      h1: ["Una presencia.", "Un gesto preciso."],
      sub: "Cada sesión está construida para un cuerpo, en un contexto. Grégory se desplaza — hotel, villa, yate, domicilio — e interviene donde usted está.",
      cta: "Solicitar una sesión",
      ctaSec: "Ver tarifas",
      ctaSecHref: "#tarifs",
    },
  }[lang];

  return (
    <section className="bio-hero seances-hero" id="top">
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
              <a href="#demande" className="btn-primary" id="seances-hero-cta">
                <span>{t.cta}</span>
                <Arrow />
              </a>
              <a href={t.ctaSecHref} className="btn-inline bio-hero__btn-sec" id="seances-hero-sec">
                <span>{t.ctaSec}</span>
                <Arrow />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="bio-hero__photo" delay={0.18}>
          <Image
            src="/portrait.webp"
            alt={lang === "FR"
              ? "Grégory Tordjman en séance privée — Méthode TMS®"
              : lang === "EN"
              ? "Grégory Tordjman in a private session — Méthode TMS®"
              : "Grégory Tordjman en sesión privada — Método TMS®"}
            fill
            priority
            sizes="(max-width: 920px) 100vw, 46vw"
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
          />
          <span className="bio-hero__cap eyebrow eyebrow--gold">
            {lang === "FR" ? "Pratique professionnelle · Depuis 2006" : lang === "EN" ? "Professional practice · Since 2006" : "Práctica profesional · Desde 2006"}
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
   02 — Ce qu'est une séance (intro éditoriale)
   ────────────────────────────────────────────────────────── */
function SeanceIntro({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "01 — La séance",
      title: "Qu'est-ce qu'une séance\nMéthode TMS® ?",
      lines: [
        "Une séance Méthode TMS® est un accompagnement manuel personnalisé. Grégory observe le contexte, la posture, la mobilité et les zones de tension ressenties avant d'adapter son geste.",
        "Le travail reste progressif, attentif aux réactions et aux limites exprimées. Il vise le confort corporel et une meilleure aisance perçue, sans diagnostic ni promesse de résultat.",
        "Ce cadre ne remplace pas un suivi médical. Lorsque la situation l'exige, l'avis d'un professionnel de santé reste prioritaire.",
      ],
    },
    EN: {
      eyebrow: "01 — The session",
      title: "What is a\nMéthode TMS® session?",
      lines: [
        "A Méthode TMS® session is personalised hands-on support. Grégory considers the context, posture, mobility and areas of felt tension before adapting each gesture.",
        "The work remains progressive and attentive to individual responses and stated boundaries. It supports physical comfort and perceived ease without diagnosis or promises of results.",
        "This scope does not replace medical care. When the situation requires it, advice from a qualified healthcare professional takes priority.",
      ],
    },
    ES: {
      eyebrow: "01 — La sesión",
      title: "¿Qué es una sesión\ndel Método TMS®?",
      lines: [
        "Una sesión del Método TMS® es un acompañamiento manual personalizado. Grégory considera el contexto, la postura, la movilidad y las zonas de tensión percibidas antes de adaptar cada gesto.",
        "El trabajo es progresivo y atento a las reacciones y límites expresados. Favorece el confort corporal y la soltura percibida, sin diagnóstico ni promesas de resultado.",
        "Este marco no sustituye la atención médica. Cuando la situación lo exige, se prioriza la opinión de un profesional sanitario cualificado.",
      ],
    },
  }[lang];

  return (
    <section className="bio-origine seances-intro">
      <div className="container">
        <div className="bio-origine__inner">
          <div className="bio-origine__left">
            <Reveal>
              <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="section-title bio-origine__title seances-intro__title">{t.title}</h2>
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
   03 — Déroulé (how-it-works style, more detailed)
   ────────────────────────────────────────────────────────── */
function SeanceDeroule({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "02 — Déroulé",
      title: "Comment se passe une séance.",
      steps: [
        {
          num: "01",
          word: "Accueil.",
          sub: "Grégory intervient au créneau convenu, avec une installation adaptée au lieu : table transportable ou espace préparé sur place.",
        },
        {
          num: "02",
          word: "Lecture.",
          sub: "Quelques minutes d'observation et d'échange. Grégory ne suit pas un protocole standard — il lit ce que le corps présente à ce moment précis.",
        },
        {
          num: "03",
          word: "Travail.",
          sub: "Travail manuel progressif sur les zones retenues ensemble. L'intensité et la durée s'ajustent au confort, aux réactions et au contexte.",
        },
        {
          num: "04",
          word: "Transmission.",
          sub: "En fin de séance, quelques repères simples peuvent être proposés : mouvements, positions ou habitudes à observer au quotidien.",
        },
      ],
    },
    EN: {
      eyebrow: "02 — How it unfolds",
      title: "How a session takes place.",
      steps: [
        {
          num: "01",
          word: "Arrival.",
          sub: "Grégory works at the agreed time with a setup adapted to the setting: a portable table or a suitable space prepared on site.",
        },
        {
          num: "02",
          word: "Reading.",
          sub: "A few minutes of observation and exchange. Grégory doesn't follow a standard protocol — he reads what the body presents at that precise moment.",
        },
        {
          num: "03",
          word: "Work.",
          sub: "Progressive hands-on work on the areas agreed together. Intensity and duration adapt to comfort, responses and context.",
        },
        {
          num: "04",
          word: "Transmission.",
          sub: "At the end, simple guidance may be offered: movements, positions or habits to notice in everyday life.",
        },
      ],
    },
    ES: {
      eyebrow: "02 — El desarrollo",
      title: "Cómo transcurre una sesión.",
      steps: [
        {
          num: "01",
          word: "Llegada.",
          sub: "Grégory interviene en el horario acordado con una instalación adaptada al lugar: mesa portátil o un espacio adecuado preparado in situ.",
        },
        {
          num: "02",
          word: "Lectura.",
          sub: "Unos minutos de observación e intercambio. Grégory no sigue un protocolo estándar — lee lo que el cuerpo presenta en ese momento preciso.",
        },
        {
          num: "03",
          word: "Trabajo.",
          sub: "Trabajo manual progresivo sobre las zonas acordadas. La intensidad y la duración se adaptan al confort, las reacciones y el contexto.",
        },
        {
          num: "04",
          word: "Transmisión.",
          sub: "Al final pueden proponerse pautas sencillas: movimientos, posiciones o hábitos que observar en la vida cotidiana.",
        },
      ],
    },
  }[lang];

  return (
    <section className="seances-deroule">
      <div className="container">
        <div className="seances-deroule__head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title seances-deroule__title">{t.title}</h2>
          </Reveal>
        </div>
        <div className="seances-deroule__grid">
          {t.steps.map((s, i) => (
            <Reveal className="seances-step" key={i} delay={i * 0.08}>
              <span className="seances-step__num">{s.num}</span>
              <p className="seances-step__word">{s.word}</p>
              <p className="seances-step__sub">{s.sub}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   04 — Situations d'usage
   ────────────────────────────────────────────────────────── */
function SeanceIndications({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "03 — Situations",
      title: "Quand envisager\nun accompagnement manuel ?",
      sub: "La demande part d'un contexte et d'un ressenti, jamais d'un diagnostic établi par la séance.",
      items: [
        { num: "01", label: "Après un voyage", desc: "Raideur ressentie, fatigue corporelle ou besoin de retrouver des repères après un déplacement." },
        { num: "02", label: "Rythme soutenu", desc: "Période professionnelle ou personnelle exigeante, avec une sensation de tension accumulée." },
        { num: "03", label: "Après l'effort", desc: "Besoin de récupération et de confort après une activité physique, hors situation traumatique." },
        { num: "04", label: "Mobilité ressentie", desc: "Geste moins fluide ou inconfort dans certaines positions, sans signe nécessitant une urgence médicale." },
        { num: "05", label: "Séjour privé", desc: "Besoin d'une séance discrète, organisée sur place et adaptée à l'agenda." },
        { num: "06", label: "Prévention d'usage", desc: "Prendre un temps d'observation et recevoir des repères simples pour le quotidien." },
      ],
    },
    EN: {
      eyebrow: "03 — Indications",
      title: "When might hands-on\nsupport be considered?",
      sub: "The request begins with context and felt experience, never with a diagnosis made during the session.",
      items: [
        { num: "01", label: "After travel", desc: "Felt stiffness, physical fatigue or a need to regain bearings after a journey." },
        { num: "02", label: "Demanding schedule", desc: "An intense professional or personal period with a sense of accumulated tension." },
        { num: "03", label: "After exercise", desc: "A need for recovery and comfort after physical activity, outside any traumatic situation." },
        { num: "04", label: "Perceived mobility", desc: "Movement feels less fluid or certain positions feel uncomfortable, without medical warning signs." },
        { num: "05", label: "Private stay", desc: "A discreet on-site session organised around the guest's schedule." },
        { num: "06", label: "Everyday awareness", desc: "Time to observe the body and receive simple practical guidance." },
      ],
    },
    ES: {
      eyebrow: "03 — Indicaciones",
      title: "¿Cuándo considerar\nun acompañamiento manual?",
      sub: "La solicitud parte del contexto y de lo que se percibe, nunca de un diagnóstico realizado durante la sesión.",
      items: [
        { num: "01", label: "Después de un viaje", desc: "Rigidez percibida, fatiga corporal o necesidad de recuperar referencias tras un desplazamiento." },
        { num: "02", label: "Ritmo exigente", desc: "Una etapa profesional o personal intensa con sensación de tensión acumulada." },
        { num: "03", label: "Después del esfuerzo", desc: "Necesidad de recuperación y confort tras actividad física, fuera de una situación traumática." },
        { num: "04", label: "Movilidad percibida", desc: "Movimiento menos fluido o incomodidad en ciertas posiciones, sin señales de alarma médica." },
        { num: "05", label: "Estancia privada", desc: "Una sesión discreta in situ, organizada según la agenda del huésped." },
        { num: "06", label: "Atención cotidiana", desc: "Un tiempo de observación y pautas prácticas sencillas para el día a día." },
      ],
    },
  }[lang];

  return (
    <section className="environments seances-indications">
      <div className="container">
        <div className="environments-head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title seances-indications__title">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub">{t.sub}</p>
          </Reveal>
        </div>
        <div className="environments-grid seances-indications__grid">
          {t.items.map((item, i) => (
            <Reveal className="environment-card seances-indication-card" key={i} delay={0.1 + i * 0.05}>
              <span className="environment-num">{item.num}</span>
              <h3 className="environment-name">{item.label}</h3>
              <p className="seances-indication-card__desc">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   05 — Où (environments sombre)
   ────────────────────────────────────────────────────────── */
function SeanceOu({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "04 — Lieux d'intervention",
      title: "Grégory vient à vous.",
      sub: "Pas de déplacement à organiser. Pas de salle d'attente. La séance a lieu là où vous êtes — sans interruption de votre séjour.",
      items: [
        { num: "01", name: "Chambre d'hôtel" },
        { num: "02", name: "Suite & Penthouse" },
        { num: "03", name: "Villa privée" },
        { num: "04", name: "Yacht" },
        { num: "05", name: "Domicile" },
        { num: "06", name: "Espace spa privatif" },
      ],
    },
    EN: {
      eyebrow: "04 — Settings",
      title: "Grégory comes to you.",
      sub: "No travel to organise. No waiting room. The session takes place where you are — without interrupting your stay.",
      items: [
        { num: "01", name: "Hotel room" },
        { num: "02", name: "Suite & Penthouse" },
        { num: "03", name: "Private villa" },
        { num: "04", name: "Yacht" },
        { num: "05", name: "Private residence" },
        { num: "06", name: "Private spa space" },
      ],
    },
    ES: {
      eyebrow: "04 — Entornos de intervención",
      title: "Grégory viene a usted.",
      sub: "Sin desplazamiento que organizar. Sin sala de espera. La sesión tiene lugar donde usted está — sin interrumpir su estancia.",
      items: [
        { num: "01", name: "Habitación de hotel" },
        { num: "02", name: "Suite y Penthouse" },
        { num: "03", name: "Villa privada" },
        { num: "04", name: "Yate" },
        { num: "05", name: "Domicilio" },
        { num: "06", name: "Espacio spa privativo" },
      ],
    },
  }[lang];

  return (
    <section className="bio-vision seances-ou">
      <div className="bio-vision__grid seances-ou__grid">
        <Reveal className="bio-vision__photo">
          <Image
            src="/practice-01.webp"
            alt={lang === "FR"
              ? "Séance Méthode TMS® dans un cadre premium — hôtel ou villa"
              : lang === "EN"
              ? "Méthode TMS® session in a premium setting — hotel or villa"
              : "Sesión Método TMS® en un entorno premium — hotel o villa"}
            fill
            sizes="(max-width: 920px) 100vw, 42vw"
            style={{ objectFit: "cover", objectPosition: "center 35%" }}
          />
        </Reveal>
        <div className="bio-vision__text seances-ou__text">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title section-title--cream bio-vision__title">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="bio-text bio-text--light">{t.sub}</p>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="seances-ou__list">
              {t.items.map((item, i) => (
                <span className="seances-ou__item" key={i}>
                  <span className="seances-ou__num">{item.num}</span>
                  <span className="seances-ou__name">{item.name}</span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   06 — Tarifs (cards sobres)
   ────────────────────────────────────────────────────────── */
function SeanceTarifs({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "05 — Tarifs",
      title: "Des séances sans compromis.",
      sub: "Les tarifs incluent le déplacement dans la zone définie. Facturation à la séance. Discrétion assurée.",
      items: [
        {
          name: "Séance individuelle",
          duration: "60 – 75 min",
          desc: "Séance personnalisée selon le contexte, le confort et les zones retenues ensemble. Déplacement inclus dans la zone convenue.",
          price: "Sur devis",
          tag: "01",
        },
        {
          name: "Séance approfondie",
          duration: "90 – 120 min",
          desc: "Temps élargi pour une première rencontre, un échange approfondi et un travail manuel progressif.",
          price: "Sur devis",
          tag: "02",
        },
        {
          name: "Suivi régulier",
          duration: "Forfait mensuel",
          desc: "Organisation sur mesure pour clients récurrents, sportifs ou voyageurs fréquents, selon les disponibilités.",
          price: "Sur devis",
          tag: "03",
        },
        {
          name: "Intervention groupe",
          duration: "Équipe / Famille",
          desc: "Plusieurs séances consécutives sur une même journée. Hôtel, villa, yacht. Organisation selon contraintes.",
          price: "Sur devis",
          tag: "04",
        },
      ],
      note: "Les tarifs et conditions de déplacement sont précisés après étude du contexte.",
    },
    EN: {
      eyebrow: "05 — Rates",
      title: "Sessions without compromise.",
      sub: "Rates include travel within the defined zone. Per-session billing. Discretion guaranteed.",
      items: [
        {
          name: "Individual session",
          duration: "60 – 75 min",
          desc: "A personalised session based on context, comfort and the areas agreed together. Travel included within the agreed zone.",
          price: "On request",
          tag: "01",
        },
        {
          name: "In-depth session",
          duration: "90 – 120 min",
          desc: "Extended time for a first meeting, a more detailed discussion and progressive hands-on work.",
          price: "On request",
          tag: "02",
        },
        {
          name: "Regular follow-up",
          duration: "Monthly package",
          desc: "Tailored organisation for regular clients, athletes or frequent travellers, subject to availability.",
          price: "On request",
          tag: "03",
        },
        {
          name: "Group intervention",
          duration: "Team / Family",
          desc: "Several consecutive sessions on the same day. Hotel, villa, yacht. Organisation based on constraints.",
          price: "On request",
          tag: "04",
        },
      ],
      note: "Rates and travel conditions are specified after the context has been reviewed.",
    },
    ES: {
      eyebrow: "05 — Tarifas",
      title: "Sesiones sin compromisos.",
      sub: "Las tarifas incluyen el desplazamiento en la zona definida. Facturación por sesión. Discreción garantizada.",
      items: [
        {
          name: "Sesión individual",
          duration: "60 – 75 min",
          desc: "Sesión personalizada según el contexto, el confort y las zonas acordadas. Desplazamiento incluido en la zona convenida.",
          price: "A petición",
          tag: "01",
        },
        {
          name: "Sesión en profundidad",
          duration: "90 – 120 min",
          desc: "Tiempo ampliado para un primer encuentro, una conversación detallada y un trabajo manual progresivo.",
          price: "A petición",
          tag: "02",
        },
        {
          name: "Seguimiento regular",
          duration: "Forfait mensual",
          desc: "Organización a medida para clientes recurrentes, deportistas o viajeros frecuentes, según disponibilidad.",
          price: "A petición",
          tag: "03",
        },
        {
          name: "Intervención en grupo",
          duration: "Equipo / Familia",
          desc: "Varias sesiones consecutivas en un mismo día. Hotel, villa, yate. Organización según necesidades.",
          price: "A petición",
          tag: "04",
        },
      ],
      note: "Las tarifas y condiciones de desplazamiento se precisan después de revisar el contexto.",
    },
  }[lang];

  return (
    <section className="seances-tarifs" id="tarifs">
      <div className="container">
        <div className="seances-tarifs__head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title seances-tarifs__title">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub">{t.sub}</p>
          </Reveal>
        </div>

        <div className="seances-tarifs__grid">
          {t.items.map((item, i) => (
            <Reveal className="seances-tarif-card" key={i} delay={0.1 + i * 0.08}>
              <div className="seances-tarif-card__top">
                <span className="seances-tarif-card__tag">{item.tag}</span>
                <span className="seances-tarif-card__duration eyebrow eyebrow--gold">{item.duration}</span>
              </div>
              <h3 className="seances-tarif-card__name">{item.name}</h3>
              <p className="seances-tarif-card__desc">{item.desc}</p>
              <div className="seances-tarif-card__footer">
                <span className="seances-tarif-card__price">{item.price}</span>
                <a href="#demande" className="btn-inline seances-tarif-card__cta" id={`tarif-cta-${i}`}>
                  <Arrow />
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <p className="seances-tarifs__note">{t.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   07 — Stats (trust-bar)
   ────────────────────────────────────────────────────────── */
function SeanceStats({ lang }: { lang: Language }) {
  const stats = {
    FR: [
      { value: "Depuis 2006", label: "Pratique professionnelle" },
      { value: "Mobile", label: "Hôtel, villa, yacht, domicile" },
      { value: "Sur mesure", label: "Contexte et limites considérés" },
      { value: "Confidentiel", label: "Échanges et organisation" },
    ],
    EN: [
      { value: "Since 2006", label: "Professional practice" },
      { value: "Mobile", label: "Hotel, villa, yacht, residence" },
      { value: "Bespoke", label: "Context and boundaries considered" },
      { value: "Confidential", label: "Exchange and organisation" },
    ],
    ES: [
      { value: "Desde 2006", label: "Práctica profesional" },
      { value: "Móvil", label: "Hotel, villa, yate, domicilio" },
      { value: "A medida", label: "Contexto y límites considerados" },
      { value: "Confidencial", label: "Intercambio y organización" },
    ],
  }[lang];

  return (
    <section className="trust-bar seances-stats">
      <div className="container">
        <Reveal>
          <div className="trust-bar__stats">
            {stats.map((s, i) => (
              <div className="trust-bar__stat" key={i}>
                <span className="trust-bar__value">{s.value}</span>
                <span className="trust-bar__label">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   08 — Témoignages clients (serif italic)
   ────────────────────────────────────────────────────────── */
function SeanceCommitments({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "06 — Engagements",
      title: "Ce qui encadre chaque séance.",
      items: [
        {
          quote: "Écouter avant d'intervenir. Comprendre le contexte, les attentes et les limites exprimées.",
          author: "Premier principe",
          location: "Observation",
        },
        {
          quote: "Adapter le geste. L'intensité n'est jamais un objectif et la séance évolue selon les réactions de la personne.",
          author: "Deuxième principe",
          location: "Adaptation",
        },
        {
          quote: "Respecter le cadre. Ne pas diagnostiquer, ne pas promettre et orienter lorsque la situation demande un avis médical.",
          author: "Troisième principe",
          location: "Responsabilité",
        },
      ],
    },
    EN: {
      eyebrow: "06 — Commitments",
      title: "What frames every session.",
      items: [
        {
          quote: "Listen before intervening. Understand the context, expectations and boundaries expressed by the person.",
          author: "First principle",
          location: "Observation",
        },
        {
          quote: "Adapt the gesture. Intensity is never the objective and the session evolves with the person's responses.",
          author: "Second principle",
          location: "Adaptation",
        },
        {
          quote: "Respect the scope. Do not diagnose or promise, and refer whenever the situation calls for medical advice.",
          author: "Third principle",
          location: "Responsibility",
        },
      ],
    },
    ES: {
      eyebrow: "06 — Compromisos",
      title: "Lo que enmarca cada sesión.",
      items: [
        {
          quote: "Escuchar antes de intervenir. Comprender el contexto, las expectativas y los límites expresados.",
          author: "Primer principio",
          location: "Observación",
        },
        {
          quote: "Adaptar el gesto. La intensidad nunca es el objetivo y la sesión evoluciona según las reacciones de la persona.",
          author: "Segundo principio",
          location: "Adaptación",
        },
        {
          quote: "Respetar el marco. No diagnosticar ni prometer y orientar cuando la situación requiere una consulta médica.",
          author: "Tercer principio",
          location: "Responsabilidad",
        },
      ],
    },
  }[lang];

  return (
    <section className="ws-citations seances-citations">
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

function SeanceFaqAndPrecautions({ lang }: { lang: Language }) {
  const locale = lang.toLowerCase() as PublicLocale;
  const faq = SESSION_FAQ[locale];
  const precautions = SESSION_PRECAUTIONS[locale];

  return (
    <>
      <section className="seances-faq" id="faq">
        <div className="container container--narrow">
          <Reveal>
            <span className="eyebrow eyebrow--gold">FAQ</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title">
              {lang === "FR"
                ? "Questions fréquentes sur la séance."
                : lang === "EN"
                  ? "Frequently asked questions about the session."
                  : "Preguntas frecuentes sobre la sesión."}
            </h2>
          </Reveal>
          <div className="seances-faq__list">
            {faq.map((item, index) => (
              <Reveal className="seances-faq__item" key={item.question} delay={0.12 + index * 0.08}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="seances-precautions">
        <div className="container container--narrow">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{precautions.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title">{precautions.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub">{precautions.intro}</p>
          </Reveal>
          <ul className="seances-precautions__list">
            {precautions.points.map((point, index) => (
              <Reveal as="li" key={point} delay={0.18 + index * 0.06}>
                {point}
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.36}>
            <p className="seances-precautions__sources">
              <a href="https://www.ameli.fr/assure/sante/themes/lombalgie-aigue" target="_blank" rel="noreferrer">
                {precautions.medicalLinkLabel}
              </a>
              <span aria-hidden="true"> · </span>
              <a
                href="https://www.service-public.fr/particuliers/actualites/A17758?lang=fr"
                target="_blank"
                rel="noreferrer"
              >
                {precautions.emergencyLinkLabel}
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────────────────
   09 — CTA final
   ────────────────────────────────────────────────────────── */
function SeanceCta({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Méthode TMS® · Séances privées · Pratique depuis 2006",
      title: "Une demande.\nUne étude personnelle.",
      sub: "Grégory replace chaque demande dans son contexte avant de proposer un échange ou une séance.",
      cta: "Demander une séance privée",
      phone: "+33 6 65 51 77 35",
      note: "International sur demande",
    },
    EN: {
      eyebrow: "Méthode TMS® · Private sessions · Practising since 2006",
      title: "One request.\nA personal review.",
      sub: "Grégory considers each request in context before proposing a conversation or session.",
      cta: "Request a private session",
      phone: "+33 6 65 51 77 35",
      note: "International on request",
    },
    ES: {
      eyebrow: "Método TMS® · Sesiones privadas · Práctica desde 2006",
      title: "Una solicitud.\nUna revisión personal.",
      sub: "Grégory considera cada solicitud en su contexto antes de proponer una conversación o una sesión.",
      cta: "Solicitar una sesión privada",
      phone: "+33 6 65 51 77 35",
      note: "Internacional bajo solicitud",
    },
  }[lang];

  return (
    <section className="brand-sig seances-cta" id="seances-cta-section">
      <div className="brand-sig__bg" aria-hidden="true" />
      <div className="container">
        <Reveal className="brand-sig__inner seances-cta__inner">
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
              <h2 className="brand-sig__headline seances-cta__headline">{t.title}</h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="brand-sig__sub">{t.sub}</p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="brand-sig__cta-row">
                <a href="#demande" className="btn-primary" id="seances-cta-final">
                  <span>{t.cta}</span>
                  <Arrow />
                </a>
                <div className="seances-cta__contact">
                  <a href={`tel:${t.phone.replace(/\s/g, "")}`} className="brand-sig__note bio-cta__phone">
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

/* ──────────────────────────────────────────────────────────
   Root export
   ────────────────────────────────────────────────────────── */
export default function SeancesPage({ initialLang }: { initialLang: Language }) {
  const lang = initialLang;

  useEffect(() => {
    document.documentElement.setAttribute("data-density", "editorial");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "cream");
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  return (
    <>
      <MetaViewContent contentName="private_sessions" contentCategory="manual_therapy" lang={lang} />
      <SharedHeader lang={lang} activePage="seances" heroStyle="light" />
      <main>
        <SeancesHero lang={lang} />
        <SeanceIntro lang={lang} />
        <SeanceDeroule lang={lang} />
        <SeanceIndications lang={lang} />
        <SeanceOu lang={lang} />
        <SeanceTarifs lang={lang} />
        <SeanceStats lang={lang} />
        <SeanceCommitments lang={lang} />
        <SeanceFaqAndPrecautions lang={lang} />
        <SeanceCta lang={lang} />
        <SharedContactForm lang={lang} id="demande" />
      </main>
      <SharedFooter lang={lang} />
    </>
  );
}
