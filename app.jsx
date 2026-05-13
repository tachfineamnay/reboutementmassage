/* global React, ReactDOM, COPY, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect */
const { useState, useEffect, useRef, useMemo } = React;

/* ──────────────────────────────────────────────────────────
   Reveal-on-scroll hook (Framer-Motion-style fade-up)
   ────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
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
  return [ref, shown];
}

function Reveal({ as: Tag = "div", delay = 0, children, className = "", style = {}, ...rest }) {
  const [ref, shown] = useReveal();
  const s = {
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
function Header({ lang, setLang, t }) {
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
        <a href="#top" className="brand" aria-label="Méthode TMS — home">
          <span className="brand-mark">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="10.25" stroke="currentColor" strokeWidth="0.5" />
              <path d="M6.2 11.6c1.6-2.6 3-3.9 4.8-3.9s3.2 1.3 4.8 3.9" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <circle cx="11" cy="11" r="0.9" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-word">
            <span className="bw-1">Méthode</span>
            <span className="bw-2">TMS<sup>®</sup></span>
          </span>
        </a>

        <nav className="lang-switch" aria-label="Language">
          {["EN", "FR", "ES"].map((code, i) => (
            <React.Fragment key={code}>
              {i > 0 && <span className="lang-sep" aria-hidden="true">·</span>}
              <button
                className={"lang-btn " + (lang === code ? "is-active" : "")}
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
              >
                {code}
              </button>
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
function Hero({ t, heroTreatment, layout }) {
  const filter = useMemo(() => {
    if (heroTreatment === "duotone") return "grayscale(.6) sepia(.06) contrast(1.02) brightness(.96)";
    if (heroTreatment === "bw") return "grayscale(1) contrast(1.05) brightness(.94)";
    return "saturate(.9) contrast(1.02) brightness(.96)";
  }, [heroTreatment]);

  /* ── Layout B: Cream — type-led, portrait inset ── */
  if (layout === "cream") {
    return (
      <section className="hero hero--cream" id="top" data-screen-label="01 Hero">
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
                <span className="eyebrow eyebrow--faint">Saint-Barthélemy · Saint-Martin · Aboard</span>
              </div>
            </Reveal>
          </div>

          <Reveal className="hero-cream-photo" delay={0.2}>
            <img src="assets/hero.jpg" alt="Gregory at work" style={{ filter }} />
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
    <section className="hero" id="top" data-screen-label="01 Hero">
      <div className="hero-photo" aria-hidden="false">
        <img src="assets/hero.jpg" alt="Gregory at work" style={{ filter }} />
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
            <span className="eyebrow eyebrow--faint">Saint-Barthélemy · Saint-Martin · Aboard</span>
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
function Problem({ t }) {
  return (
    <section className="problem" data-screen-label="02 Problem">
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
   Asymmetric: dominant 60% (with image), two stacked at 40%
   ────────────────────────────────────────────────────────── */
function Practices({ t }) {
  const items = t.practices.items;
  return (
    <section className="practices" data-screen-label="03 Practices">
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
              <img src="assets/practice-01.jpg" alt="" />
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
   Section 04 — Client Profiles (on ink)
   ────────────────────────────────────────────────────────── */
function Profiles({ t }) {
  return (
    <section className="profiles" data-screen-label="04 Profiles">
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
          <img src="assets/profiles.jpg" alt="Gregory at work" />
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Section 05 — For your teams
   ────────────────────────────────────────────────────────── */
function Teams({ t }) {
  return (
    <section className="teams" data-screen-label="05 Teams">
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
function How({ t }) {
  return (
    <section className="how" data-screen-label="06 How">
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
   Section 07 — About Gregory (forest bg)
   ────────────────────────────────────────────────────────── */
function About({ t }) {
  return (
    <section className="about" data-screen-label="07 About">
      <div className="about-grid">
        <Reveal className="about-photo">
          <img src="assets/portrait.jpg" alt="Grégory Tordjman" />
        </Reveal>
        <div className="about-text">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.about.label}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="about-name">{t.about.name}</h2>
          </Reveal>
          <ul className="about-lines">
            {t.about.lines.map((line, i) => (
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
   Section 08 — Contact
   ────────────────────────────────────────────────────────── */
function Contact({ t }) {
  const [form, setForm] = useState({ establishment: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState("");

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit(e) {
    e.preventDefault();
    if (!form.establishment.trim() || !form.contact.trim()) return;
    setSent(true);
  }

  return (
    <section className="contact" id="contact" data-screen-label="08 Contact">
      <div className="container container--form">
        <div className="contact-head">
          <Reveal>
            <span className="eyebrow eyebrow--gold">{t.contact.label}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="contact-headline">{t.contact.headline}</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="contact-sub">{t.contact.sub}</p>
          </Reveal>
        </div>

        {!sent ? (
          <Reveal as="form" className="contact-form" onSubmit={submit} delay={0.3}>
            <Field
              label={t.contact.fields.establishment}
              placeholder={t.contact.fields.establishmentPh}
              value={form.establishment}
              onChange={(v) => update("establishment", v)}
              onFocus={() => setFocused("establishment")}
              onBlur={() => setFocused("")}
              focused={focused === "establishment"}
              required
            />
            <Field
              label={t.contact.fields.contact}
              placeholder={t.contact.fields.contactPh}
              value={form.contact}
              onChange={(v) => update("contact", v)}
              onFocus={() => setFocused("contact")}
              onBlur={() => setFocused("")}
              focused={focused === "contact"}
              required
            />
            <Field
              label={t.contact.fields.message}
              placeholder={t.contact.fields.messagePh}
              value={form.message}
              onChange={(v) => update("message", v)}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused("")}
              focused={focused === "message"}
              multiline
            />

            <div className="form-foot">
              <button className="btn-primary" type="submit">
                <span>{t.contact.submit}</span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
                  <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
                </svg>
              </button>
              <p className="form-whatsapp">
                {t.contact.whatsapp}{" "}
                <a href="https://wa.me/33663443284" target="_blank" rel="noreferrer">
                  {t.contact.whatsappLink}
                </a>
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal className="contact-sent">
            <span className="eyebrow eyebrow--gold">·  ·  ·</span>
            <p className="sent-msg">{t.contact.sent}</p>
            <button className="link-btn" onClick={() => { setSent(false); setForm({ establishment: "", contact: "", message: "" }); }}>
              ←
            </button>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Field({ label, placeholder, value, onChange, onFocus, onBlur, focused, multiline, required }) {
  const Input = multiline ? "textarea" : "input";
  return (
    <label className={"field " + (focused ? "is-focused " : "") + (value ? "has-value " : "")}>
      <span className="field-label eyebrow eyebrow--gold">{label}{required && <span className="req" aria-hidden="true"> *</span>}</span>
      <Input
        className="field-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        rows={multiline ? 3 : undefined}
      />
      <span className="field-rule" />
    </label>
  );
}

/* ──────────────────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────────────────── */
function Footer({ t }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-mark">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="10.25" stroke="currentColor" strokeWidth="0.5" />
            <path d="M6.2 11.6c1.6-2.6 3-3.9 4.8-3.9s3.2 1.3 4.8 3.9" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
            <circle cx="11" cy="11" r="0.9" fill="currentColor" />
          </svg>
        </div>
        <div className="footer-lines">
          {t.footer.lines.map((l, i) => (
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
   Tweaks
   ────────────────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "EN",
  "heroTreatment": "natural",
  "density": "editorial",
  "layout": "editorial"
}/*EDITMODE-END*/;

function App() {
  const [t_, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const lang = t_.lang;
  const setLang = (v) => setTweak("lang", v);

  // Apply density + palette to root via data-attr
  useEffect(() => {
    document.documentElement.setAttribute("data-density", t_.density);
  }, [t_.density]);
  useEffect(() => {
    // palette is locked to forest
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", t_.layout);
  }, [t_.layout]);

  // Update <title> + <lang>
  useEffect(() => {
    const titles = {
      EN: "Gregory Tordjman — Méthode TMS® | Saint-Barth & Saint-Martin",
      FR: "Grégory Tordjman — Méthode TMS® | Saint-Barth & Saint-Martin",
      ES: "Gregory Tordjman — Método TMS® | San Bartolomé & San Martín",
    };
    document.title = titles[lang] || titles.EN;
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  const t = COPY[lang] || COPY.EN;

  return (
    <>
      <Header lang={lang} setLang={setLang} t={t} />
      <main>
        <Hero t={t} heroTreatment={t_.heroTreatment} layout={t_.layout} />
        <Problem t={t} />
        <Practices t={t} />
        <Profiles t={t} />
        <Teams t={t} />
        <How t={t} />
        <About t={t} />
        <Contact t={t} />
      </main>
      <Footer t={t} />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Language">
          <TweakRadio
            tweaks={t_}
            setTweak={setTweak}
            tweakKey="lang"
            options={[
              { value: "EN", label: "EN" },
              { value: "FR", label: "FR" },
              { value: "ES", label: "ES" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Hero photo">
          <TweakRadio
            tweaks={t_}
            setTweak={setTweak}
            tweakKey="heroTreatment"
            options={[
              { value: "natural", label: "Natural" },
              { value: "duotone", label: "Warm" },
              { value: "bw", label: "B&W" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio
            tweaks={t_}
            setTweak={setTweak}
            tweakKey="layout"
            options={[
              { value: "editorial", label: "Dark hero" },
              { value: "cream", label: "Cream hero" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Density">
          <TweakRadio
            tweaks={t_}
            setTweak={setTweak}
            tweakKey="density"
            options={[
              { value: "editorial", label: "Editorial" },
              { value: "compact", label: "Compact" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
