"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SharedHeader from "@/components/SharedHeader";
import SharedFooter from "@/components/SharedFooter";
import MobileStickyCta from "@/components/campaign/MobileStickyCta";
import { CDMX_PRIVATE_SESSION_CAMPAIGNS, CDMX_WHATSAPP_URL, CDMX_WHATSAPP_PHONE_DISPLAY } from "@/data/campaign-landings";
import { RESET_CORPORAL_AEO_QUESTIONS } from "@/data/reset-corporal-aeo";
import { trackGrowthEvent } from "@/lib/growth/tracking";

const config = CDMX_PRIVATE_SESSION_CAMPAIGNS.es;

/* ─────────────────────────────────────────────────────────────────────────
   REVEAL HOOK — fade-up on scroll (same pattern as home)
───────────────────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setShown(true); io.disconnect(); }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
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
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; delay?: number; children: React.ReactNode }) {
  const [ref, shown] = useReveal();
  const s: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(22px)",
    transition: `opacity .75s cubic-bezier(.25,.1,.25,1) ${delay}s, transform .75s cubic-bezier(.25,.1,.25,1) ${delay}s`,
    ...style,
  };
  return <Tag ref={ref} className={className} style={s} {...rest}>{children}</Tag>;
}

/* ─────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────── */
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
      <polyline points="1,5.5 5,9.5 13,1" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   01 · HERO — full-bleed dark, photo + vignette forêt
───────────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="lp-hero" id="top" aria-label="Hero French Body Reset CDMX">
      <div className="lp-hero__photo" aria-hidden="true">
        <Image
          src="/hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 30%", filter: "saturate(.85) contrast(1.02) brightness(.88)" }}
        />
        <div className="lp-hero__vignette" />
      </div>

      <div className="lp-hero__inner">
        <div className="lp-hero__content">
          <Reveal delay={0.05}>
            <span className="eyebrow eyebrow--gold lp-hero__eyebrow">CDMX · Sesión privada</span>
          </Reveal>
          <Reveal delay={0.18}>
            <h1 className="lp-hero__title">
              <span className="hh-line">French Body</span>
              <span className="hh-line hh-italic">Reset en Ciudad</span>
              <span className="hh-line">de México</span>
            </h1>
          </Reveal>
          <Reveal delay={0.32}>
            <p className="lp-hero__sub">
              No es un masaje tradicional. Es una sesión manual profunda en CDMX: un trabajo preciso y personalizado para liberar la tensión corporal, ayudar al cuerpo a bajar tensión y recuperar calma, ligereza y respiración.
            </p>
          </Reveal>
          <Reveal delay={0.44}>
            <div className="lp-hero__ctas">
              <a
                href={CDMX_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary lp-hero__cta-primary"
                id="hero-cta-book"
                aria-label="Reservar sesión de French Body Reset por WhatsApp"
              >
                <WhatsAppIcon />
                <span>Reservar por WhatsApp</span>
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.54}>
            <p className="lp-hero__proof">Método francés · Preciso · Profundo · Personalizado</p>
          </Reveal>
        </div>

        <div className="lp-hero__meta" aria-hidden="true">
          <div className="lp-hero__meta-row">
            <span className="eyebrow eyebrow--faint">Grégory Tordjman</span>
            <span className="lp-hero__meta-dot">·</span>
            <span className="eyebrow eyebrow--faint">Desde 2014</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <svg width="10" height="36" viewBox="0 0 10 36" fill="none">
          <line x1="5" y1="0" x2="5" y2="26" stroke="currentColor" strokeWidth="0.6" />
          <polyline points="1.5,22 5,30 8.5,22" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </svg>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   02 · MANIFESTE — crème, filigrane logo (style Problem de la home)
