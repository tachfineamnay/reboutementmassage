"use client";

import { useState } from "react";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

export default function CampaignFaq({ config }: { config: CampaignLandingConfig }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    const next = openIndex === index ? null : index;
    setOpenIndex(next);
    if (next !== null) {
      trackCampaignEvent("faq_opened", {
        language: config.htmlLang,
        faq_question: config.faq[index]?.question,
      });
    }
  }

  return (
    <section className="campaign-faq">
      <div className="container container--narrow">
        <span className="eyebrow eyebrow--gold">{config.sections.faqEyebrow}</span>
        <h2 className="section-title">{config.sections.faqTitle}</h2>
        <div className="campaign-faq__list">
          {config.faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article className={`campaign-faq__item ${isOpen ? "is-open" : ""}`} key={item.question}>
                <button
                  type="button"
                  className="campaign-faq__question"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className="campaign-faq__icon" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && <p className="campaign-faq__answer">{item.answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
