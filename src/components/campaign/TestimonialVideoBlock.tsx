"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { getCdmxLocaleFromLanguage, getCdmxWhatsappUrl } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

export default function TestimonialVideoBlock({ config }: { config: CampaignLandingConfig }) {
  const locale = getCdmxLocaleFromLanguage(config.language);
  const whatsappUrl = getCdmxWhatsappUrl(locale, "testimonial_cta");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasVideo = Boolean(config.testimonial.videoSrc);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          trackCampaignEvent("testimonial_viewed", {
            language: config.htmlLang,
            cta_location: "testimonial",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [config.htmlLang]);

  function handlePlay() {
    if (!hasVideo || !videoRef.current) return;
    void videoRef.current.play();
    setIsPlaying(true);
    trackCampaignEvent("video_played", {
      language: config.htmlLang,
      cta_location: "testimonial",
    });
  }

  function handleCtaClick() {
    trackCampaignEvent("hero_whatsapp_clicked", {
      language: config.htmlLang,
      cta_location: "testimonial",
    });
  }

  return (
    <section className="campaign-testimonial" ref={sectionRef}>
      <div className="container container--narrow">
        <div className="campaign-testimonial__media">
          {hasVideo && isVisible ? (
            <video
              ref={videoRef}
              className="campaign-testimonial__video"
              poster={config.testimonial.posterSrc}
              preload="none"
              playsInline
              controls={isPlaying}
            >
              <source src={config.testimonial.videoSrc} type="video/mp4" />
            </video>
          ) : (
            <div className="campaign-testimonial__poster">
              <Image
                src={config.testimonial.posterSrc}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                style={{ objectFit: "cover" }}
              />
              {hasVideo && (
                <button
                  type="button"
                  className="campaign-testimonial__play"
                  onClick={handlePlay}
                  aria-label="Play testimonial video"
                >
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor" aria-hidden="true">
                    <polygon points="0,0 20,12 0,24" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary campaign-testimonial__cta"
          onClick={handleCtaClick}
        >
          {config.testimonial.cta}
        </a>
      </div>
    </section>
  );
}
