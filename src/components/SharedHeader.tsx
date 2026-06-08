"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const menuId = "shared-mobile-menu";

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Ferme le menu au redimensionnement desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 920) closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [closeMenu]);

  /* Bloque le scroll et gère le clavier quand le menu est ouvert */
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => firstMenuLinkRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, menuOpen]);

  const navLinks = getNavLinks(lang);
  const ctaLabel = getCtaLabel(lang);
  const ctaHref = `${LANGUAGE_ROUTES[lang]}#contact`;

  /* Couleur header non scrollé selon le fond du hero */
  const isLightHero = heroStyle === "light";

  const headerBg = menuOpen
    ? "rgba(26,23,20,0.96)"
    : scrolled
    ? "rgba(26,23,20,0.88)"
    : "transparent";
  const headerBackdrop = menuOpen || scrolled ? "blur(14px)" : "none";
  const headerBorder = menuOpen || scrolled
    ? "0.5px solid rgba(201,169,90,0.18)"
    : "0.5px solid transparent";

  return (
    <>
      <header
        className={`site-header shared-header${isLightHero && !scrolled && !menuOpen ? " shared-header--light" : ""}${menuOpen ? " shared-header--menu-open" : ""}`}
        style={{
          background: headerBg,
          backdropFilter: headerBackdrop,
          WebkitBackdropFilter: headerBackdrop,
          borderBottom: headerBorder,
        }}
      >
        <div className="header-inner">
          {/* Logo / Brand */}
          <Link
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
          </Link>

          {/* Desktop nav */}
          <div className="header-right">
            <nav className="lang-switch" aria-label="Navigation principale">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`lang-btn shared-nav-link${activePage === link.key ? " shared-nav-link--active" : ""}`}
                  aria-current={activePage === link.key ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Language switcher */}
              <span className="nav-divider" aria-hidden="true" />
              {(["EN", "FR", "ES"] as Language[]).map((code, i) => (
                <React.Fragment key={code}>
                  {i > 0 && <span className="lang-sep" aria-hidden="true">·</span>}
                  <Link
                    href={LANGUAGE_ROUTES[code]}
                    className={`lang-btn${lang === code ? " is-active" : ""}`}
                    aria-current={lang === code ? "page" : undefined}
                    hrefLang={LANGUAGE_ROUTES[code].slice(1)}
                  >
                    {code}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            {/* CTA desktop */}
            <Link href={ctaHref} className="header-cta" id="shared-header-cta">
              {ctaLabel}
              <Arrow />
            </Link>

            {/* Hamburger — mobile only */}
            <button
              ref={menuButtonRef}
              className={`hamburger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls={menuId}
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
        id={menuId}
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Menu principal"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="mobile-menu__backdrop"
          onClick={() => closeMenu(true)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <nav className="mobile-menu__drawer" aria-label="Navigation mobile">
          {/* Liens principaux */}
          <ul className="mobile-menu__list">
            {navLinks.map((link) => (
              <li key={link.key}>
                <Link
                  ref={link.key === "biography" ? firstMenuLinkRef : undefined}
                  href={link.href}
                  className={`mobile-menu__link${activePage === link.key ? " is-active" : ""}`}
                  aria-current={activePage === link.key ? "page" : undefined}
                  onClick={() => closeMenu()}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA mobile */}
          <Link
            href={ctaHref}
            className="mobile-menu__cta"
            onClick={() => closeMenu()}
          >
            {ctaLabel}
            <Arrow />
          </Link>

          {/* Language switcher mobile */}
          <div className="mobile-menu__langs">
            {(["EN", "FR", "ES"] as Language[]).map((code) => (
              <Link
                key={code}
                href={LANGUAGE_ROUTES[code]}
                className={`mobile-menu__lang${lang === code ? " is-active" : ""}`}
                aria-current={lang === code ? "page" : undefined}
                hrefLang={LANGUAGE_ROUTES[code].slice(1)}
                onClick={() => closeMenu()}
              >
                {code}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
