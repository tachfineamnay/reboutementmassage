"use client";

import Image from "next/image";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { getCdmxLocaleFromLanguage, getCdmxWhatsappUrl } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function CampaignHero({ config }: { config: CampaignLandingConfig }) {
  const locale = getCdmxLocaleFromLanguage(config.language);
  const whatsappUrl = getCdmxWhatsappUrl(locale, "default");

  function handleWhatsappClick() {
    trackCampaignEvent("hero_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "hero",
    });
  }

  function handleBookingClick() {
    trackCampaignEvent("booking_clicked", {
      language: config.htmlLang,
      cta_location: "hero",
    });
  }

  return (
    <section className="campaign-hero" id="top">
      <div className="campaign-hero__photo" aria-hidden="true">
        <Image
          src="/hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div className="campaign-hero__vignette" />
      </div>

      <div className="campaign-hero__inner">
        <div className="campaign-hero__copy">
          <span className="eyebrow eyebrow--gold">{config.hero.eyebrow}</span>
          <h1 className="campaign-hero__title">{config.hero.title}</h1>
          <p className="campaign-hero__sub">{config.hero.subtitle}</p>
          <p className="campaign-hero__note">{config.hero.microNote}</p>

          <div className="campaign-hero__ctas">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary campaign-hero__cta-wa"
              onClick={handleWhatsappClick}
            >
              <WhatsAppIcon />
              <span>{config.hero.ctaPrimary}</span>
            </a>
            <a
              href="#solicitud"
              className="btn-secondary campaign-hero__cta-book"
              onClick={handleBookingClick}
            >
              {config.hero.ctaSecondary}
            </a>
          </div>

          <p className="campaign-hero__proof-line">{config.hero.proofLine}</p>
        </div>
      </div>
    </section>
  );
}
