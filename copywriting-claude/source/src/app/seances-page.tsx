"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Language } from "@/data/copy";
import SharedHeader from "@/components/SharedHeader";
import SharedFooter from "@/components/SharedFooter";
import SharedContactForm from "@/components/SharedContactForm";

/* ──────────────────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────────────────── */
const LANGUAGE_ROUTES: Record<Language, string> = {
  FR: "/fr",
  EN: "/en",
  ES: "/es",
};

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
      h1: ["Une présence.", "Un soulagement précis."],
      sub: "Chaque séance est construite pour un corps, dans un contexte. Grégory se déplace — hôtel, villa, yacht, domicile — et intervient là où vous êtes.",
      cta: "Demander une séance",
      ctaSec: "Voir les tarifs",
      ctaSecHref: "#tarifs",
    },
    EN: {
      eyebrow: "Private sessions · Méthode TMS®",
      h1: ["One presence.", "One precise relief."],
      sub: "Each session is built for one body, in one context. Grégory comes to you — hotel, villa, yacht, private residence — and intervenes where you are.",
      cta: "Request a session",
      ctaSec: "View rates",
      ctaSecHref: "#tarifs",
    },
    ES: {
      eyebrow: "Sesiones privadas · Método TMS®",
      h1: ["Una presencia.", "Un alivio preciso."],
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
            {lang === "FR" ? "Depuis 2014 · 9 000+ corps" : lang === "EN" ? "Since 2014 · 9,000+ bodies" : "Desde 2014 · 9.000+ cuerpos"}
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
      title: "Pas un massage. Pas une consultation.\nQuelque chose de plus précis.",
      lines: [
        "Une séance Méthode TMS® commence par une lecture. Grégory observe, palpe, écoute — avant même d'intervenir.",
        "Structure osseuse, chaînes musculaires, fascias, posture, respiration, terrain émotionnel. Tout est pris en compte. Rien n'est ignoré.",
        "Le travail est manuel, direct, calibré. L'objectif n'est pas la détente — c'est la libération. Deux choses très différentes.",
      ],
    },
    EN: {
      eyebrow: "01 — The session",
      title: "Not a massage. Not a consultation.\nSomething more precise.",
      lines: [
        "A Méthode TMS® session begins with a reading. Grégory observes, palpates, listens — before intervening.",
        "Bone structure, muscle chains, fascia, posture, breathing, emotional terrain. Everything is considered. Nothing is ignored.",
        "The work is manual, direct, calibrated. The goal is not relaxation — it's release. Two very different things.",
      ],
    },
    ES: {
      eyebrow: "01 — La sesión",
      title: "No es un masaje. No es una consulta.\nAlgo más preciso.",
      lines: [
        "Una sesión del Método TMS® comienza con una lectura. Grégory observa, palpa, escucha — antes de intervenir.",
        "Estructura ósea, cadenas musculares, fascias, postura, respiración, terreno emocional. Todo se tiene en cuenta. Nada se ignora.",
        "El trabajo es manual, directo, calibrado. El objetivo no es la relajación — es la liberación. Dos cosas muy diferentes.",
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
          sub: "Grégory arrive à l'heure convenue. Pas de retard, pas d'installation compliquée. Une table de soin transportable ou la surface disponible sur place.",
        },
        {
          num: "02",
          word: "Lecture.",
          sub: "Quelques minutes d'observation et d'échange. Grégory ne suit pas un protocole standard — il lit ce que le corps présente à ce moment précis.",
        },
        {
          num: "03",
          word: "Travail.",
          sub: "Intervention manuelle directe. Structure, muscles, fascias, système nerveux. Durée ajustée selon les besoins — 60 à 90 minutes en général.",
        },
        {
          num: "04",
          word: "Transmission.",
          sub: "En fin de séance, quelques repères simples : postures, gestes, habitudes. Pour que l'effet du soin dure au-delà de la session.",
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
          sub: "Grégory arrives at the agreed time. No delays, no complicated setup. A portable treatment table or the available surface on site.",
        },
        {
          num: "02",
          word: "Reading.",
          sub: "A few minutes of observation and exchange. Grégory doesn't follow a standard protocol — he reads what the body presents at that precise moment.",
        },
        {
          num: "03",
          word: "Work.",
          sub: "Direct manual intervention. Structure, muscles, fascia, nervous system. Duration adjusted to needs — typically 60 to 90 minutes.",
        },
        {
          num: "04",
          word: "Transmission.",
          sub: "At the end of the session, a few simple markers: postures, movements, habits. So that the effect of the session lasts beyond the session itself.",
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
          sub: "Grégory llega a la hora acordada. Sin retrasos, sin instalación complicada. Una mesa de tratamiento portátil o la superficie disponible en el lugar.",
        },
        {
          num: "02",
          word: "Lectura.",
          sub: "Unos minutos de observación e intercambio. Grégory no sigue un protocolo estándar — lee lo que el cuerpo presenta en ese momento preciso.",
        },
        {
          num: "03",
          word: "Trabajo.",
          sub: "Intervención manual directa. Estructura, músculos, fascias, sistema nervioso. Duración ajustada según las necesidades — generalmente 60 a 90 minutos.",
        },
        {
          num: "04",
          word: "Transmisión.",
          sub: "Al final de la sesión, algunos marcadores simples: posturas, movimientos, hábitos. Para que el efecto de la sesión dure más allá de la sesión.",
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
   04 — Indications (ce que la séance traite)
   ────────────────────────────────────────────────────────── */
function SeanceIndications({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "03 — Indications",
      title: "Ce que le corps vous dit.\nCe que la séance écoute.",
      sub: "La Méthode TMS® n'est pas un catalogue de symptômes. Chaque situation est lue dans sa globalité.",
      items: [
        { num: "01", label: "Dos & Lombaires", desc: "Blocages lombaires, douleurs chroniques, hernies discales, contractures profondes." },
        { num: "02", label: "Nuque & Épaules", desc: "Tensions cervicales, raideur, céphalées de tension, épaule bloquée." },
        { num: "03", label: "Fatigue profonde", desc: "Épuisement physique, récupération post-voyage, jet lag, surmenage professionnel." },
        { num: "04", label: "Posture & Équilibre", desc: "Désaxages posturaux, compensation chronique, déséquilibres gauche/droite." },
        { num: "05", label: "Système digestif", desc: "Tensions abdominales, transit lent, lourdeurs, stress viscéral." },
        { num: "06", label: "Charge émotionnelle", desc: "Stress accumulé, tensions liées à l'anxiété, corps sous pression." },
      ],
    },
    EN: {
      eyebrow: "03 — Indications",
      title: "What the body is telling you.\nWhat the session listens to.",
      sub: "The Méthode TMS® is not a catalogue of symptoms. Each situation is read in its entirety.",
      items: [
        { num: "01", label: "Back & Lower back", desc: "Lumbar blockages, chronic pain, disc hernias, deep contractures." },
        { num: "02", label: "Neck & Shoulders", desc: "Cervical tension, stiffness, tension headaches, frozen shoulder." },
        { num: "03", label: "Deep fatigue", desc: "Physical exhaustion, post-travel recovery, jet lag, professional burnout." },
        { num: "04", label: "Posture & Balance", desc: "Postural misalignment, chronic compensation, left/right imbalances." },
        { num: "05", label: "Digestive system", desc: "Abdominal tension, slow transit, heaviness, visceral stress." },
        { num: "06", label: "Emotional load", desc: "Accumulated stress, anxiety-related tension, body under pressure." },
      ],
    },
    ES: {
      eyebrow: "03 — Indicaciones",
      title: "Lo que el cuerpo le dice.\nLo que la sesión escucha.",
      sub: "El Método TMS® no es un catálogo de síntomas. Cada situación se lee en su globalidad.",
      items: [
        { num: "01", label: "Espalda y lumbares", desc: "Bloqueos lumbares, dolores crónicos, hernias discales, contracturas profundas." },
        { num: "02", label: "Cuello y hombros", desc: "Tensiones cervicales, rigidez, cefaleas tensionales, hombro bloqueado." },
        { num: "03", label: "Fatiga profunda", desc: "Agotamiento físico, recuperación post-viaje, jet lag, sobrecarga profesional." },
        { num: "04", label: "Postura y equilibrio", desc: "Desalineaciones posturales, compensación crónica, desequilibrios izquierda/derecha." },
        { num: "05", label: "Sistema digestivo", desc: "Tensiones abdominales, tránsito lento, pesadez, estrés visceral." },
        { num: "06", label: "Carga emocional", desc: "Estrés acumulado, tensiones relacionadas con la ansiedad, cuerpo bajo presión." },
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
          desc: "Prise en charge complète selon lecture du corps ce jour-là. Déplacement inclus dans la zone.",
          price: "Sur devis",
          tag: "01",
        },
        {
          name: "Séance approfondie",
          duration: "90 – 120 min",
          desc: "Pour les cas complexes, douleurs chroniques ou première séance avec bilan initial complet.",
          price: "Sur devis",
          tag: "02",
        },
        {
          name: "Suivi régulier",
          duration: "Forfait mensuel",
          desc: "Programme sur-mesure pour clients récurrents, sportifs ou voyageurs fréquents. Disponibilité prioritaire.",
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
      note: "Tous les tarifs sont communiqués sur demande. Grégory répond personnellement sous 12h.",
    },
    EN: {
      eyebrow: "05 — Rates",
      title: "Sessions without compromise.",
      sub: "Rates include travel within the defined zone. Per-session billing. Discretion guaranteed.",
      items: [
        {
          name: "Individual session",
          duration: "60 – 75 min",
          desc: "Complete care based on body reading on that day. Travel included within the zone.",
          price: "On request",
          tag: "01",
        },
        {
          name: "In-depth session",
          duration: "90 – 120 min",
          desc: "For complex cases, chronic pain or first session with complete initial assessment.",
          price: "On request",
          tag: "02",
        },
        {
          name: "Regular follow-up",
          duration: "Monthly package",
          desc: "Tailored programme for regular clients, athletes or frequent travellers. Priority availability.",
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
      note: "All rates are communicated on request. Grégory replies personally within 12h.",
    },
    ES: {
      eyebrow: "05 — Tarifas",
      title: "Sesiones sin compromisos.",
      sub: "Las tarifas incluyen el desplazamiento en la zona definida. Facturación por sesión. Discreción garantizada.",
      items: [
        {
          name: "Sesión individual",
          duration: "60 – 75 min",
          desc: "Atención completa según la lectura corporal de ese día. Desplazamiento incluido en la zona.",
          price: "A petición",
          tag: "01",
        },
        {
          name: "Sesión en profundidad",
          duration: "90 – 120 min",
          desc: "Para casos complejos, dolores crónicos o primera sesión con evaluación inicial completa.",
          price: "A petición",
          tag: "02",
        },
        {
          name: "Seguimiento regular",
          duration: "Forfait mensual",
          desc: "Programa a medida para clientes recurrentes, deportistas o viajeros frecuentes. Disponibilidad prioritaria.",
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
      note: "Todas las tarifas se comunican a petición. Grégory responde personalmente en 12h.",
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
      { value: "9 000+", label: "Corps accompagnés" },
      { value: "12h", label: "Délai de réponse" },
      { value: "7j/7", label: "Disponibilité" },
      { value: "2014", label: "Depuis" },
    ],
    EN: [
      { value: "9,000+", label: "Bodies supported" },
      { value: "12h", label: "Response time" },
      { value: "7d/7", label: "Availability" },
      { value: "2014", label: "Since" },
    ],
    ES: [
      { value: "9.000+", label: "Cuerpos acompañados" },
      { value: "12h", label: "Tiempo de respuesta" },
      { value: "7d/7", label: "Disponibilidad" },
      { value: "2014", label: "Desde" },
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
function SeanceCitations({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "06 — Ressentis",
      title: "Ce qu'ils ont vécu.",
      items: [
        {
          quote: "J'avais un blocage lombaire depuis trois semaines. Après une seule séance dans ma chambre d'hôtel, je pouvais à nouveau me lever sans douleur.",
          author: "Client privé",
          location: "Monaco",
        },
        {
          quote: "Grégory est venu directement à bord. Professionnel, discret, efficace. Quelque chose s'est débloqué que je ne savais même pas retenir.",
          author: "Client yacht",
          location: "Méditerranée",
        },
        {
          quote: "Je voyage 200 jours par an. C'est la première fois que j'ai quelqu'un qui comprend ce que ça fait au corps — et qui sait quoi faire.",
          author: "Dirigeant international",
          location: "Paris / Dubaï / Genève",
        },
      ],
    },
    EN: {
      eyebrow: "06 — Experiences",
      title: "What they experienced.",
      items: [
        {
          quote: "I had a lumbar blockage for three weeks. After a single session in my hotel room, I could get up again without pain.",
          author: "Private client",
          location: "Monaco",
        },
        {
          quote: "Grégory came directly on board. Professional, discreet, effective. Something unlocked that I didn't even know I was holding.",
          author: "Yacht client",
          location: "Mediterranean",
        },
        {
          quote: "I travel 200 days a year. This is the first time I've had someone who understands what that does to the body — and knows what to do.",
          author: "International executive",
          location: "Paris / Dubai / Geneva",
        },
      ],
    },
    ES: {
      eyebrow: "06 — Experiencias",
      title: "Lo que vivieron.",
      items: [
        {
          quote: "Tenía un bloqueo lumbar desde hacía tres semanas. Después de una sola sesión en mi habitación de hotel, pude levantarme de nuevo sin dolor.",
          author: "Cliente privado",
          location: "Mónaco",
        },
        {
          quote: "Grégory vino directamente a bordo. Profesional, discreto, eficaz. Algo se desbloqueó que ni siquiera sabía que retenía.",
          author: "Cliente yate",
          location: "Mediterráneo",
        },
        {
          quote: "Viajo 200 días al año. Es la primera vez que tengo a alguien que entiende lo que eso le hace al cuerpo — y sabe qué hacer.",
          author: "Directivo internacional",
          location: "París / Dubái / Ginebra",
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

/* ──────────────────────────────────────────────────────────
   09 — CTA final
   ────────────────────────────────────────────────────────── */
function SeanceCta({ lang }: { lang: Language }) {
  const t = {
    FR: {
      eyebrow: "Méthode TMS® · Séances privées · Depuis 2014",
      title: "Une demande.\nUne réponse dans les 12h.",
      sub: "Grégory répond personnellement à chaque demande de séance. Discrétion absolue.",
      cta: "Demander une séance privée",
      phone: "+33 6 65 51 77 35",
      note: "7 jours sur 7 · International sur demande",
    },
    EN: {
      eyebrow: "Méthode TMS® · Private sessions · Since 2014",
      title: "One request.\nOne reply within 12h.",
      sub: "Grégory replies personally to every session request. Absolute discretion.",
      cta: "Request a private session",
      phone: "+33 6 65 51 77 35",
      note: "7 days a week · International on request",
    },
    ES: {
      eyebrow: "Método TMS® · Sesiones privadas · Desde 2014",
      title: "Una solicitud.\nUna respuesta en 12h.",
      sub: "Grégory responde personalmente a cada solicitud de sesión. Discreción absoluta.",
      cta: "Solicitar una sesión privada",
      phone: "+33 6 65 51 77 35",
      note: "7 días a la semana · Internacional bajo solicitud",
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
   Footer
   ────────────────────────────────────────────────────────── */
function Footer({ lang }: { lang: Language }) {
  const lines = {
    FR: [
      "Grégory Tordjman · Méthode TMS®",
      "Séances privées · Thérapie manuelle · Hospitality · Villas · Yachts",
      "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
      "International sur demande",
    ],
    EN: [
      "Grégory Tordjman · Méthode TMS®",
      "Private sessions · Manual therapy · Hospitality · Villas · Yachts",
      "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
      "International on request",
    ],
    ES: [
      "Grégory Tordjman · Método TMS®",
      "Sesiones privadas · Terapia manual · Hospitality · Villas · Yates",
      "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
      "Internacional bajo solicitud",
    ],
  }[lang];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-mark">
          <Image
            src="/logo--reboutement-tgrégory-tordjman.png"
            alt="Thérapie Manuelle Reboutement & Massage by Grégory Tordjman"
            width={120}
            height={120}
            className="footer-mark__img"
          />
        </div>
        <div className="footer-lines">
          {lines.map((l, i) => (
            <p key={i} className={i === 0 ? "footer-name" : "footer-line"}>{l}</p>
          ))}
        </div>
        <div className="footer-meta">
          <span className="eyebrow eyebrow--mute">© MMXXVI</span>
        </div>
      </div>
    </footer>
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
      <SharedHeader lang={lang} activePage="seances" heroStyle="light" />
      <main>
        <SeancesHero lang={lang} />
        <SeanceIntro lang={lang} />
        <SeanceDeroule lang={lang} />
        <SeanceIndications lang={lang} />
        <SeanceOu lang={lang} />
        <SeanceTarifs lang={lang} />
        <SeanceStats lang={lang} />
        <SeanceCitations lang={lang} />
        <SeanceCta lang={lang} />
        <SharedContactForm lang={lang} id="demande" />
      </main>
      <SharedFooter lang={lang} />
    </>
  );
}
