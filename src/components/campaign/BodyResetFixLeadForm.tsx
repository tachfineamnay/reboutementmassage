"use client";

import { useRef, useState } from "react";

export const BODY_RESET_FIX_FORM_KIND = "body_reset_fix" as const;

export type BodyResetFixFormState = {
  name: string;
  phone: string;
  city: string;
  painDescription: string;
  sessionLocationPreference: string;
  availability: string;
  marketingConsent: boolean;
};

export type BodyResetFixFormErrors = Partial<Record<keyof BodyResetFixFormState, string>>;

export type BodyResetFixPayload = {
  formKind: typeof BODY_RESET_FIX_FORM_KIND;
  firstName: string;
  contact: string;
  type: string;
  context: string;
  lang: "ES";
  selectedDayLabel: null;
  selectedTime: null;
  selectedDateTime: null;
  timezone: string | null;
  pageUrl: string | null;
  eventId: string;
  utm: Record<string, string>;
  branchData: {
    formKind: typeof BODY_RESET_FIX_FORM_KIND;
    sessionLocationPreference: string;
    preSessionNotes: string;
    marketingConsent: "true" | "false";
  };
  companyName: null;
  jobTitle: null;
  propertyType: null;
  destination: string;
  leadSegment: "b2c_premium";
  intent: "private_session";
  preferredChannel: "ghl";
  routedToUrl: null;
  urgency: string;
  needType: string;
  volumePotential: null;
  participantCount: null;
  currentLocation: string;
};

type LeadApiResult = {
  ok?: boolean;
  error?: string;
  ghlStatus?: "sent" | "mocked" | "failed" | "captured";
  duplicate?: boolean;
};

const REQUIRED_MESSAGE = "Completa este campo para enviar tu solicitud.";
const CONTACT_MESSAGE = "Incluye un WhatsApp o teléfono válido.";

const INITIAL_FORM: BodyResetFixFormState = {
  name: "",
  phone: "",
  city: "",
  painDescription: "",
  sessionLocationPreference: "",
  availability: "",
  marketingConsent: false,
};

function createMetaEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `body_reset_fix_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getUrlUtm() {
  if (typeof window === "undefined") return {};
  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Array.from(searchParams.entries()).filter(([key]) => key.toLowerCase().startsWith("utm_"))
  );
}

export function normalizeBodyResetFixPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

function isValidPhone(value: string) {
  return normalizeBodyResetFixPhone(value).replace(/\D/g, "").length >= 6;
}

export function validateBodyResetFixForm(form: BodyResetFixFormState): BodyResetFixFormErrors {
  const errors: BodyResetFixFormErrors = {};

  if (form.name.trim().length < 2) errors.name = REQUIRED_MESSAGE;
  if (!isValidPhone(form.phone)) errors.phone = CONTACT_MESSAGE;
  if (!form.city.trim()) errors.city = REQUIRED_MESSAGE;
  if (!form.painDescription.trim()) errors.painDescription = REQUIRED_MESSAGE;
  if (!form.sessionLocationPreference.trim()) errors.sessionLocationPreference = REQUIRED_MESSAGE;
  if (!form.availability.trim()) errors.availability = REQUIRED_MESSAGE;

  return errors;
}

export function isBodyResetFixSubmitBlocked(isSubmitting: boolean) {
  return isSubmitting;
}

export function buildBodyResetFixPayload(
  form: BodyResetFixFormState,
  eventId: string,
  pageUrl: string | null,
  timezone: string | null,
  utm: Record<string, string> = {}
): BodyResetFixPayload {
  const currentLocation = form.city.trim();
  const preSessionNotes = form.availability.trim();

  return {
    formKind: BODY_RESET_FIX_FORM_KIND,
    firstName: form.name.trim(),
    contact: normalizeBodyResetFixPhone(form.phone),
    type: "Body Reset Fix CDMX",
    context: form.painDescription.trim(),
    lang: "ES",
    selectedDayLabel: null,
    selectedTime: null,
    selectedDateTime: null,
    timezone,
    pageUrl,
    eventId,
    utm,
    branchData: {
      formKind: BODY_RESET_FIX_FORM_KIND,
      sessionLocationPreference: form.sessionLocationPreference.trim(),
      preSessionNotes,
      marketingConsent: form.marketingConsent ? "true" : "false",
    },
    companyName: null,
    jobTitle: null,
    propertyType: null,
    destination: "Ciudad de Mexico",
    leadSegment: "b2c_premium",
    intent: "private_session",
    preferredChannel: "ghl",
    routedToUrl: null,
    urgency: preSessionNotes,
    needType: "Body Reset Fix",
    volumePotential: null,
    participantCount: null,
    currentLocation,
  };
}

export default function BodyResetFixLeadForm() {
  const [form, setForm] = useState<BodyResetFixFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<BodyResetFixFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ghlFailed, setGhlFailed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submissionInFlightRef = useRef(false);

  function updateField<Key extends keyof BodyResetFixFormState>(
    key: Key,
    value: BodyResetFixFormState[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submitLead(event: React.FormEvent) {
    event.preventDefault();
    if (isBodyResetFixSubmitBlocked(submissionInFlightRef.current)) return;

    const nextErrors = validateBodyResetFixForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Revisa los campos marcados antes de enviar.");
      return;
    }

    submissionInFlightRef.current = true;
    setLoading(true);
    setSubmitError(null);
    setGhlFailed(false);

    const eventId = createMetaEventId();
    const payload = buildBodyResetFixPayload(
      form,
      eventId,
      typeof window === "undefined" ? null : window.location.href,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      getUrlUtm()
    );

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as LeadApiResult | null;

      if (!response.ok || !result?.ok) {
        if (result?.error === "INVALID_CONTACT") {
          setErrors((current) => ({ ...current, phone: CONTACT_MESSAGE }));
        }
        throw new Error(result?.error || "LEAD_SUBMISSION_FAILED");
      }

      setGhlFailed(result.ghlStatus === "failed");
      setSubmitted(true);
    } catch {
      setSubmitError("No pudimos enviar la solicitud. Puedes escribir directamente por WhatsApp.");
    } finally {
      submissionInFlightRef.current = false;
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="contact campaign-form campaign-short-form" id="solicitud-body-reset-fix">
        <div className="container container--form">
          <div className="sf-confirm campaign-form__confirm">
            <h3 className="sf-confirm__headline">Solicitud recibida.</h3>
            <p className="sf-confirm__call">
              {ghlFailed
                ? "Tu solicitud quedo registrada. Si la sincronizacion CRM falla, tambien puedes escribir por WhatsApp para acelerar la respuesta."
                : "Te responderemos por WhatsApp con la mejor orientacion para tu Body Reset Fix."}
            </p>
            <button
              className="sf-btn sf-btn--ghost"
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm(INITIAL_FORM);
              }}
            >
              Enviar otra solicitud
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact campaign-form campaign-short-form" id="solicitud-body-reset-fix">
      <div className="container container--form">
        <div className="contact-head">
          <span className="eyebrow eyebrow--gold">Alternativa al WhatsApp</span>
          <h2>Solicitud Body Reset Fix</h2>
          <p>
            Si prefieres dejar una demanda estructurada, comparte la zona de dolor y tus
            disponibilidades.
          </p>
        </div>

        <form className="campaign-short-form__form" onSubmit={submitLead} noValidate>
          <div className="campaign-short-form__grid">
            <label className="campaign-short-form__field">
              <span>Nom</span>
              <input
                className="campaign-short-form__input"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <small>{errors.name}</small> : null}
            </label>

            <label className="campaign-short-form__field">
              <span>WhatsApp/teléfono</span>
              <input
                className="campaign-short-form__input"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone ? <small>{errors.phone}</small> : null}
            </label>

            <label className="campaign-short-form__field">
              <span>Ville/localisation</span>
              <input
                className="campaign-short-form__input"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                autoComplete="address-level2"
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city ? <small>{errors.city}</small> : null}
            </label>

            <label className="campaign-short-form__field">
              <span>Cabinet ou domicile</span>
              <select
                className="campaign-short-form__input"
                value={form.sessionLocationPreference}
                onChange={(event) => updateField("sessionLocationPreference", event.target.value)}
                aria-invalid={Boolean(errors.sessionLocationPreference)}
              >
                <option value="">Choisir</option>
                <option value="Cabinet">Cabinet</option>
                <option value="Domicile">Domicilio</option>
                <option value="Prefiero orientacion">Prefiero orientacion</option>
              </select>
              {errors.sessionLocationPreference ? <small>{errors.sessionLocationPreference}</small> : null}
            </label>
          </div>

          <label className="campaign-short-form__field">
            <span>Description de la douleur : zone, ancienneté, intensité</span>
            <textarea
              className="campaign-short-form__input"
              value={form.painDescription}
              onChange={(event) => updateField("painDescription", event.target.value)}
              rows={4}
              aria-invalid={Boolean(errors.painDescription)}
            />
            {errors.painDescription ? <small>{errors.painDescription}</small> : null}
          </label>

          <label className="campaign-short-form__field">
            <span>Disponibilités : jour, créneau, moyen de contact</span>
            <textarea
              className="campaign-short-form__input"
              value={form.availability}
              onChange={(event) => updateField("availability", event.target.value)}
              rows={3}
              aria-invalid={Boolean(errors.availability)}
            />
            {errors.availability ? <small>{errors.availability}</small> : null}
          </label>

          <label className="campaign-short-form__consent">
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(event) => updateField("marketingConsent", event.target.checked)}
            />
            <span>Acepto recibir seguimiento relacionado con esta solicitud.</span>
          </label>

          {submitError ? <p className="campaign-short-form__error">{submitError}</p> : null}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar solicitud Body Reset Fix"}
          </button>
        </form>
      </div>
    </section>
  );
}
