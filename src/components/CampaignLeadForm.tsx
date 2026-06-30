"use client";

import React, { useMemo, useRef, useState } from "react";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { trackMetaLead } from "@/components/MetaPixel";

type CampaignLeadFormProps = {
  config: CampaignLandingConfig;
  id?: string;
};

type CampaignFormState = {
  needType: string;
  currentLocation: string;
  urgency: string;
  firstName: string;
  contact: string;
  context: string;
};

type LeadApiResult = {
  ok?: boolean;
  error?: string;
};

const initialForm: CampaignFormState = {
  needType: "",
  currentLocation: "",
  urgency: "",
  firstName: "",
  contact: "",
  context: "",
};

function isValidFirstName(value: string) {
  return value.trim().length >= 2;
}

function isValidContactValue(value: string) {
  const contact = value.trim();
  if (contact.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.toLowerCase());
  return contact.replace(/\D/g, "").length >= 6;
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

function CampaignField({
  label,
  placeholder,
  value,
  onChange,
  valid,
  multiline,
  inputType = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  valid?: boolean;
  multiline?: boolean;
  inputType?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <label className={`sf-field ${focused ? "is-focused" : ""} ${value ? "has-value" : ""} ${valid ? "is-valid" : ""}`}>
      <span className="sf-field__label">{label}</span>
      <div className="sf-field__wrap">
        {multiline ? (
          <textarea
            className="sf-field__input"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={3}
          />
        ) : (
          <input
            className="sf-field__input"
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        )}
        {valid && (
          <span className="sf-field__check" aria-label="Valide">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <polyline
                points="1,5.5 5,9.5 13,1"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <span className="sf-field__rule" />
    </label>
  );
}

export default function CampaignLeadForm({ config, id = "solicitud" }: CampaignLeadFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CampaignFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submissionInFlightRef = useRef(false);
  const trackedLeadEventIdsRef = useRef<Set<string>>(new Set());
  const copy = config.form;
  const totalSteps = copy.steps.length;

  const canProceed = useMemo(() => {
    if (step === 1) return form.needType !== "";
    if (step === 2) return form.currentLocation.trim().length >= 2 && form.urgency !== "";
    if (step === 3) return isValidFirstName(form.firstName) && isValidContactValue(form.contact);
    return true;
  }, [form, step]);

  const showContactError = form.contact.trim().length > 0 && !isValidContactValue(form.contact);
  const progress = submitted ? 100 : (step / totalSteps) * 100;

  function updateField<Key extends keyof CampaignFormState>(key: Key, value: CampaignFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitError(null);
  }

  function goNext() {
    if (!canProceed) {
      setSubmitError(copy.requiredError);
      return;
    }

    setSubmitError(null);
    setStep((current) => Math.min(current + 1, totalSteps));
  }

  function goBack() {
    setSubmitError(null);
    setStep((current) => Math.max(current - 1, 1));
  }

  function resetAll() {
    trackedLeadEventIdsRef.current.clear();
    submissionInFlightRef.current = false;
    setForm(initialForm);
    setStep(1);
    setSubmitted(false);
    setSubmitError(null);
  }

  async function submitLead() {
    if (loading || submissionInFlightRef.current) return;
    if (!canProceed) {
      setSubmitError(copy.requiredError);
      return;
    }

    submissionInFlightRef.current = true;
    setLoading(true);
    setSubmitError(null);
    const eventId = createMetaEventId();
    const contextLines = [
      "[Landing CDMX Meta]",
      `Ville campagne: ${config.cityName}`,
      `Offre: ${config.offer}`,
      form.context.trim() ? `Message: ${form.context.trim()}` : "",
    ].filter(Boolean);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          contact: form.contact.trim(),
          type: config.leadType,
          context: contextLines.join("\n"),
          lang: config.language,
          selectedDayLabel: null,
          selectedTime: null,
          selectedDateTime: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          pageUrl: window.location.href,
          eventId,
          utm: getUrlUtm(),
          branchData: config.branchData,
          companyName: null,
          jobTitle: null,
          propertyType: null,
          destination: config.destination,
          leadSegment: config.leadSegment,
          intent: "private_session",
          preferredChannel: "ghl",
          routedToUrl: null,
          urgency: form.urgency,
          needType: form.needType,
          volumePotential: null,
          participantCount: null,
          currentLocation: form.currentLocation.trim(),
        }),
      });

      const result = (await response.json().catch(() => null)) as LeadApiResult | null;
      if (!response.ok || !result?.ok) {
        if (result?.error === "INVALID_CONTACT") throw new Error("INVALID_CONTACT");
        throw new Error("LEAD_SUBMISSION_FAILED");
      }

      if (!trackedLeadEventIdsRef.current.has(eventId)) {
        trackedLeadEventIdsRef.current.add(eventId);
        trackMetaLead(
          {
            content_name: "lead_form_submission",
            content_category: config.tracking.contentCategory,
            lang: config.language,
            intent: "private_session",
            preferred_channel: "ghl",
            lead_segment: config.leadSegment,
            page_path: window.location.pathname,
          },
          { eventID: eventId }
        );
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error && error.message === "INVALID_CONTACT" ? copy.contactError : copy.submitError);
      submissionInFlightRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  const arrow = (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
      <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
      <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );

  return (
    <section className="contact campaign-form" id={id}>
      <div className="container container--form">
        <div className="contact-head">
          <span className="eyebrow eyebrow--gold">{copy.label}</span>
          <h2 className="contact-headline">{copy.headline}</h2>
          <p className="contact-sub">{copy.sub}</p>
        </div>

        <div className="sf-progress">
          <div className="sf-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        {!submitted && (
          <div className="sf-indicators campaign-form__indicators">
            {copy.steps.map((label, index) => {
              const itemStep = index + 1;
              const isActive = step === itemStep;
              const isDone = step > itemStep;

              return (
                <button
                  key={label}
                  className={`sf-ind ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                  onClick={() => {
                    if (isDone) setStep(itemStep);
                  }}
                  disabled={!isDone}
                  type="button"
                >
                  <span className="sf-ind__num">{String(itemStep).padStart(2, "0")}</span>
                  <span className="sf-ind__sep">—</span>
                  <span className="sf-ind__text">{label}</span>
                </button>
              );
            })}
            <div className="sf-ind__track">
              <div className="sf-ind__fill" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="sf-content">
          <div className="sf-slider">
            {submitted ? (
              <div className="sf-slide is-active">
                <div className="sf-confirm campaign-form__confirm">
                  <h3 className="sf-confirm__headline">{copy.successTitle}</h3>
                  <p className="sf-confirm__call">{copy.successBody}</p>
                  <p className="sf-confirm__sms">{copy.successNote}</p>
                  <div className="sf-confirm__actions campaign-form__success-actions">
                    <a
                      href={copy.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="sf-btn sf-btn--calendar"
                    >
                      <span>{copy.whatsappLabel}</span>
                    </a>
                    <button className="sf-btn sf-btn--ghost" onClick={resetAll} type="button">
                      {copy.newRequest}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="sf-slide is-active">
                    <p className="sf-step__title">{copy.needQuestion}</p>
                    <div className="sf-types campaign-form__chips">
                      {copy.needOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`sf-type ${form.needType === option.value ? "is-selected" : ""}`}
                          onClick={() => updateField("needType", option.value)}
                          type="button"
                          aria-pressed={form.needType === option.value}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="sf-nav sf-nav--between">
                      <span />
                      <button className="sf-btn" onClick={goNext} disabled={!canProceed} type="button">
                        <span>{copy.next}</span>
                        {arrow}
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="sf-slide is-active">
                    <p className="sf-step__title">{copy.locationQuestion}</p>
                    <div className="sf-fields">
                      <CampaignField
                        label={copy.fields.location}
                        placeholder={copy.fields.locationPlaceholder}
                        value={form.currentLocation}
                        onChange={(value) => updateField("currentLocation", value)}
                        valid={form.currentLocation.trim().length >= 2}
                      />
                    </div>
                    <label className="sf-field__label campaign-form__option-label">{copy.availabilityLabel}</label>
                    <div className="sf-types campaign-form__chips">
                      {copy.urgencyOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`sf-type ${form.urgency === option.value ? "is-selected" : ""}`}
                          onClick={() => updateField("urgency", option.value)}
                          type="button"
                          aria-pressed={form.urgency === option.value}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="sf-nav sf-nav--between">
                      <button className="sf-btn sf-btn--back" onClick={goBack} type="button">
                        ←
                      </button>
                      <button className="sf-btn" onClick={goNext} disabled={!canProceed} type="button">
                        <span>{copy.next}</span>
                        {arrow}
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="sf-slide is-active">
                    <p className="sf-step__title">{copy.identityQuestion}</p>
                    <div className="sf-fields">
                      <CampaignField
                        label={copy.fields.firstName}
                        placeholder={copy.fields.firstNamePlaceholder}
                        value={form.firstName}
                        onChange={(value) => updateField("firstName", value)}
                        valid={isValidFirstName(form.firstName)}
                      />
                      <CampaignField
                        label={copy.fields.contact}
                        placeholder={copy.fields.contactPlaceholder}
                        value={form.contact}
                        onChange={(value) => updateField("contact", value)}
                        valid={isValidContactValue(form.contact)}
                      />
                    </div>
                    {showContactError && <p className="sf-help" role="status">{copy.contactError}</p>}
                    <div className="sf-nav sf-nav--between">
                      <button className="sf-btn sf-btn--back" onClick={goBack} type="button">
                        ←
                      </button>
                      <button className="sf-btn" onClick={goNext} disabled={!canProceed} type="button">
                        <span>{copy.next}</span>
                        {arrow}
                      </button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="sf-slide is-active">
                    <p className="sf-step__title">{copy.contextQuestion}</p>
                    <div className="sf-fields">
                      <CampaignField
                        label={copy.fields.context}
                        placeholder={copy.fields.contextPlaceholder}
                        value={form.context}
                        onChange={(value) => updateField("context", value)}
                        multiline
                      />
                    </div>
                    <div className="sf-nav sf-nav--between">
                      <button className="sf-btn sf-btn--back" onClick={goBack} type="button">
                        ←
                      </button>
                      <button
                        className={`sf-btn sf-btn--cta ${loading ? "is-loading" : ""}`}
                        onClick={submitLead}
                        disabled={loading}
                        type="button"
                      >
                        {loading ? <span className="sf-spinner" /> : <><span>{copy.submit}</span>{arrow}</>}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {submitError && <p className="sf-error" role="alert" aria-live="polite">{submitError}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
