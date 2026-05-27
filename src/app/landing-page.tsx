"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { COPY, Language } from "@/data/copy";

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
   Header — fixed, transparent → ink/85 on scroll
   ────────────────────────────────────────────────────────── */
function Header({ lang }: { lang: Language }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="site-header"
      style={{
        background: scrolled ? "rgba(26,23,20,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "0.5px solid rgba(201,169,90,0.18)" : "0.5px solid transparent",
      }}
    >
      <div className="header-inner">
        <a href="#top" className="brand" aria-label="Thérapie Manuelle by Grégory Tordjman — home">
          <Image
            src="/logo.png"
            alt="Thérapie Manuelle · Reboutement & Massage by Grégory Tordjman"
            className="brand-logo"
            width={46}
            height={46}
            priority
          />
        </a>

        <nav className="lang-switch" aria-label="Language">
          {(["EN", "FR", "ES"] as Language[]).map((code, i) => (
            <React.Fragment key={code}>
              {i > 0 && <span className="lang-sep" aria-hidden="true">·</span>}
              <a
                href={LANGUAGE_ROUTES[code]}
                className={"lang-btn " + (lang === code ? "is-active" : "")}
                aria-current={lang === code ? "page" : undefined}
                hrefLang={LANGUAGE_ROUTES[code].slice(1)}
              >
                {code}
              </a>
            </React.Fragment>
          ))}
        </nav>
      </div>
    </header>
  );
}

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
              <div className="hero-cream-meta">
                <span className="rule-thin" />
                <span className="eyebrow eyebrow--faint">International · Aboard</span>
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
          <span className="hs-label">{t.hero.scroll}</span>
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
        </div>

        <Reveal delay={0.5} className="hero-meta">
          <div className="hero-meta-row">
            <span className="eyebrow eyebrow--faint">International · Aboard</span>
          </div>
          <div className="hero-meta-row hero-meta-row--rule">
            <span className="rule-thin" />
            <span className="eyebrow eyebrow--faint">Est. 2014  ·  MMXXVI</span>
          </div>
        </Reveal>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <span className="hs-label">{t.hero.scroll}</span>
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
      <div className="container container--narrow">
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
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Slot generation — next 2 days, deterministic "taken" slots
   ────────────────────────────────────────────────────────── */
function generateSlots(lang: Language) {
  const now = new Date();
  const locale = lang === "FR" ? "fr-FR" : lang === "ES" ? "es-ES" : "en-US";
  const times = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  return [1, 2].map((offset) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const dayHash = date.getDate() % 7;
    const takenSet = new Set([(dayHash + 1) % times.length, (dayHash + 4) % times.length]);
    const label = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(date);
    return {
      date,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      slots: times.map((time, i) => ({ time, taken: takenSet.has(i) })),
    };
  });
}

/* ──────────────────────────────────────────────────────────
   StepField — single field with real-time ✓ validation
   ────────────────────────────────────────────────────────── */
type StepFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  valid?: boolean;
  multiline?: boolean;
  autoFocus?: boolean;
  inputType?: string;
};

