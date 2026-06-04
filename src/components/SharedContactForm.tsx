"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { COPY, Language } from "@/data/copy";

/* ─────────────────────────────────────────────────────────────
   HandLogo SVG
   ──────────────────────────────────────────────────────────── */
function HandLogo({ size = 46, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="94" stroke={color} strokeWidth="5" fill="none" />
      <path
        d="M90 52 C90 52, 82 52, 80 64 L74 108 C72 118, 58 120, 56 110 L52 88 C50 78, 62 74, 64 84 L66 96"
        stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <line x1="88" y1="52" x2="88" y2="92" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="46" x2="100" y2="92" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="112" y1="50" x2="112" y2="92" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="124" y1="58" x2="122" y2="90" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path
        d="M74 108 C74 120, 78 132, 86 140 C94 148, 106 152, 118 148 C130 144, 136 132, 134 118 L126 90"
        stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path
        d="M100 118 C92 118, 88 112, 88 106 C88 98, 94 94, 100 94 C108 94, 112 100, 112 106 C112 114, 106 120, 98 122 C88 124, 82 118, 80 110 C78 100, 84 90, 96 88"
        stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Reveal — fade-up on scroll
   ──────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }); },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function Reveal({
  as: Tag = "div", delay = 0, children, className = "", style = {}, ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; delay?: number; children: React.ReactNode }) {
  const [ref, shown] = useReveal();
  const s: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(20px)",
    transition: `opacity .8s cubic-bezier(.25,.1,.25,1), transform .8s cubic-bezier(.25,.1,.25,1)`,
    transitionDelay: `${delay}s`,
    ...style,
  };
  return <Tag ref={ref} className={className} style={s} {...rest}>{children}</Tag>;
}

/* ─────────────────────────────────────────────────────────────
   Slot generator — same logic as landing page
   ──────────────────────────────────────────────────────────── */
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
    return { date, label: label.charAt(0).toUpperCase() + label.slice(1), slots: times.map((time, i) => ({ time, taken: takenSet.has(i) })) };
  });
}

/* ─────────────────────────────────────────────────────────────
   StepField — same as landing
   ──────────────────────────────────────────────────────────── */
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
  { label, placeholder, value, onChange, valid, multiline, autoFocus, inputType = "text" }, ref
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
            onChange={(e) => onChange(e.target.value)}
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
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
          />
        )}
        {valid && (
          <span className="sf-field__check" aria-label="Valid">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <polyline points="1,5.5 5,9.5 13,1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      <span className="sf-field__rule" />
    </label>
  );
});

/* ─────────────────────────────────────────────────────────────
   Validation helpers
   ──────────────────────────────────────────────────────────── */
function isValidFirstName(value: string) { return value.trim().length >= 2; }
function isValidContactValue(value: string) {
  const contact = value.trim();
  if (contact.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.toLowerCase());
  return contact.replace(/\D/g, "").length >= 6;
}

/* ─────────────────────────────────────────────────────────────
   Form state
   ──────────────────────────────────────────────────────────── */
type ContactFormState = {
  firstName: string;
  contact: string;
  type: string;
  context: string;
  selectedDay: number;
  selectedTime: string;
};

const initialForm: ContactFormState = {
  firstName: "", contact: "", type: "", context: "", selectedDay: 0, selectedTime: "",
};

/* ─────────────────────────────────────────────────────────────
   SharedContactForm — identical form, usable on every page
   Props:
   - lang: current language
   - id: HTML anchor id (default "contact", override per page e.g. "demande")
   ──────────────────────────────────────────────────────────── */
