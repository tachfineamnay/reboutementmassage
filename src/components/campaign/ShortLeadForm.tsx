"use client";

import { useState } from "react";
import type { CampaignLandingConfig } from "@/data/campaign-landings";
import { trackCampaignEvent } from "@/lib/campaign-tracking";

type ShortFormState = {
  needType: string;
  contact: string;
  preferredLanguage: "FR" | "EN" | "ES" | "";
  firstName: string;
  offerIntent: string;
  urgency: string;
  context: string;
};

type LeadApiResult = {
  ok?: boolean;
  error?: string;
};

function isValidContact(value: string) {
  return value.replace(/\D/g, "").length >= 6;
}

function isValidFirstName(value: string) {
  return value.trim().length >= 2;
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

function getOfferLabel(
  copy: CampaignLandingConfig["shortForm"],
  offerIntent: string
) {
  return copy.offerOptions?.find((option) => option.value === offerIntent)?.label ?? offerIntent;
}

function getOptionLabel(options: Array<{ value: string; label: string }> | undefined, value: string) {
  return options?.find((option) => option.value === value)?.label ?? value;
}

function normalizeOfferIntent(value: string) {
  if (value === "body_reset_fix" || value === "french_body_reset_full") return value;
  return "orientation";
}

export default function ShortLeadForm({
  config,
  id = "solicitud",
}: {
  config: CampaignLandingConfig;
  id?: string;
}) {
  const copy = config.shortForm;
  const isExtendedForm = Boolean(copy.offerOptions?.length);

  const [form, setForm] = useState<ShortFormState>({
    needType: "",
    contact: "",
    preferredLanguage: config.language,
    firstName: "",
    offerIntent: "",
    urgency: "",
    context: "",
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
        city: config.destinationSlug,
        offer: config.offerType,
        session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
      });
    }
  }

  function resetForm() {
    setForm({
      needType: "",
      contact: "",
      preferredLanguage: config.language,
      firstName: "",
      offerIntent: "",
      urgency: "",
      context: "",
    });
  }

  async function submitLead(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    if (isExtendedForm) {
      if (
        !isValidFirstName(form.firstName) ||
        !isValidContact(form.contact) ||
        !form.needType ||
        !form.offerIntent ||
        !form.urgency
      ) {
        setSubmitError(copy.requiredError);
        return;
      }
    } else if (!form.needType || !isValidContact(form.contact) || !form.preferredLanguage) {
      setSubmitError(copy.requiredError);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    const eventId = createMetaEventId();

    const offerLabel = form.offerIntent ? getOfferLabel(copy, form.offerIntent) : "";
    const needLabel = getOptionLabel(copy.needOptions, form.needType);
    const urgencyLabel = getOptionLabel(copy.urgencyOptions, form.urgency);
    const normalizedIntent = normalizeOfferIntent(form.offerIntent);
    const contextParts = isExtendedForm
      ? [
          `${copy.tensionLabel}: ${needLabel}`,
          copy.offerLabel ? `${copy.offerLabel}: ${offerLabel}` : `Formato: ${offerLabel}`,
          copy.urgencyLabel ? `${copy.urgencyLabel}: ${urgencyLabel}` : `Urgencia: ${urgencyLabel}`,
          form.context.trim() ? `${copy.contextLabel ?? "Mensaje"}: ${form.context.trim()}` : "",
        ].filter(Boolean)
      : [`Langue préférée: ${form.preferredLanguage}`];

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: isExtendedForm ? form.firstName.trim() : "Landing lead",
          contact: form.contact.trim(),
          type: config.leadType,
          context: contextParts.join("\n"),
          lang: isExtendedForm ? config.language : form.preferredLanguage,
          selectedDayLabel: null,
          selectedTime: null,
          selectedDateTime: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          pageUrl: window.location.href,
          eventId,
          utm: getUrlUtm(),
          branchData: {
            ...config.branchData,
            durationMinutes: String(config.durationMinutes),
            destinationSlug: config.destinationSlug,
            offerType: config.offerType,
            ...(isExtendedForm
              ? {
                  offerIntent: normalizedIntent,
                  offerLabel,
                  needType: form.needType,
                  needLabel,
                  urgency: form.urgency,
                  urgencyLabel,
                }
              : {}),
          },
          companyName: null,
          jobTitle: null,
          propertyType: null,
          destination: config.cityName,
          leadSegment: config.leadSegment,
          intent: isExtendedForm ? normalizedIntent : config.offerType || "private_session",
          preferredChannel: "ghl",
          routedToUrl: null,
          urgency: isExtendedForm ? urgencyLabel : "Cette semaine",
          needType: isExtendedForm ? needLabel : form.needType,
          volumePotential: null,
          participantCount: null,
          currentLocation: config.cityName,
          landingPageId: config.landingPageId,
          destinationId: config.destinationId,
          offerId: config.offerId,
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
        need_type: isExtendedForm ? undefined : (form.needType || undefined),
        meta_event_id: eventId,
        city: config.destinationSlug,
        offer: isExtendedForm ? normalizedIntent : config.offerType,
        session_duration: config.durationMinutes ? `${config.durationMinutes}_min` : undefined,
        content_name: config.tracking.viewContentName,
        lead_segment: config.leadSegment,
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

  const whatsappAfterUrl = config.whatsappUrls.more_info_intent;

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
                  resetForm();
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
          {isExtendedForm ? (
            <>
              {copy.nameLabel && (
                <label className="campaign-short-form__field">
                  <span className="campaign-short-form__label">{copy.nameLabel}</span>
                  <input
                    className="campaign-short-form__input"
                    type="text"
                    autoComplete="name"
                    placeholder={copy.namePlaceholder}
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    onFocus={handleFocus}
                    required
                  />
                </label>
              )}

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
                <span className="campaign-short-form__label">{copy.tensionLabel}</span>
                <select
                  className="campaign-short-form__input"
                  value={form.needType}
                  onChange={(e) => setForm((f) => ({ ...f, needType: e.target.value }))}
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

              {copy.offerLabel && copy.offerOptions?.length ? (
                <label className="campaign-short-form__field">
                  <span className="campaign-short-form__label">{copy.offerLabel}</span>
                  <select
                    className="campaign-short-form__input"
                    value={form.offerIntent}
                    onChange={(e) => setForm((f) => ({ ...f, offerIntent: e.target.value }))}
                    onFocus={handleFocus}
                    required
                  >
                    <option value="">{copy.offerPlaceholder}</option>
                    {copy.offerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {copy.urgencyLabel && copy.urgencyOptions?.length ? (
                <label className="campaign-short-form__field">
                  <span className="campaign-short-form__label">{copy.urgencyLabel}</span>
                  <select
                    className="campaign-short-form__input"
                    value={form.urgency}
                    onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}
                    onFocus={handleFocus}
                    required
                  >
                    <option value="">{copy.urgencyPlaceholder}</option>
                    {copy.urgencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {copy.contextLabel && (
                <label className="campaign-short-form__field">
                  <span className="campaign-short-form__label">{copy.contextLabel}</span>
                  <textarea
                    className="campaign-short-form__input"
                    rows={3}
                    placeholder={copy.contextPlaceholder}
                    value={form.context}
                    onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                    onFocus={handleFocus}
                  />
                </label>
              )}
            </>
          ) : (
            <>
              <label className="campaign-short-form__field">
                <span className="campaign-short-form__label">{copy.tensionLabel}</span>
                <select
                  className="campaign-short-form__input"
                  value={form.needType}
                  onChange={(e) => setForm((f) => ({ ...f, needType: e.target.value }))}
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
            </>
          )}

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