───────────────────────────────────────────────────────────────────────── */
function Manifeste() {
  return (
    <section className="lp-manifeste" aria-label="No es un masaje">
      <div className="container container--narrow lp-manifeste__inner">
        <div className="lp-manifeste__watermark" aria-hidden="true">
          <Image src="/logo-badge.png" alt="" width={300} height={300} />
        </div>
        <Reveal>
          <h2 className="lp-manifeste__title">
            No es un masaje.<br />Es un reset del cuerpo.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lp-manifeste__lead">
            Es un trabajo corporal premium, profundo, preciso y personalizado. No es relajación superficial: es una sesión manual profunda en CDMX que lee el cuerpo antes de actuar — tensión corporal, respiración, movilidad y calma.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lp-manifeste__body">
            Una alternativa premium al masaje tradicional para quienes buscan un trabajo manual más profundo, preciso y personalizado. Es una terapia manual no médica: cada sesión se adapta a lo que el cuerpo presenta ese día y no sustituye una consulta médica. Conoce el enfoque de{" "}
            <Link href="/es" className="lp-inline-link">French Body Reset</Link>{" "}
            y la trayectoria de{" "}
            <Link href="/es/biografia" className="lp-inline-link">Grégory Tordjman</Link>.
          </p>
        </Reveal>
        <Reveal delay={0.26}>
          <ul className="lp-manifeste__points" role="list">
            {[
              "Lectura del cuerpo antes de intervenir",
              "Trabajo manual profundo, preciso y calibrado",
              "Enfoque en tensión, respiración y sistema nervioso",
              "Personalizado: cada sesión es diferente",
            ].map((pt) => (
              <li key={pt} className="lp-manifeste__point">
                <span className="lp-manifeste__check"><CheckIcon /></span>
                {pt}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   03 · TRUST BAR — chiffres clés sur fond ink (identique à la home)
───────────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "9,000+", label: "Cuerpos acompañados" },
  { value: "230+", label: "Terapeutas formados" },
  { value: "Desde 2014", label: "Experiencia profesional" },
  { value: "CDMX", label: "Sesiones privadas disponibles" },
];

function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Prueba social">
      <div className="container">
        <Reveal>
          <div className="trust-bar__stats">
            {STATS.map((s) => (
              <div key={s.value} className="trust-bar__stat">
                <span className="trust-bar__value">{s.value}</span>
                <span className="trust-bar__label">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="trust-bar__guarantees">
            {["Método francés", "Sin promesa médica", "Reserva por WhatsApp", "Atención premium"].map((g) => (
              <span key={g} className="trust-bar__guarantee">
                <CheckIcon />
                {g}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   04 · OFFRES — grille éditoriale style practices de la home
───────────────────────────────────────────────────────────────────────── */
function Offres() {
  return (
    <section className="lp-offers" aria-label="Dos formatos disponibles" id="opciones">
      <div className="container">
        <div className="lp-offers__head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">Dos formatos</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title lp-offers__title">Elige tu sesión Body Reset</h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="section-sub">Una sola calidad. Dos intensidades según lo que tu cuerpo necesita hoy.</p>
          </Reveal>
        </div>

        <div className="lp-offers__grid">
          {/* Card Fix */}
          <Reveal className="lp-offer-card" delay={0}>
            <div className="lp-offer-card__image">
              <Image
                src="/practice-01.webp"
                alt="Body Reset Fix — sesión puntual"
                fill
                sizes="(max-width: 920px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: "center 35%", filter: "saturate(.85) contrast(1.02)" }}
              />
            </div>
            <div className="lp-offer-card__body">
              <div className="lp-offer-card__meta">
                <span className="eyebrow eyebrow--gold">01 — Sesión puntual</span>
              </div>
              <h3 className="lp-offer-card__title">Body Reset Fix</h3>
              <p className="lp-offer-card__desc">
                Ideal si quieres trabajar una zona prioritaria: espalda cargada, cuello rígido, hombros, zona lumbar o tensión acumulada. Una sesión precisa, más profunda que un masaje convencional, para desbloquear lo esencial.
              </p>
              <ul className="lp-offer-card__list" role="list">
                {["Zona de trabajo: espalda, cuello, hombros o lumbar", "Lectura corporal previa", "Trabajo manual profundo y calibrado"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                href={CDMX_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary lp-offer-card__cta"
                id="offer-fix-cta"
                aria-label="Reservar Body Reset Fix por WhatsApp"
              >
                <WhatsAppIcon />
                <span>Reservar Body Reset Fix</span>
              </a>
            </div>
          </Reveal>

          {/* Card Full */}
          <Reveal className="lp-offer-card lp-offer-card--featured" delay={0.12}>
            <div className="lp-offer-card__image">
              <Image
                src="/portrait.webp"
                alt="Body Reset Full — experiencia completa"
                fill
                sizes="(max-width: 920px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: "center 20%", filter: "saturate(.85) contrast(1.02)" }}
              />
              <span className="lp-offer-card__badge">Más completo</span>
            </div>
            <div className="lp-offer-card__body">
              <div className="lp-offer-card__meta">
                <span className="eyebrow eyebrow--gold">02 — Reset profundo</span>
              </div>
              <h3 className="lp-offer-card__title">Body Reset Full</h3>
              <p className="lp-offer-card__desc">
                Una sesión más completa para resetear el cuerpo en profundidad: espalda, cuello, hombros, pelvis, respiración y sistema nervioso. Ideal si sientes el cuerpo cargado o saturado.
              </p>
              <ul className="lp-offer-card__list" role="list">
                {["Trabajo global: espalda, cuello, pelvis, hombros", "Trabajo de respiración y sistema nervioso", "Sesión más completa y personalizada"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                href={CDMX_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary lp-offer-card__cta"
                id="offer-full-cta"
                aria-label="Reservar Body Reset Full por WhatsApp"
              >
                <WhatsAppIcon />
                <span>Reservar Body Reset Full</span>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.22}>
          <div className="lp-offers__footer">
            <p className="lp-offers__footer-note">
              ¿No sabes cuál elegir? Escríbenos por WhatsApp y te orientamos entre Body Reset Fix o Body Reset Full.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   04b · PREGUNTAS RÁPIDAS (AEO) — cartes courtes, style éditorial premium
───────────────────────────────────────────────────────────────────────── */
function QuickQuestions() {
  return (
    <section className="lp-aeo" aria-label="Preguntas rápidas antes de reservar">
      <div className="container">
        <div className="lp-aeo__head">
          <Reveal><span className="eyebrow eyebrow--gold">Antes de reservar</span></Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title lp-aeo__title">Preguntas rápidas antes de reservar</h2>
          </Reveal>
        </div>
        <div className="lp-aeo__grid">
          {RESET_CORPORAL_AEO_QUESTIONS.map((item, i) => (
            <Reveal key={item.q} className="lp-aeo__card" delay={0.06 + i * 0.06}>
              <h3 className="lp-aeo__q">{item.q}</h3>
              <p className="lp-aeo__a">{item.a}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   05 · PARA TI SI — profiles style (ink bg + items numérotés)
───────────────────────────────────────────────────────────────────────── */
const FOR_YOU = [
  { italic: "Sientes la espalda cargada", note: "tensión acumulada, rigidez, pesadez" },
  { italic: "Tienes cuello rígido y hombros tensos", note: "contracturas, movilidad limitada, molestia persistente o tensión recurrente" },
  { italic: "Tu cuerpo se siente bloqueado", note: "sensación de bloqueo, falta de fluidez" },
  { italic: "Acumulas estrés físico o mental", note: "ritmo intenso, sobre-estimulación, fatiga profunda" },
  { italic: "Buscas algo más profundo que un masaje", note: "más que un masaje terapéutico en Ciudad de México: no relajación superficial, sino trabajo real" },
  { italic: "Quieres atención premium personalizada", note: "experiencia seria, precisa, adaptada a ti" },
];

function ForYouIf() {
  return (
    <section className="profiles lp-foryou" aria-label="Para quién es esta sesión">
      <div className="profiles-grid">
        <div className="profiles-text">
          <Reveal>
            <span className="eyebrow eyebrow--gold">Para ti si…</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title section-title--cream" style={{ margin: "14px 0 56px", maxWidth: "14ch" }}>
              Tu cuerpo habla.<br />¿Lo escuchas?
            </h2>
          </Reveal>

          <ul className="profiles-list" role="list">
            {FOR_YOU.map((item, i) => (
              <Reveal as="li" key={item.italic} delay={0.12 + i * 0.07} className="profile-row">
                <span className="profile-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="profile-rule" style={{ width: "48px" }} />
                <div className="profile-text">
                  <p className="profile-italic">{item.italic}</p>
                  <p className="profile-note">{item.note}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.65}>
            <div className="section-cta-row section-cta-row--light">
              <a
                href={CDMX_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-inline btn-inline--light"
                id="foryou-cta"
              >
                <span>Reservar por WhatsApp</span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                  <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
                </svg>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="profiles-photo" delay={0.1}>
          <Image
            src="/practice-01.webp"
            alt="Sesión de French Body Reset — trabajo manual profundo"
            fill
            sizes="(max-width: 920px) 100vw, 45vw"
            style={{ objectFit: "cover", objectPosition: "center 30%", filter: "brightness(.95) saturate(.85)" }}
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   06 · BENEFITS — 4 cartes blanc sur crème avec hover
───────────────────────────────────────────────────────────────────────── */
const BENEFITS = [
  { num: "01", title: "Menos estrés mental", body: "El sistema nervioso se regula. La mente se calma cuando el cuerpo suelta la tensión acumulada." },
  { num: "02", title: "Cuerpo más ligero", body: "Las tensiones profundas se liberan. El cuerpo recupera su fluidez, amplitud y naturalidad." },
  { num: "03", title: "Mejor respiración", body: "El trabajo en caja torácica y diafragma devuelve amplitud respiratoria real, no superficial." },
  { num: "04", title: "Más energía y claridad", body: "Cuando el cuerpo no gasta energía sosteniendo tensión, la vitalidad y la claridad mental vuelven." },
];

function Benefits() {
  return (
    <section className="lp-benefits" aria-label="Beneficios de la sesión">
      <div className="container">
        <div className="lp-benefits__head">
          <Reveal><span className="eyebrow eyebrow--gold">Qué cambia</span></Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title lp-benefits__title">Lo que puedes sentir después</h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="section-sub lp-benefits__note">Los resultados son individuales y no constituyen una promesa médica.</p>
          </Reveal>
        </div>
        <div className="environments-grid lp-benefits__grid">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.num} className="lp-benefit-item" delay={0.08 + i * 0.07}>
              <span className="environment-num">{b.num}</span>
              <h3 className="environment-name">{b.title}</h3>
              <p className="lp-benefit-body">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   07 · PROCESSUS — horizontal how-it-works (comme la home)
───────────────────────────────────────────────────────────────────────── */
const STEPS = [
  { word: "Escribe", sub: "Envía un WhatsApp con tu disponibilidad y lo que sientes" },
  { word: "Orienta", sub: "Recibe orientación personalizada: Fix o Full según tu situación" },
  { word: "Confirma", sub: "Confirma tu sesión privada. Reserva simple, sin complicaciones" },
  { word: "Reset", sub: "Vive tu sesión de French Body Reset en un espacio privado en CDMX" },
];

function Processus() {
  return (
    <section className="how lp-process" aria-label="Proceso de reserva" id="reservar">
      <div className="container">
        <Reveal>
          <div className="how-eyebrow">
            <span className="eyebrow eyebrow--gold">Reserva simple · Atención premium</span>
          </div>
        </Reveal>
        <div className="how-grid">
          {STEPS.map((s, i) => (
            <Reveal key={s.word} className="how-step" delay={i * 0.09}>
              <p className="how-word">{s.word}</p>
              <p className="how-sub">{s.sub}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="lp-process__cta">
            <a
              href={CDMX_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              id="process-cta"
              aria-label="Reservar sesión de French Body Reset por WhatsApp"
            >
              <WhatsAppIcon />
              <span>Reservar por WhatsApp</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   08 · CORPORATE — carte discrète style teams de la home
───────────────────────────────────────────────────────────────────────── */
function Corporate() {
  return (
    <section className="teams lp-corporate" aria-label="Corporate y hospitality">
      <div className="container container--narrow">
        <Reveal><span className="eyebrow eyebrow--gold" style={{ marginBottom: "24px", display: "block" }}>Corporate & Hospitality</span></Reveal>
        <Reveal delay={0.1}>
          <h2 className="teams-headline">Sesiones privadas para<br /><em>clientes VIP y equipos</em></h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="teams-body">
            Sesiones privadas para clientes VIP, hoteles, hospitality, residencias, eventos y equipos. Atención discreta, premium y completamente personalizada.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="section-cta-row" style={{ marginTop: "36px" }}>
            <a
              href={CDMX_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              id="corporate-cta"
              aria-label="Reservar sesión corporativa de French Body Reset por WhatsApp"
            >
              <WhatsAppIcon />
              <span>Reservar por WhatsApp</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   09 · FAQ — accordéon éditorial
───────────────────────────────────────────────────────────────────────── */
const FAQ = [
  {
    q: "¿Es un masaje tradicional?",
    a: "No. French Body Reset es un trabajo manual profundo y preciso, diferente de un masaje de spa o relajación. Comienza con una lectura del cuerpo y se adapta a lo que el cuerpo presenta ese día.",
  },
  {
    q: "¿Cuál es la diferencia entre Body Reset Fix y Body Reset Full?",
    a: "Body Reset Fix es una sesión puntual enfocada en una zona prioritaria (espalda, cuello, hombros o lumbar). Body Reset Full es una sesión más completa que trabaja el cuerpo globalmente — espalda, cuello, pelvis, respiración y sistema nervioso.",
  },
  {
    q: "¿Dónde se realiza la sesión en CDMX?",
    a: "La sesión se realiza en un espacio privado en CDMX. La ubicación exacta se confirma por WhatsApp al reservar, según disponibilidad y condiciones del lugar.",
  },
  {
    q: "¿Puedo escribir antes de reservar?",
    a: "Sí. Puedes escribir directamente por WhatsApp para hacer preguntas, pedir orientación sobre qué formato te conviene, o confirmar disponibilidad sin ningún compromiso.",
  },
  {
    q: "¿Qué pasa si tengo dolor fuerte o una lesión?",
    a: "Esta sesión no sustituye diagnóstico ni tratamiento médico. Si tienes una lesión, dolor intenso o condición médica importante, consulta primero con un profesional de salud.",
  },
];

function FaqItem({ item, index }: { item: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`campaign-faq__item${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="campaign-faq__question"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        id={`faq-btn-${index}`}
        aria-controls={`faq-ans-${index}`}
      >
        <span>{item.q}</span>
        <span className="campaign-faq__icon" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="campaign-faq__answer" id={`faq-ans-${index}`}>{item.a}</p>
      )}
    </article>
  );
}

function Faq() {
  return (
    <section className="campaign-faq lp-faq" aria-label="Preguntas frecuentes">
      <div className="container container--narrow">
        <Reveal>
          <span className="eyebrow eyebrow--gold">Preguntas</span>
          <h2 className="section-title" style={{ marginTop: "14px" }}>Preguntas frecuentes</h2>
        </Reveal>
        <div className="campaign-faq__list">
          {FAQ.map((item, i) => (
            <FaqItem key={item.q} item={item} index={i} />
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="lp-faq__compliance">
            <p className="lp-faq__compliance-text">
              <strong>Nota:</strong> Esta sesión no sustituye diagnóstico ni tratamiento médico. Si tienes una lesión, dolor intenso o condición médica importante, consulta primero con un profesional de salud.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   10 · BRAND SIGNATURE — logo + claim (style home)
───────────────────────────────────────────────────────────────────────── */
function BrandSignature() {
  return (
    <section className="brand-sig lp-brand-sig" aria-label="French Body Reset by Grégory Tordjman">
      <div className="brand-sig__bg" aria-hidden="true" />
      <div className="container">
        <Reveal className="brand-sig__inner">
          <div className="brand-sig__logo-wrap">
            <div className="brand-sig__logo-ring" aria-hidden="true" />
            <Image
              src="/logo-badge.png"
              alt="French Body Reset — Grégory Tordjman — méthode manuelle française"
              width={300}
              height={300}
              className="brand-sig__logo-img"
            />
          </div>
          <div className="brand-sig__copy">
            <Reveal delay={0.1}>
              <span className="eyebrow eyebrow--gold brand-sig__eyebrow">French Body Reset · CDMX</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="brand-sig__headline">
                Tu cuerpo no necesita más ruido. Necesita un reset preciso.
              </h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="brand-sig__sub">
                Reserva simple por WhatsApp. Sin formularios complicados. Atención premium en Ciudad de México.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="brand-sig__cta-row">
                <a
                  href={CDMX_WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  id="brand-sig-cta-book"
                  aria-label="Reservar sesión de French Body Reset por WhatsApp"
                >
                  <WhatsAppIcon />
                  <span>Reservar por WhatsApp</span>
                </a>
                <span className="brand-sig__note">{CDMX_WHATSAPP_PHONE_DISPLAY}</span>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────────────────────────────────── */
export default function ResetCorporalPage() {
  useEffect(() => {
    document.documentElement.setAttribute("data-density", "editorial");
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
      content_name: "reset_corporal_frances_cdmx_v2",
    });

    return () => { document.body.classList.remove("has-campaign-sticky"); };
  }, []);

  return (
    <>
      <SharedHeader
        lang="ES"
        activePage="seances"
        heroStyle="dark"
        ctaHrefOverride={CDMX_WHATSAPP_URL}
        ctaLabelOverride="Reservar"
        ctaExternal
      />

      <main id="main-content">
        <Hero />
        <Manifeste />
        <TrustBar />
        <Offres />
        <QuickQuestions />
        <ForYouIf />
        <Benefits />
        <Processus />
        <Corporate />
        <Faq />
        <BrandSignature />
      </main>

      <SharedFooter lang="ES" market="cdmx" />
      <MobileStickyCta config={config} singleCta />
    </>
  );
}
