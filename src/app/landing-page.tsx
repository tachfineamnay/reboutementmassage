"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { COPY, Language } from "@/data/copy";
import SharedHeader from "@/components/SharedHeader";
import SharedContactForm from "@/components/SharedContactForm";

type LandingCopy = (typeof COPY)[Language];
const LANGUAGE_ROUTES: Record<Language, string> = {
  FR: "/fr",
  EN: "/en",
  ES: "/es",
};

/* ──────────────────────────────────────────────────────────
   Reveal-on-scroll hook (Framer-Motion-style fade-up)
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
   HandLogo SVG — the spiral-hand icon used as brand mark
   ────────────────────────────────────────────────────────── */
function HandLogo({ size = 46, className = "", color = "currentColor" }: { size?: number; className?: string; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="100" cy="100" r="94" stroke={color} strokeWidth="5" fill="none" />
      {/* Hand palm outline */}
      <path
        d="M90 52 C90 52, 82 52, 80 64 L74 108 C72 118, 58 120, 56 110 L52 88 C50 78, 62 74, 64 84 L66 96"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Fingers */}
      <line x1="88" y1="52" x2="88" y2="92" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="46" x2="100" y2="92" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="112" y1="50" x2="112" y2="92" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="124" y1="58" x2="122" y2="90" stroke={color} strokeWidth="5" strokeLinecap="round" />
      {/* Palm body */}
      <path
        d="M74 108 C74 120, 78 132, 86 140 C94 148, 106 152, 118 148 C130 144, 136 132, 134 118 L126 90"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Spiral in palm */}
      <path
        d="M100 118 C92 118, 88 112, 88 106 C88 98, 94 94, 100 94 C108 94, 112 100, 112 106 C112 114, 106 120, 98 122 C88 124, 82 118, 80 110 C78 100, 84 90, 96 88"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* Header moved to SharedHeader component */

/* ──────────────────────────────────────────────────────────
   Section 01 — Hero
   ────────────────────────────────────────────────────────── */
