"use client";

import TestimonialVideoBlock from "@/components/campaign/TestimonialVideoBlock";
import { useGrowthTracking } from "@/components/TrackingProvider";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { TestimonialSectionProps } from "@/lib/builder/puck-data-schema";

export default function TestimonialSection(props: TestimonialSectionProps) {
  const { config } = useLandingRenderContext();
  const { track } = useGrowthTracking();
  const hasQuote = props.variant === "quote" && props.quote.trim().length > 0;

  if (hasQuote) {
    return (
      <section className="campaign-testimonial">
        <div className="container container--narrow">
          <blockquote className="campaign-testimonial__quote">
            <p>{props.quote}</p>
            {props.attribution ? <cite>{props.attribution}</cite> : null}
          </blockquote>
          {props.cta ? (
            <a
              href={config.whatsappUrls.testimonial_cta}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary campaign-testimonial__cta"
              onClick={() =>
                track("hero_whatsapp_clicked", {
                  language: config.htmlLang,
                  cta_location: "testimonial",
                  city: config.destinationSlug,
                  offer: config.offerType,
                })
              }
            >
              {props.cta}
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <TestimonialVideoBlock
      config={{
        ...config,
        testimonial: {
          posterSrc: props.posterSrc || config.testimonial.posterSrc,
          videoSrc: props.videoSrc || config.testimonial.videoSrc,
          cta: props.cta || config.testimonial.cta,
        },
      }}
    />
  );
}
