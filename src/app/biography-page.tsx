"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Language } from "@/data/copy";
import SharedHeader from "@/components/SharedHeader";

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
      sub: "Grégory Tordjman est praticien international en thérapie manuelle et créateur de la Méthode TMS® — une approche de précision développée auprès de plus de 9 000 corps.",
      cta: "Demander une consultation privée",
      ctaSec: "Découvrir la Méthode TMS®",
      ctaSecHref: "/fr#contact",
    },
    EN: {
      eyebrow: "Biography · Méthode TMS®",
      h1: ["The right gesture,", "in the right place."],
      sub: "Grégory Tordjman is an international manual therapy practitioner and creator of the Méthode TMS® — a precision approach developed across 9,000+ bodies.",
      cta: "Request a private consultation",
      ctaSec: "Discover the Méthode TMS®",
      ctaSecHref: "/en#contact",
    },
    ES: {
      eyebrow: "Biografía · Método TMS®",
      h1: ["El gesto preciso,", "en el lugar justo."],
      sub: "Grégory Tordjman es un terapeuta manual internacional y creador del Método TMS® — un enfoque de precisión desarrollado a través de más de 9.000 cuerpos.",
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
        "Suisse, Burkina Faso, Espagne, Guadeloupe. Grégory Tordjman n'a pas suivi une formation linéaire — il a appris par les corps.",
        "Chaque culture a ajouté une couche de lecture. Chaque rencontre a affiné le geste. Ce que d'autres appellent une technique, il l'a construit comme une langue.",
        "Dix ans de pratique intensive. Plus de 9 000 séances. Une méthode qui ne vient pas d'un manuel, mais du terrain.",
      ],
    },
    EN: {
      eyebrow: "01 — Origin",
      title: "A path built by the body.",
      lines: [
        "Switzerland, Burkina Faso, Spain, Guadeloupe. Grégory Tordjman did not follow a linear path — he learned through bodies.",
        "Each culture added a layer of reading. Each encounter refined the gesture. What others call technique, he built as a language.",
        "Ten years of intensive practice. Over 9,000 sessions. A method that doesn't come from a textbook, but from the field.",
      ],
    },
    ES: {
      eyebrow: "01 — Origen",
      title: "Un camino construido por el cuerpo.",
      lines: [
        "Suiza, Burkina Faso, España, Guadalupe. Grégory Tordjman no siguió una formación lineal — aprendió a través de los cuerpos.",
        "Cada cultura añadió una capa de lectura. Cada encuentro refinó el gesto. Lo que otros llaman técnica, él lo construyó como un lenguaje.",
        "Diez años de práctica intensiva. Más de 9.000 sesiones. Un método que no viene de un manual, sino del terreno.",
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
      title: "De l'expérience est née la Méthode TMS®.",
      sub: "Pas un protocole. Une lecture.",
      body: [
        "La Méthode TMS® n'a pas été conçue dans un laboratoire. Elle s'est imposée progressivement — session après session, corps après corps.",
        "Structure, muscles, fascias, posture, système nerveux, respiration, fatigue, digestion, équilibre émotionnel. Grégory ne traite pas un symptôme : il lit un ensemble.",
        "Chaque corps arrive avec sa propre histoire. Chaque intervention est construite pour ce corps-là, à ce moment-là. Rien n'est généralisé.",
      ],
      items: [
        { num: "01", label: "Structure & Fascias", desc: "Articulations, vertèbres, compensations profondes." },
        { num: "02", label: "Muscles & Posture", desc: "Tensions chroniques, déséquilibres, restrictions motrices." },
        { num: "03", label: "Système nerveux", desc: "Fatigue, sensibilité, réponse au stress, récupération." },
        { num: "04", label: "Respiration & Digestion", desc: "Présence viscérale, tonus, fluidité interne." },
        { num: "05", label: "Équilibre émotionnel", desc: "Ce que le corps porte, exprime et retient." },
      ],
    },
    EN: {
      eyebrow: "02 — Méthode TMS®",
      title: "From experience, the Méthode TMS® was born.",
      sub: "Not a protocol. A reading.",
      body: [
        "The Méthode TMS® was not designed in a laboratory. It emerged gradually — session after session, body after body.",
        "Structure, muscles, fascia, posture, nervous system, breathing, fatigue, digestion, emotional balance. Grégory doesn't treat a symptom: he reads a whole.",
        "Every body arrives with its own story. Every intervention is built for that body, at that moment. Nothing is generalised.",
      ],
      items: [
        { num: "01", label: "Structure & Fascia", desc: "Joints, vertebrae, deep compensations." },
        { num: "02", label: "Muscles & Posture", desc: "Chronic tensions, imbalances, motor restrictions." },
        { num: "03", label: "Nervous system", desc: "Fatigue, sensitivity, stress response, recovery." },
        { num: "04", label: "Breathing & Digestion", desc: "Visceral presence, tone, internal fluidity." },
        { num: "05", label: "Emotional balance", desc: "What the body carries, expresses and holds." },
      ],
    },
    ES: {
      eyebrow: "02 — Método TMS®",
      title: "De la experiencia nació el Método TMS®.",
      sub: "No un protocolo. Una lectura.",
      body: [
        "El Método TMS® no fue diseñado en un laboratorio. Emergió gradualmente — sesión tras sesión, cuerpo tras cuerpo.",
        "Estructura, músculos, fascias, postura, sistema nervioso, respiración, fatiga, digestión, equilibrio emocional. Grégory no trata un síntoma: lee un conjunto.",
        "Cada cuerpo llega con su propia historia. Cada intervención está construida para ese cuerpo, en ese momento. Nada está generalizado.",
      ],
      items: [
        { num: "01", label: "Estructura y fascias", desc: "Articulaciones, vértebras, compensaciones profundas." },
        { num: "02", label: "Músculos y postura", desc: "Tensiones crónicas, desequilibrios, restricciones motoras." },
        { num: "03", label: "Sistema nervioso", desc: "Fatiga, sensibilidad, respuesta al estrés, recuperación." },
        { num: "04", label: "Respiración y digestión", desc: "Presencia visceral, tono, fluidez interna." },
        { num: "05", label: "Equilibrio emocional", desc: "Lo que el cuerpo lleva, expresa y retiene." },
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
      { value: "2014", label: "Depuis" },
    ],
    EN: [
      { value: "9,000+", label: "Bodies supported" },
      { value: "230+", label: "Therapists trained" },
      { value: "465", label: "Workshops delivered" },
      { value: "2014", label: "Since" },
    ],
    ES: [
      { value: "9.000+", label: "Cuerpos acompañados" },
      { value: "230+", label: "Terapeutas formados" },
      { value: "465", label: "Workshops realizados" },
      { value: "2014", label: "Desde" },
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
      eyebrow: "Méthode TMS® · Depuis 2014",
      title: "Une demande privée.\nUne réponse personnelle.",
      sub: "Grégory vous répond personnellement sous 12h.",
      cta: "Demander une consultation privée",
      phone: "+33 6 65 51 77 35",
    },
    EN: {
      eyebrow: "Méthode TMS® · Since 2014",
      title: "A private request.\nA personal response.",
      sub: "Grégory replies personally within 12h.",
      cta: "Request a private consultation",
      phone: "+33 6 65 51 77 35",
    },
    ES: {
      eyebrow: "Método TMS® · Desde 2014",
      title: "Una solicitud privada.\nUna respuesta personal.",
      sub: "Grégory le responde personalmente en 12h.",
      cta: "Solicitar una consulta privada",
      phone: "+33 6 65 51 77 35",
    },
  }[lang];

  return (
    <section className="brand-sig bio-cta" id="contact">
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
                <a href={`/${lang.toLowerCase()}#contact`} className="btn-primary" id="bio-cta-final">
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

/* ──────────────────────────────────────────────────────────
   Footer — identical to landing page footer
   ────────────────────────────────────────────────────────── */
function Footer({ lang }: { lang: Language }) {
  const lines = {
    FR: [
      "Grégory Tordjman · Méthode TMS®",
      "Thérapie manuelle de soulagement · Hospitality · Villas · Yachting · Équipes",
      "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
      "International sur demande",
    ],
    EN: [
      "Grégory Tordjman · Méthode TMS®",
      "Manual relief therapy · Hospitality · Villas · Yachting · Teams",
      "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
      "International on request",
    ],
    ES: [
      "Grégory Tordjman · Método TMS®",
      "Terapia manual de alivio · Hospitality · Villas · Yachting · Equipos",
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
      </main>
      <Footer lang={lang} />
    </>
  );
}