function Hero({ t, heroTreatment, layout }: { t: LandingCopy, heroTreatment: string, layout: string }) {
  const filter = useMemo(() => {
    if (heroTreatment === "duotone") return "grayscale(.6) sepia(.06) contrast(1.02) brightness(.96)";
    if (heroTreatment === "bw") return "grayscale(1) contrast(1.05) brightness(.94)";
    return "saturate(.9) contrast(1.02) brightness(.96)";
  }, [heroTreatment]);

  /* ── Layout B: Cream — type-led, portrait inset ── */
  if (layout === "cream") {
    return (
    <section className="hero hero--cream" id="top">
        <div className="hero-cream-grid">
          <div className="hero-cream-text">
            <Reveal delay={0.05}>
              <div className="eyebrow eyebrow--gold">{t.hero.eyebrow}</div>
            </Reveal>
            <Reveal delay={0.2}>
              <h1 className="hero-headline hero-headline--cream">
                <span className="hh-line">{t.hero.headline[0]}</span>
                <span className="hh-line hh-italic">{t.hero.headline[1]}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="hero-cta-group">
                <a href="#contact" className="btn-primary" id="hero-cta">
                  <span>{t.hero.cta}</span>
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                    <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
                  </svg>
                </a>
                <span className="hero-cta-note">{t.hero.ctaSub}</span>
              </div>
            </Reveal>
          </div>

          <Reveal className="hero-cream-photo" delay={0.2}>
            <Image
              src="/hero.webp"
              alt={t.imageAlts.hero}
              fill
              priority
              sizes="(max-width: 920px) 100vw, 45vw"
              style={{ objectFit: "cover", objectPosition: "center 28%", filter }}
            />
            <span className="hero-cream-cap eyebrow eyebrow--gold">Méthode TMS®</span>
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

  /* ── Layout A: Editorial — full-bleed dark hero ── */
  return (
    <section className="hero" id="top">
      <div className="hero-photo" aria-hidden="false">
        <Image
          src="/hero.webp"
          alt={t.imageAlts.hero}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 30%", filter }}
        />
        <div className="hero-vignette" />
      </div>

      <div className="hero-grid">
        <div className="hero-text">
          <Reveal delay={0.05}>
            <div className="eyebrow eyebrow--gold">{t.hero.eyebrow}</div>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="hero-headline">
              <span className="hh-line">{t.hero.headline[0]}</span>
              <span className="hh-line hh-italic">{t.hero.headline[1]}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="hero-cta-group">
              <a href="#contact" className="btn-primary" id="hero-cta-editorial">
                <span>{t.hero.cta}</span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                  <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
                </svg>
              </a>
              <span className="hero-cta-note hero-cta-note--light">{t.hero.ctaSub}</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.5} className="hero-meta">
          <div className="hero-meta-row">
            <span className="eyebrow eyebrow--faint">{t.hero.metaLocation}</span>
            <span className="hero-meta-dot" aria-hidden="true">·</span>
            <span className="eyebrow eyebrow--faint">{t.hero.metaSince}</span>
          </div>
        </Reveal>
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

/* ──────────────────────────────────────────────────────────
   Section 02 — Problem
   ────────────────────────────────────────────────────────── */
function Problem({ t }: { t: LandingCopy }) {
  return (
    <section className="problem">
      <div className="container container--narrow problem-container">
        {/* Watermark logo behind text */}
        <div className="problem-watermark" aria-hidden="true">
          <Image
            src="/logo-badge.png"
            alt=""
            width={280}
            height={280}
            className="problem-watermark__img"
            draggable={false}
          />
        </div>
        <Reveal>
          <p className="problem-lead">{t.problem[0]}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="problem-body">{t.problem[1]}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 02b — Trust Bar (chiffres clés + garanties)
   ────────────────────────────────────────────────────────── */
function TrustBar({ t }: { t: LandingCopy }) {
  return (
    <section className="trust-bar">
      <div className="container">
        <Reveal>
          <div className="trust-bar__stats">
            {t.trustBar.stats.map((stat: { value: string; label: string }, i: number) => (
              <div className="trust-bar__stat" key={i}>
                <span className="trust-bar__value">{stat.value}</span>
                <span className="trust-bar__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="trust-bar__guarantees">
            {t.trustBar.guarantees.map((g: string, i: number) => (
              <span className="trust-bar__guarantee" key={i}>
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
                  <polyline points="1,5.5 5,9.5 13,1" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {g}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 03 — Three Practices
   ────────────────────────────────────────────────────────── */
function Practices({ t }: { t: LandingCopy }) {
  const items = t.practices.items;
  return (
    <section className="practices">
      <div className="container">
        <div className="practices-head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.practices.label}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title">{t.practices.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub">{t.practices.sub}</p>
          </Reveal>
        </div>

        <div className="practices-grid">
          <Reveal className="practice practice--lead" delay={0}>
            <div className="practice-image">
              <Image
                src="/practice-01.webp"
                alt={t.imageAlts.practice}
                fill
                sizes="(max-width: 920px) 100vw, 55vw"
                style={{ objectFit: "cover", objectPosition: "center 35%" }}
              />
            </div>
            <div className="practice-body">
              <div className="practice-meta">
                <span className="eyebrow eyebrow--gold">{items[0].tag} — {items[0].label}</span>
              </div>
              <h3 className="practice-title">{items[0].title}</h3>
              <p className="practice-text">{items[0].body}</p>
            </div>
          </Reveal>

          <div className="practices-stack">
            <Reveal className="practice practice--small" delay={0.1}>
              <div className="practice-meta">
                <span className="eyebrow eyebrow--gold">{items[1].tag} — {items[1].label}</span>
              </div>
              <h3 className="practice-title practice-title--sm">{items[1].title}</h3>
              <p className="practice-text">{items[1].body}</p>
            </Reveal>

            <span className="rule-gold" />

            <Reveal className="practice practice--small" delay={0.2}>
              <div className="practice-meta">
                <span className="eyebrow eyebrow--gold">{items[2].tag} — {items[2].label}</span>
              </div>
              <h3 className="practice-title practice-title--sm">{items[2].title}</h3>
              <p className="practice-text">{items[2].body}</p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.25}>
          <div className="section-cta-row">
            <a href="#contact" className="btn-inline" id="practices-cta">
              <span>{t.practices.cta}</span>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 04 — Client Profiles
   ────────────────────────────────────────────────────────── */
function Profiles({ t }: { t: LandingCopy }) {
  return (
    <section className="profiles">
      <div className="profiles-grid">
        <div className="profiles-text">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.profiles.label}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title section-title--cream">{t.profiles.title}</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="section-sub section-sub--light">{t.profiles.sub}</p>
          </Reveal>

          <ul className="profiles-list">
            {t.profiles.items.map((p, i) => (
              <Reveal as="li" key={i} delay={0.15 + i * 0.08} className="profile-row">
                <span className="profile-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="profile-rule" />
                <div className="profile-text">
                  <p className="profile-italic">{p.italic}</p>
                  <p className="profile-note">{p.note}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.5}>
            <div className="section-cta-row section-cta-row--light">
              <a href="#contact" className="btn-inline btn-inline--light" id="profiles-cta">
                <span>{t.profiles.cta}</span>
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
            src="/profiles.webp"
            alt={t.imageAlts.profiles}
            fill
            sizes="(max-width: 920px) 100vw, 45vw"
            style={{ objectFit: "cover", objectPosition: "center 25%" }}
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 04b — Environments
   ────────────────────────────────────────────────────────── */
function Environments({ t }: { t: LandingCopy }) {
  return (
    <section className="environments" id="environments">
      <div className="container">
        <div className="environments-head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.environments.label}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title">{t.environments.title}</h2>
          </Reveal>
        </div>

        <div className="environments-grid">
          {t.environments.items.map((item, i) => (
            <Reveal className="environment-card" key={i} delay={0.1 + i * 0.05}>
              <span className="environment-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="environment-name">{item}</h3>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 05 — Teams
   ────────────────────────────────────────────────────────── */
function Teams({ t }: { t: LandingCopy }) {
  return (
    <section className="teams">
      <div className="container container--narrow">
        <Reveal>
          <span className="eyebrow eyebrow--gold">B2B</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="teams-headline">{t.teams.headline}</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="teams-body">{t.teams.body}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="section-cta-row" style={{ marginTop: '36px' }}>
            <a href="#contact" className="btn-primary btn-primary--sm" id="teams-cta">
              <span>{t.teams.cta}</span>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 06 — How it works
   ────────────────────────────────────────────────────────── */
function How({ t }: { t: LandingCopy }) {
  return (
    <section className="how">
      <div className="container">
        <Reveal>
          <div className="how-eyebrow">
            <span className="eyebrow eyebrow--gold">{t.how.label}</span>
          </div>
        </Reveal>
        <div className="how-grid">
          {t.how.steps.map((s, i) => (
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
   Section 07 — About
   ────────────────────────────────────────────────────────── */
function About({ t }: { t: LandingCopy }) {
  return (
    <section className="about">
      <div className="about-grid">
        <Reveal className="about-photo">
          <Image
            src="/portrait.webp"
            alt={t.imageAlts.portrait}
            fill
            sizes="(max-width: 920px) 100vw, 40vw"
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
          />
        </Reveal>
        <div className="about-text">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.about.label}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="about-name">{t.about.name}</h2>
          </Reveal>
          <ul className="about-lines">
            {t.about.lines.map((line: string, i: number) => (
              <Reveal as="li" key={i} delay={0.2 + i * 0.08}>
                {line}
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.5}>
            <div className="about-cta-wrap">
              <a href="#contact" className="btn-primary" id="about-cta">
                <span>{t.about.cta}</span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                  <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
                </svg>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 07b — Brand Signature
   Full logo as editorial anchor before the contact CTA.
   ────────────────────────────────────────────────────────── */
function BrandSignature({ t }: { t: LandingCopy }) {
  return (
    <section className="brand-sig" id="brand-signature">
      <div className="brand-sig__bg" aria-hidden="true" />
      <div className="container">
        <Reveal className="brand-sig__inner">
          {/* Real full logo — the complete circular badge */}
          <div className="brand-sig__logo-wrap">
            <div className="brand-sig__logo-ring" aria-hidden="true" />
            <Image
              src="/logo-badge.png"
              alt="Thérapie Manuelle Reboutement & Massage by Grégory Tordjman — Logo officiel Méthode TMS®"
              width={300}
              height={300}
              className="brand-sig__logo-img"
              priority={false}
            />
          </div>

          {/* Copy block */}
          <div className="brand-sig__copy">
            <Reveal delay={0.1}>
              <span className="eyebrow eyebrow--gold brand-sig__eyebrow">{t.brandSignature.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="brand-sig__headline">{t.brandSignature.headline}</h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="brand-sig__sub">{t.brandSignature.sub}</p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="brand-sig__cta-row">
                <a href="#contact" className="btn-primary" id="brand-sig-cta">
                  <span>{t.brandSignature.cta}</span>
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                    <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
                  </svg>
                </a>
                <span className="brand-sig__note">+33 6 65 51 77 35</span>
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
function Footer({ t }: { t: LandingCopy }) {
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
          {t.footer.lines.map((l: string, i: number) => (
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

export default function LandingPage({ initialLang }: { initialLang: Language }) {
  const lang = initialLang;
  useEffect(() => {
    document.documentElement.setAttribute("data-density", "editorial");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "editorial");
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  const t = COPY[lang] || COPY.EN;

  return (
    <>
      <SharedHeader lang={lang} activePage="home" heroStyle="dark" />
      <main>
        <Hero t={t} heroTreatment="natural" layout="editorial" />
        <Problem t={t} />
        <TrustBar t={t} />
        <Practices t={t} />
        <Profiles t={t} />
        <Environments t={t} />
        <Teams t={t} />
        <How t={t} />
        <About t={t} />
        <BrandSignature t={t} />
        <SharedContactForm lang={lang} id="contact" />
      </main>
      <Footer t={t} />
    </>
  );
}
