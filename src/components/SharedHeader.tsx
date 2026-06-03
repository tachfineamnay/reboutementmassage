"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Language } from "@/data/copy";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */
export type ActivePage = "home" | "biography" | "seances" | "workshops" | "stories";

interface SharedHeaderProps {
  lang: Language;
  activePage?: ActivePage;
  /** "dark" = hero sombre (landing, workshops) — header commence transparent/cream
   *  "light" = hero clair (biography, seances) — header commence lisible sur fond cream */
  heroStyle?: "dark" | "light";
}

const LANGUAGE_ROUTES: Record<Language, string> = {
  FR: "/fr",
  EN: "/en",
  ES: "/es",
};

/* ─── Nav links helper ─── */
function getNavLinks(lang: Language) {
  const l = lang.toLowerCase();
  return [
    {
      key: "biography" as ActivePage,
      href: lang === "FR" ? "/fr/biographie" : lang === "EN" ? "/en/biography" : "/es/biografia",
      label: lang === "FR" ? "Biographie" : lang === "EN" ? "Biography" : "Biografía",
    },
    {
      key: "seances" as ActivePage,
      href: lang === "FR" ? "/fr/seances" : lang === "EN" ? "/en/sessions" : "/es/sesiones",
      label: lang === "FR" ? "Séances" : lang === "EN" ? "Sessions" : "Sesiones",
    },
    {
      key: "workshops" as ActivePage,
      href: `/${l}/stages-workshops`,
      label: lang === "FR" ? "Formations" : lang === "EN" ? "Training" : "Formación",
    },
    {
      key: "stories" as ActivePage,
      href: `/${l}/stories`,
      label: "Stories",
    },
  ];
}

function getCtaLabel(lang: Language) {
  return lang === "FR"
    ? "Consultation privée"
    : lang === "EN"
    ? "Private consultation"
    : "Consulta privada";
}

/* ─── Arrow icon ─── */
const Arrow = () => (
  <svg width="12" height="9" viewBox="0 0 14 10" fill="none" aria-hidden="true">
    <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
    <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   SharedHeader
   ══════════════════════════════════════════════════════════ */
export default function SharedHeader({
  lang,
  activePage = "home",
  heroStyle = "dark",
}: SharedHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Ferme le menu au redimensionnement desktop */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 920) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Bloque le scroll body quand le menu est ouvert */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = getNavLinks(lang);
  const ctaLabel = getCtaLabel(lang);
  const ctaHref = `${LANGUAGE_ROUTES[lang]}#contact`;

  /* Couleur header non scrollé selon le fond du hero */
  const isLightHero = heroStyle === "light";

  const headerBg = scrolled
    ? "rgba(26,23,20,0.88)"
    : "transparent";
  const headerBackdrop = scrolled ? "blur(14px)" : "none";
  const headerBorder = scrolled
    ? "0.5px solid rgba(201,169,90,0.18)"
    : "0.5px solid transparent";

  return (
    <>
      <header
        className={`site-header shared-header${isLightHero && !scrolled ? " shared-header--light" : ""}`}
        style={{
          background: headerBg,
          backdropFilter: headerBackdrop,
          WebkitBackdropFilter: headerBackdrop,
          borderBottom: headerBorder,
        }}
      >
        <div className="header-inner">
          {/* Logo / Brand */}
          <a
            href={LANGUAGE_ROUTES[lang]}
            className="brand"
            aria-label="Thérapie Manuelle by Grégory Tordjman — accueil"
          >
            <span className="brand-logo">
              <Image
                src="/logo-icon-reboutement.png"
                alt="Logo Méthode TMS® — Grégory Tordjman"
                width={40}
                height={40}
                className="brand-logo__img"
                priority
              />
            </span>
          </a>

          {/* Desktop nav */}
          <div className="header-right">
            <nav className="lang-switch" aria-label="Navigation principale">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className={`lang-btn shared-nav-link${activePage === link.key ? " shared-nav-link--active" : ""}`}
                >
                  {link.label}
                </a>
              ))}

              {/* Language switcher */}
              <span className="nav-divider" aria-hidden="true" />
              {(["EN", "FR", "ES"] as Language[]).map((code, i) => (
                <React.Fragment key={code}>
                  {i > 0 && <span className="lang-sep" aria-hidden="true">·</span>}
                  <a
                    href={LANGUAGE_ROUTES[code]}
                    className={`lang-btn${lang === code ? " is-active" : ""}`}
                    aria-current={lang === code ? "page" : undefined}
                    hrefLang={LANGUAGE_ROUTES[code].slice(1)}
                  >
                    {code}
                  </a>
                </React.Fragment>
              ))}
            </nav>

            {/* CTA desktop */}
            <a href={ctaHref} className="header-cta" id="shared-header-cta">
              {ctaLabel}
              <Arrow />
            </a>

            {/* Hamburger — mobile only */}
            <button
              className={`hamburger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              type="button"
            >
              <span className="hamburger__bar" />
              <span className="hamburger__bar" />
              <span className="hamburger__bar" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Menu principal"
      >
        {/* Backdrop */}
        <div
          className="mobile-menu__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <nav className="mobile-menu__drawer" aria-label="Navigation mobile">
          {/* Liens principaux */}
          <ul className="mobile-menu__list">
            {navLinks.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  className={`mobile-menu__link${activePage === link.key ? " is-active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA mobile */}
          <a
            href={ctaHref}
            className="mobile-menu__cta"
            onClick={() => setMenuOpen(false)}
          >
            {ctaLabel}
            <Arrow />
          </a>

          {/* Language switcher mobile */}
          <div className="mobile-menu__langs">
            {(["EN", "FR", "ES"] as Language[]).map((code) => (
              <a
                key={code}
                href={LANGUAGE_ROUTES[code]}
                className={`mobile-menu__lang${lang === code ? " is-active" : ""}`}
                hrefLang={LANGUAGE_ROUTES[code].slice(1)}
              >
                {code}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
