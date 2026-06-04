"use client";

import Image from "next/image";
import { Language } from "@/data/copy";

const FOOTER_DATA: Record<Language, string[]> = {
  FR: [
    "Grégory Tordjman · Méthode TMS®",
    "Thérapie manuelle de soulagement · Formation · Hospitality · Villas · Yachting · Équipes",
    "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
    "International sur demande",
  ],
  EN: [
    "Grégory Tordjman · Méthode TMS®",
    "Manual relief therapy · Training · Hospitality · Villas · Yachting · Teams",
    "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
    "International on request",
  ],
  ES: [
    "Grégory Tordjman · Método TMS®",
    "Terapia manual de alivio · Formación · Hospitality · Villas · Yachting · Equipos",
    "+33 6 65 51 77 35 · contact@reboutementmassage.fr",
    "Internacional bajo solicitud",
  ],
};

export default function SharedFooter({ lang }: { lang: Language }) {
  const lines = FOOTER_DATA[lang];

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
            <p key={i} className={i === 0 ? "footer-name" : "footer-line"}>
              {l}
            </p>
          ))}
        </div>
        <div className="footer-meta">
          <span className="eyebrow eyebrow--mute">© MMXXVI</span>
        </div>
      </div>
    </footer>
  );
}