const StepField = React.forwardRef<HTMLInputElement, StepFieldProps>(function StepField(
  { label, placeholder, value, onChange, valid, multiline, autoFocus, inputType = "text" },
  ref
) {
  const [focused, setFocused] = useState(false);
  return (
    <label className={`sf-field ${focused ? "is-focused" : ""} ${value ? "has-value" : ""} ${valid ? "is-valid" : ""}`}>
      <span className="sf-field__label">{label}</span>
      <div className="sf-field__wrap">
        {multiline ? (
          <textarea
            className="sf-field__input"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={3}
            autoFocus={autoFocus}
          />
        ) : (
          <input
            ref={ref}
            className="sf-field__input"
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
          />
        )}
        {valid && (
          <span className="sf-field__check" aria-label="Valid">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <polyline points="1,5.5 5,9.5 13,1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>
      <span className="sf-field__rule" />
    </label>
  );
});

/* ──────────────────────────────────────────────────────────
   Section 08 — Contact (Progressive Disclosure · 4 steps)
   ────────────────────────────────────────────────────────── */
type ContactForm = {
  firstName: string;
  contact: string;
  type: string;
  context: string;
  selectedDay: number;
  selectedTime: string;
};

const initialContactForm: ContactForm = {
  firstName: "",
  contact: "",
  type: "",
  context: "",
  selectedDay: 0,
  selectedTime: "",
};

function Contact({ t, lang }: { t: LandingCopy; lang: Language }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ContactForm>(initialContactForm);
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const days = useMemo(() => generateSlots(lang), [lang]);
  const firstNameRef = useRef<HTMLInputElement>(null);

  /* auto-focus first field on step 1 */
  useEffect(() => {
    if (step === 1) setTimeout(() => firstNameRef.current?.focus(), 350);
  }, [step]);

  function updateField(key: "firstName" | "contact", value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setValidated((v) => ({ ...v, [key]: value.trim().length >= 2 }));
    setSubmitError(null);
  }

  function goNext() { setStep((s) => Math.min(s + 1, 4)); }
  function goBack() { setStep((s) => Math.max(s - 1, 1)); }

  const selectedSlotStart = useMemo(() => {
    if (!form.selectedTime || !days[form.selectedDay]) return null;
    const date = days[form.selectedDay].date;
    const [hours, minutes] = form.selectedTime.split(":").map(Number);
    const start = new Date(date);
    start.setHours(hours, minutes || 0, 0, 0);
    return start;
  }, [days, form.selectedDay, form.selectedTime]);

  async function handleSubmit() {
    if (!selectedSlotStart || loading) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utm = Object.fromEntries(
        Array.from(searchParams.entries()).filter(([key]) => key.toLowerCase().startsWith("utm_"))
      );

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          contact: form.contact.trim(),
          type: form.type,
          context: form.context.trim(),
          lang,
          selectedDayLabel,
          selectedTime: form.selectedTime,
          selectedDateTime: selectedSlotStart.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          pageUrl: window.location.href,
          utm,
        }),
      });

      const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (!response.ok || !result?.ok) throw new Error("Lead submission failed");

      setLoading(false);
      goNext();
    } catch {
      setLoading(false);
      setSubmitError(t.contact.submitError);
    }
  }

  const availableCount = days.reduce((a, d) => a + d.slots.filter((s) => !s.taken).length, 0);
  const canProceed1 = form.firstName.trim().length >= 2 && form.contact.trim().length >= 2;
  const canProceed2 = form.type !== "";
  const canProceed3 = form.selectedTime !== "";
  const selectedDayLabel = form.selectedTime ? days[form.selectedDay]?.label : "";

  /* Google Calendar link */
  const calendarLink = useMemo(() => {
    if (!selectedSlotStart) return "#";
    const end = new Date(selectedSlotStart); end.setMinutes(end.getMinutes() + 30);
    const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Méthode TMS® — Créneau de contact")}&dates=${fmt(selectedSlotStart)}/${fmt(end)}`;
  }, [selectedSlotStart]);

  const arrow = (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
      <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
      <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );

  const checkIcon = (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
      <polyline points="1,4.5 4.5,8 11,1" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );

  function resetAll() {
    setStep(1);
    setForm(initialContactForm);
    setValidated({});
    setSubmitError(null);
  }

  return (
    <section className="contact" id="contact">
      <div className="container container--form">
        {/* Header */}
        <div className="contact-head">
          <Reveal><span className="eyebrow eyebrow--gold">{t.contact.label}</span></Reveal>
          <Reveal delay={0.1}><h2 className="contact-headline">{t.contact.headline}</h2></Reveal>
          <Reveal delay={0.2}><p className="contact-sub">{t.contact.sub}</p></Reveal>
        </div>

        {/* Progress bar */}
        <Reveal delay={0.3}>
          <div className="sf-progress">
            <div className="sf-progress__fill" style={{ width: `${step * 25}%` }} />
          </div>
        </Reveal>

        {/* Step indicators — editorial style */}
        <Reveal delay={0.35}>
          <div className="sf-indicators">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                className={`sf-ind ${step === i + 1 ? "is-active" : ""} ${step > i + 1 ? "is-done" : ""}`}
                onClick={() => { if (step > i + 1) setStep(i + 1); }}
                disabled={step <= i}
                type="button"
              >
                <span className="sf-ind__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="sf-ind__sep">—</span>
                <span className="sf-ind__text">{t.contact.stepLabels[i]}</span>
              </button>
            ))}
            <div className="sf-ind__track">
              <div className="sf-ind__fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            </div>
          </div>
        </Reveal>

        {/* ─── Step content — smooth slider ─── */}
        <div className="sf-content">
          <div className="sf-slider" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>

            {/* STEP 1 — Identity */}
            <div className={`sf-slide ${step === 1 ? "is-active" : ""}`}>
              <p className="sf-step__title">{t.contact.step1.title}</p>
              <div className="sf-fields">
                <StepField
                  ref={firstNameRef}
                  label={t.contact.step1.firstName}
                  placeholder={t.contact.step1.firstNamePh}
                  value={form.firstName}
                  onChange={(v) => updateField("firstName", v)}
                  valid={validated.firstName}
                />
                <StepField
                  label={t.contact.step1.contact}
                  placeholder={t.contact.step1.contactPh}
                  value={form.contact}
                  onChange={(v) => updateField("contact", v)}
                  valid={validated.contact}
                />
              </div>
              <div className="sf-nav">
                <button className="sf-btn" onClick={goNext} disabled={!canProceed1} type="button">
                  <span>{t.contact.step1.next}</span>{arrow}
                </button>
              </div>
            </div>

            {/* STEP 2 — Need */}
            <div className={`sf-slide ${step === 2 ? "is-active" : ""}`}>
              <p className="sf-step__title">{t.contact.step2.title}</p>
              <div className="sf-types">
                {t.contact.step2.types.map((tp: string) => (
                  <button
                    key={tp}
                    className={`sf-type ${form.type === tp ? "is-selected" : ""}`}
                    onClick={() => {
                      setForm((f) => ({ ...f, type: tp }));
                      setSubmitError(null);
                    }}
                    type="button"
                  >{tp}</button>
                ))}
              </div>
              <div className="sf-fields">
                <StepField
                  label={t.contact.step2.context}
                  placeholder={t.contact.step2.contextPh}
                  value={form.context}
                  onChange={(v) => setForm((f) => ({ ...f, context: v }))}
                  multiline
                />
              </div>
              <div className="sf-nav sf-nav--between">
                <button className="sf-btn sf-btn--back" onClick={goBack} type="button">←</button>
                <button className="sf-btn" onClick={goNext} disabled={!canProceed2} type="button">
                  <span>{t.contact.step2.next}</span>{arrow}
                </button>
              </div>
            </div>

            {/* STEP 3 — Callback Scheduler */}
            <div className={`sf-slide ${step === 3 ? "is-active" : ""}`}>
              <p className="sf-step__title">{t.contact.step3.title}</p>
              <p className="sf-step__avail">
                <span className="sf-step__avail-n">{availableCount}</span>{" "}{t.contact.step3.slotsAvailable}
              </p>
              <div className="sf-scheduler">
                {days.map((day, di) => (
                  <div className="sf-day" key={di}>
                    <p className="sf-day__label">{day.label}</p>
                    <div className="sf-day__grid">
                      {day.slots.map((slot) => (
                        <button
                          key={`${di}-${slot.time}`}
                          className={`sf-slot ${slot.taken ? "sf-slot--taken" : ""} ${form.selectedDay === di && form.selectedTime === slot.time && !slot.taken ? "sf-slot--selected" : ""}`}
                          disabled={slot.taken}
                          onClick={() => {
                            setForm((f) => ({ ...f, selectedDay: di, selectedTime: slot.time }));
                            setSubmitError(null);
                          }}
                          type="button"
                        >
                          <span className="sf-slot__time">{slot.time}</span>
                          {slot.taken && <span className="sf-slot__tag">{t.contact.step3.taken}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust signals */}
              <div className="sf-trust">
                {t.contact.step3.trust.map((sig: string, i: number) => (
                  <span key={i} className="sf-trust__item">{checkIcon}{sig}</span>
                ))}
              </div>

              <div className="sf-nav sf-nav--between">
                <button className="sf-btn sf-btn--back" onClick={goBack} type="button">←</button>
                <button
                  className={`sf-btn sf-btn--cta ${loading ? "is-loading" : ""}`}
                  onClick={handleSubmit}
                  disabled={!canProceed3 || loading}
                  type="button"
                >
                  {loading ? <span className="sf-spinner" /> : <><span>{t.contact.step3.cta}</span>{arrow}</>}
                </button>
              </div>
              {submitError && (
                <p className="sf-error" role="alert" aria-live="polite">
                  {submitError}
                </p>
              )}
            </div>

            {/* STEP 4 — Confirmation (Peak-End) */}
            <div className={`sf-slide ${step === 4 ? "is-active" : ""}`}>
              <div className="sf-confirm">
                <div className="sf-confirm__photo">
                  <Image
                    src="/portrait.webp"
                    alt={t.imageAlts.portrait}
                    width={72}
                    height={72}
                    style={{ objectFit: "cover", objectPosition: "center 20%" }}
                  />
                </div>
                <h3 className="sf-confirm__headline">{t.contact.step4.headline}</h3>
                <p className="sf-confirm__call">
                  {t.contact.step4.callLine}{" "}
                  <strong>{selectedDayLabel}</strong>{" "}
                  {t.contact.step4.at}{" "}
                  <strong>{form.selectedTime}</strong>.
                </p>
                <p className="sf-confirm__therapist">
                  Grégory Tordjman — {t.contact.step4.therapistLine}
                </p>
                <p className="sf-confirm__sms">{t.contact.step4.smsNote}</p>
                <div className="sf-confirm__actions">
                  <a href={calendarLink} target="_blank" rel="noreferrer" className="sf-btn sf-btn--calendar">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="1" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1"/>
                      <line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="0.7"/>
                      <line x1="5" y1="1" x2="5" y2="5" stroke="currentColor" strokeWidth="1"/>
                      <line x1="11" y1="1" x2="11" y2="5" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    <span>{t.contact.step4.addCalendar}</span>
                  </a>
                </div>
                <button className="sf-btn sf-btn--ghost" onClick={resetAll} type="button">
                  {t.contact.step4.newRequest}
                </button>
              </div>
            </div>

          </div>
        </div>
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
            src="/logo.png"
            alt="Thérapie Manuelle logo"
            className="footer-logo"
            width={48}
            height={48}
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
      <Header lang={lang} />
      <main>
        <Hero t={t} heroTreatment="natural" layout="editorial" />
        <Problem t={t} />
        <Practices t={t} />
        <Profiles t={t} />
        <Teams t={t} />
        <How t={t} />
        <About t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} />
    </>
  );
}
