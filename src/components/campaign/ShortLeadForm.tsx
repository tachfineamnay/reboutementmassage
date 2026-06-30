"use client";

import { useState } from "react";
import type { CampaignLandingConfig, CampaignNeedCategory } from "@/data/campaign-landings";
import { getCdmxLocaleFromLanguage, getCdmxWhatsappUrl } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

type ShortFormState = {
  needType: CampaignNeedCategory | "";
  contact: string;
  preferredLanguage: "FR" | "EN" | "ES" | "";
};

type LeadApiResult = {
  ok?: boolean;
  error?: string;
};

function isValidContact(value: string) {
  return value.replace(/\D/g, "").length >= 6;
}

function createMetaEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getUrlUtm() {
  if (typeof window === "undefined") return {};
  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Array.from(searchParams.entries()).filter(([key]) => key.toLowerCase().startsWith("utm_"))
  );
}

export default function ShortLeadForm({
  config,
  id = "solicitud",
}: {
  config: CampaignLandingConfig;
  id?: string;
}) {
  const copy = config.shortForm;
  const locale = getCdmxLocaleFromLanguage(config.language);
  const [form, setForm] = useState<ShortFormState>({
    needType: "",
    contact: "",
    preferredLanguage: config.language,
  });
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleFocus() {
    if (!started) {
      setStarted(true);
      trackCampaignEvent("form_started", {
        language: config.htmlLang,
        cta_location: "form",
      });
    }
  }

  async function submitLead(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    if (!form.needType || !isValidContact(form.contact) || !form.preferredLanguage) {
      setSubmitError(copy.requiredError);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    const eventId = createMetaEventId();

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "CDMX",
          contact: form.contact.trim(),
          type: config.leadType,
          context: `Langue préférée: ${form.preferredLanguage}`,
          lang: form.preferredLanguage,
          selectedDayLabel: null,
          selectedTime: null,
          selectedDateTime: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          pageUrl: window.location.href,
          eventId,
          utm: getUrlUtm(),
          branchData: {
            ...config.branchData,
            durationMinutes: 75,
          },
          companyName: null,
          jobTitle: null,
          propertyType: null,
          destination: config.destination,
          leadSegment: config.leadSegment,
          intent: "private_session",
          preferredChannel: "ghl",
          routedToUrl: null,
          urgency: "Cette semaine",
          needType: form.needType,
          volumePotential: null,
          participantCount: null,
          currentLocation: "Ciudad de México",
        }),
      });

      const result = (await response.json().catch(() => null)) as LeadApiResult | null;
      if (!response.ok || !result?.ok) {
        if (result?.error === "INVALID_CONTACT") throw new Error("INVALID_CONTACT");
        throw new Error("LEAD_SUBMISSION_FAILED");
      }

      trackCampaignEvent("form_submitted", {
        language: config.htmlLang,
        cta_location: "form",
        need_type: form.needType,
        meta_event_id: eventId,
      });

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message === "INVALID_CONTACT"
          ? copy.contactError
          : copy.submitError
      );
    } finally {
      setLoading(false);
    }
  }

  const whatsappAfterUrl = getCdmxWhatsappUrl(locale, "more_info_intent");

  if (submitted) {
    return (
      <section className="contact campaign-form campaign-short-form" id={id}>
        <div className="container container--form">
          <div className="sf-confirm campaign-form__confirm">
            <h3 className="sf-confirm__headline">{copy.successTitle}</h3>
            <p className="sf-confirm__call">{copy.successBody}</p>
            <p className="sf-confirm__sms">{copy.successNote}</p>
            <div className="sf-confirm__actions campaign-form__success-actions">
              <a
                href={whatsappAfterUrl}
                target="_blank"
                rel="noreferrer"
                className="sf-btn sf-btn--calendar"
              >
                {copy.whatsappAfterLabel}
              </a>
              <button
                className="sf-btn sf-btn--ghost"
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ needType: "", contact: "", preferredLanguage: config.language });
                }}
              >
                {copy.newRequest}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact campaign-form campaign-short-form" id={id}>
      <div className="container container--form">
        <div className="contact-head">
          <span className="eyebrow eyebrow--gold">{copy.label}</span>
          <h2 className="contact-headline">{copy.headline}</h2>
          <p className="contact-sub">{copy.sub}</p>
        </div>

        <form className="campaign-short-form__form" onSubmit={submitLead} noValidate>
          <label className="campaign-short-form__field">
            <span className="campaign-short-form__label">{copy.tensionLabel}</span>
            <select
              className="campaign-short-form__input"
              value={form.needType}
              onChange={(e) => setForm((f) => ({ ...f, needType: e.target.value as CampaignNeedCategory }))}
              onFocus={handleFocus}
              required
            >
              <option value="">{copy.tensionPlaceholder}</option>
              {copy.needOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="campaign-short-form__field">
            <span className="campaign-short-form__label">{copy.whatsappLabel}</span>
            <input
              className="campaign-short-form__input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={copy.whatsappPlaceholder}
              value={form.contact}
              onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
              onFocus={handleFocus}
              required
            />
          </label>

          <label className="campaign-short-form__field">
            <span className="campaign-short-form__label">{copy.languageLabel}</span>
            <select
              className="campaign-short-form__input"
              value={form.preferredLanguage}
              onChange={(e) =>
                setForm((f) => ({ ...f, preferredLanguage: e.target.value as "FR" | "EN" | "ES" }))
              }
              onFocus={handleFocus}
              required
            >
              <option value="">{copy.tensionPlaceholder}</option>
              {copy.languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {submitError && (
            <p className="sf-error" role="alert">
              {submitError}
            </p>
          )}

          <button className="btn-primary campaign-short-form__submit" type="submit" disabled={loading}>
            {loading ? copy.submitting : copy.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
