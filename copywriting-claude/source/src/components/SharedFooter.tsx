"use client";

import Image from "next/image";
import { Language } from "@/data/copy";

const FOOTER_DATA: Record<Language, string[]> = {
  FR: [
    "Grégory Tordjman · Méthode TMS®",
    "Reboutement TMS® · Thérapie manuelle de soulagement · Formation · Hospitality · Villas · Yachting",
    "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
    "International sur demande",
  ],
  EN: [
    "Grégory Tordjman · Méthode TMS®",
    "TMS® Manual Therapy · Traditional French bonesetting · Training · Hospitality · Villas · Yachting",
    "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
    "International on request",
  ],
  ES: [
    "Grégory Tordjman · Método TMS®",
    "Terapia manual TMS® · Reboutement tradicional francés · Formación · Hospitality · Villas · Yachting",
    "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
    "Internacional bajo solicitud",
  ],
};

const FOOTER_LINKS: Record<Language, Array<{ href: string; label: string }>> = {
  FR: [
    { href: "/fr/seances", label: "Séance de reboutement" },
    { href: "/fr/stages-workshops", label: "Formation Méthode TMS®" },
    { href: "/fr/biographie", label: "Parcours de Grégory" },
  ],
  EN: [
    { href: "/en/sessions", label: "TMS® Manual Therapy" },
    { href: "/en/stages-workshops", label: "Training & workshops" },
    { href: "/en/biography", label: "Grégory's background" },
  ],
  ES: [
    { href: "/es/sesiones", label: "Terapia manual TMS®" },
    { href: "/es/stages-workshops", label: "Formación Método TMS®" },
    { href: "/es/biografia", label: "Recorrido de Grégory" },
  ],
};

export default function SharedFooter({ lang }: { lang: Language }) {
  const lines = FOOTER_DATA[lang];
  const links = FOOTER_LINKS[lang];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-mark">
          <Image
            src="/logo--reboutement-tgrégory-tordjman.png"
            alt={
              lang === "FR"
                ? "Thérapie manuelle, reboutement et massage thérapeutique par Grégory Tordjman"
                : lang === "EN"
                ? "TMS® Manual Therapy inspired by traditional French bonesetting by Grégory Tordjman"
                : "Terapia manual TMS® inspirada en el reboutement tradicional francés por Grégory Tordjman"
            }
            width={120}
            height={120}
            className="footer-mark__img"
          />
        </div>
        <div className="footer-lines">
          {lines.map((l, i) => (
            <p key={i} className={i === 0 ? "footer-name" : "footer-line"}>
              {l}
            </p>
          ))}
          <nav
            aria-label={lang === "FR" ? "Liens internes" : lang === "EN" ? "Internal links" : "Enlaces internos"}
            style={{ display: "flex", flexWrap: "wrap", gap: "0 6px" }}
          >
            {links.map((link, i) => (
              <a key={link.href} href={link.href} className="footer-line" style={{ textDecoration: "none" }}>
                {link.label}{i < links.length - 1 ? " ·" : ""}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-meta">
          <span className="eyebrow eyebrow--mute">© MMXXVI</span>
        </div>
      </div>
    </footer>
  );
}