export default function SharedContactForm({ lang, id = "contact" }: { lang: Language; id?: string }) {
  const t = COPY[lang];
  const tc = t.contact;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const days = useMemo(() => generateSlots(lang), [lang]);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (step === 1) setTimeout(() => firstNameRef.current?.focus(), 350);
  }, [step]);

  function updateField(key: "firstName" | "contact", value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setValidated((v) => ({ ...v, [key]: key === "firstName" ? isValidFirstName(value) : isValidContactValue(value) }));
    setSubmitError(null);
  }

  function goNext() {
    setStep((s) => {
      if (s === 1 && !(isValidFirstName(form.firstName) && isValidContactValue(form.contact))) return s;
      if (s === 2 && !form.type) return s;
      if (s === 3 && !form.selectedTime) return s;
      return Math.min(s + 1, 4);
    });
  }
  function goBack() { setStep((s) => Math.max(s - 1, 1)); }

  const selectedSlotStart = useMemo(() => {
    if (!form.selectedTime || !days[form.selectedDay]) return null;
    const date = days[form.selectedDay].date;
    const [hours, minutes] = form.selectedTime.split(":").map(Number);
    const start = new Date(date);
    start.setHours(hours, minutes || 0, 0, 0);
    return start;
  }, [days, form.selectedDay, form.selectedTime]);

  const selectedDayLabel = form.selectedTime ? days[form.selectedDay]?.label : "";

  async function handleSubmit() {
    if (!selectedSlotStart || loading) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utm = Object.fromEntries(Array.from(searchParams.entries()).filter(([k]) => k.toLowerCase().startsWith("utm_")));
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
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !result?.ok) {
        if (result?.error === "INVALID_CONTACT") { setLoading(false); setSubmitError(tc.step1.contactError); return; }
        throw new Error("Lead submission failed");
      }
      setLoading(false);
      goNext();
    } catch {
      setLoading(false);
      setSubmitError(tc.submitError);
    }
  }

  const availableCount = days.reduce((a, d) => a + d.slots.filter((s) => !s.taken).length, 0);
  const canProceed1 = isValidFirstName(form.firstName) && isValidContactValue(form.contact);
  const canProceed2 = form.type !== "";
  const canProceed3 = form.selectedTime !== "";
  const showContactError = form.contact.trim().length > 0 && !isValidContactValue(form.contact);

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

  function resetAll() { setStep(1); setForm(initialForm); setValidated({}); setSubmitError(null); }

  return (
    <section className="contact" id={id}>
      <div className="container container--form">
        {/* Header */}
        <div className="contact-head">
          <Reveal><span className="eyebrow eyebrow--gold">{tc.label}</span></Reveal>
          <Reveal delay={0.1}><h2 className="contact-headline">{tc.headline}</h2></Reveal>
          <Reveal delay={0.2}><p className="contact-sub">{tc.sub}</p></Reveal>
        </div>

        {/* Progress bar */}
        <Reveal delay={0.3}>
          <div className="sf-progress">
            <div className="sf-progress__fill" style={{ width: `${step * 25}%` }} />
          </div>
        </Reveal>

        {/* Step indicators */}
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
                <span className="sf-ind__text">{tc.stepLabels[i]}</span>
              </button>
            ))}
            <div className="sf-ind__track">
              <div className="sf-ind__fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            </div>
          </div>
        </Reveal>

        {/* Step content */}
        <div className="sf-content">
          <div className="sf-slider">

            {/* STEP 1 */}
            <div className={`sf-slide ${step === 1 ? "is-active" : ""}`}>
              <p className="sf-step__title">{tc.step1.title}</p>
              <div className="sf-fields">
                <StepField
                  ref={firstNameRef}
                  label={tc.step1.firstName}
                  placeholder={tc.step1.firstNamePh}
                  value={form.firstName}
                  onChange={(v) => updateField("firstName", v)}
                  valid={validated.firstName}
                />
                <StepField
                  label={tc.step1.contact}
                  placeholder={tc.step1.contactPh}
                  value={form.contact}
                  onChange={(v) => updateField("contact", v)}
                  valid={validated.contact}
                />
              </div>
              {showContactError && <p className="sf-help" role="status">{tc.step1.contactError}</p>}
              <div className="sf-nav">
                <button className="sf-btn" onClick={goNext} disabled={!canProceed1} type="button">
                  <span>{tc.step1.next}</span>{arrow}
                </button>
              </div>
            </div>

            {/* STEP 2 */}
            <div className={`sf-slide ${step === 2 ? "is-active" : ""}`}>
              <p className="sf-step__title">{tc.step2.title}</p>
              <div className="sf-types">
                {tc.step2.types.map((tp: string) => (
                  <button
                    key={tp}
                    className={`sf-type ${form.type === tp ? "is-selected" : ""}`}
                    onClick={() => { setForm((f) => ({ ...f, type: tp })); setSubmitError(null); }}
                    aria-pressed={form.type === tp}
                    type="button"
                  >{tp}</button>
                ))}
              </div>
              <div className="sf-fields">
                <StepField
                  label={tc.step2.context}
                  placeholder={tc.step2.contextPh}
                  value={form.context}
                  onChange={(v) => setForm((f) => ({ ...f, context: v }))}
                  multiline
                />
              </div>
              <div className="sf-nav sf-nav--between">
                <button className="sf-btn sf-btn--back" onClick={goBack} type="button">←</button>
                <button className="sf-btn" onClick={goNext} disabled={!canProceed2} type="button">
                  <span>{tc.step2.next}</span>{arrow}
                </button>
              </div>
            </div>

            {/* STEP 3 */}
            <div className={`sf-slide ${step === 3 ? "is-active" : ""}`}>
              <p className="sf-step__title">{tc.step3.title}</p>
              <p className="sf-step__avail">
                <span className="sf-step__avail-n">{availableCount}</span>{" "}{tc.step3.slotsAvailable}
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
                          onClick={() => { setForm((f) => ({ ...f, selectedDay: di, selectedTime: slot.time })); setSubmitError(null); }}
                          type="button"
                        >
                          <span className="sf-slot__time">{slot.time}</span>
                          {slot.taken && <span className="sf-slot__tag">{tc.step3.taken}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sf-trust sf-trust--enhanced">
                <div className="sf-trust__brand" aria-hidden="true">
                  <HandLogo size={28} color="var(--forest)" />
                </div>
                {tc.step3.trust.map((sig: string, i: number) => (
                  <span key={i} className="sf-trust__item">
                    <span className="sf-trust__icon">{checkIcon}</span>
                    {sig}
                  </span>
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
                  {loading ? <span className="sf-spinner" /> : <><span>{tc.step3.cta}</span>{arrow}</>}
                </button>
              </div>
              {submitError && <p className="sf-error" role="alert" aria-live="polite">{submitError}</p>}
            </div>

            {/* STEP 4 — Confirmation */}
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
                <h3 className="sf-confirm__headline">{tc.step4.headline}</h3>
                <p className="sf-confirm__call">
                  {tc.step4.callLine}{" "}
                  <strong>{selectedDayLabel}</strong>{" "}
                  {tc.step4.at}{" "}
                  <strong>{form.selectedTime}</strong>.
                </p>
                <p className="sf-confirm__therapist">Grégory Tordjman — {tc.step4.therapistLine}</p>
                <p className="sf-confirm__sms">{tc.step4.smsNote}</p>
                <div className="sf-confirm__actions">
                  <a href={calendarLink} target="_blank" rel="noreferrer" className="sf-btn sf-btn--calendar">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="1" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1" />
                      <line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="0.7" />
                      <line x1="5" y1="1" x2="5" y2="5" stroke="currentColor" strokeWidth="1" />
                      <line x1="11" y1="1" x2="11" y2="5" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <span>{tc.step4.addCalendar}</span>
                  </a>
                </div>
                <button className="sf-btn sf-btn--ghost" onClick={resetAll} type="button">
                  {tc.step4.newRequest}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
