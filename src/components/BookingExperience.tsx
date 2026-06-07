"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Language } from "@/data/copy";
import {
  generateBookingSlots,
  type BookingIntent,
  type BookingSlot,
} from "@/lib/booking-slots";
import { createGoogleCalendarUrl } from "@/lib/calendar-link";
import { getBookingWhatsAppUrl } from "@/config/conversionRoutes";

export type BookingQualificationData = {
  destination?: string | null;
  currentLocation?: string | null;
  context?: string | null;
  trainingProfile?: string | null;
  trainingLevel?: string | null;
  trainingGoal?: string | null;
  targetLang?: string | null;
  workshopType?: string | null;
  participantCount?: string | null;
  periodPreference?: string | null;
};

export type BookingConfirmationPayload = {
  intent: BookingIntent;
  bookingFormat: string;
  bookingInternalType: string;
  durationMinutes: number;
  selectedDate: string;
  selectedDayLabel: string;
  selectedTime: string;
  selectedDateTime: string;
  timezone: string;
};

type BookingResult = {
  ok: boolean;
  ghlStatus?: "sent" | "failed" | "mocked";
};

type Props = {
  lang: Language;
  intent: BookingIntent;
  firstName: string;
  contact: string;
  qualificationData: BookingQualificationData;
  onConfirmBooking: (payload: BookingConfirmationPayload) => Promise<BookingResult>;
  onBack?: () => void;
};

type BookingFormat = {
  internalType: string;
  durationMinutes: number;
  label: Record<Language, string>;
  description: Record<Language, string>;
};

const TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Mexico_City",
  "America/Panama",
  "America/Guadeloupe",
  "America/Martinique",
  "Asia/Dubai",
  "UTC",
];

const FORMATS: Record<BookingIntent, BookingFormat[]> = {
  training: [
    {
      internalType: "training_consultation",
      durationMinutes: 30,
      label: {
        FR: "Entretien formation",
        EN: "Training consultation",
        ES: "Entrevista de formación",
      },
      description: {
        FR: "Un premier échange pour clarifier votre projet et vos attentes.",
        EN: "An initial conversation to clarify your goals and expectations.",
        ES: "Una primera conversación para aclarar su proyecto y expectativas.",
      },
    },
    {
      internalType: "practitioner_pathway_diagnostic",
      durationMinutes: 45,
      label: {
        FR: "Diagnostic parcours praticien",
        EN: "Practitioner pathway diagnostic",
        ES: "Diagnóstico de recorrido profesional",
      },
      description: {
        FR: "Une lecture approfondie de votre profil, niveau et trajectoire.",
        EN: "An in-depth review of your profile, level, and professional path.",
        ES: "Una revisión profunda de su perfil, nivel y trayectoria profesional.",
      },
    },
    {
      internalType: "certification_support_call",
      durationMinutes: 60,
      label: {
        FR: "Appel certification / accompagnement",
        EN: "Certification / support call",
        ES: "Llamada de certificación / acompañamiento",
      },
      description: {
        FR: "Pour construire un parcours complet de certification ou d'accompagnement.",
        EN: "To shape a complete certification or long-term support pathway.",
        ES: "Para diseñar un recorrido completo de certificación o acompañamiento.",
      },
    },
  ],
  workshop: [
    {
      internalType: "workshop_discovery",
      durationMinutes: 30,
      label: {
        FR: "Appel découverte workshop",
        EN: "Workshop discovery call",
        ES: "Llamada de descubrimiento del workshop",
      },
      description: {
        FR: "Un échange ciblé pour cadrer l'intention et le contexte du workshop.",
        EN: "A focused conversation to frame the workshop's purpose and context.",
        ES: "Una conversación enfocada para definir la intención y el contexto.",
      },
    },
    {
      internalType: "team_organization",
      durationMinutes: 45,
      label: {
        FR: "Organisation équipe / établissement",
        EN: "Team / property organization",
        ES: "Organización de equipo / establecimiento",
      },
      description: {
        FR: "Pour aligner participants, contraintes opérationnelles et objectifs.",
        EN: "To align participants, operational constraints, and objectives.",
        ES: "Para alinear participantes, limitaciones operativas y objetivos.",
      },
    },
    {
      internalType: "private_group_workshop",
      durationMinutes: 60,
      label: {
        FR: "Workshop privé / groupe",
        EN: "Private / group workshop",
        ES: "Workshop privado / de grupo",
      },
      description: {
        FR: "Une préparation détaillée pour un format privé, équipe ou groupe.",
        EN: "Detailed preparation for a private, team, or group format.",
        ES: "Preparación detallada para un formato privado, de equipo o grupo.",
      },
    },
  ],
};

const TEXT = {
  FR: {
    title: "Choisissez le format de votre échange",
    subtitle: "Une demande de créneau confidentielle, confirmée personnellement par notre équipe.",
    timezone: "Votre fuseau horaire",
    date: "Choisir une date",
    time: "Choisir une heure",
    noTime: "Aucun créneau disponible pour cette date.",
    selectDate: "Sélectionnez d'abord une date.",
    summary: "Résumé de votre demande",
    requestType: "Type de demande",
    format: "Format",
    duration: "Durée",
    name: "Prénom",
    contact: "Contact",
    destination: "Destination / contexte",
    confirm: "Confirmer ma demande de créneau",
    submitting: "Transmission en cours...",
    error: "La demande n'a pas pu être enregistrée. Merci de réessayer.",
    confirmedTitle: "Votre demande est bien transmise",
    confirmed:
      "Votre demande de créneau a bien été transmise. Grégory ou son équipe confirmera personnellement ce rendez-vous.",
    calendar: "Ajouter à Google Calendar",
    whatsapp: "Envoyer un message WhatsApp",
    pending: "Créneau demandé, sous réserve de confirmation",
    training: "Formation",
    workshop: "Workshop",
    back: "Retour",
  },
  EN: {
    title: "Choose the format of your conversation",
    subtitle: "A confidential time request, personally confirmed by our team.",
    timezone: "Your timezone",
    date: "Choose a date",
    time: "Choose a time",
    noTime: "No time is available on this date.",
    selectDate: "Select a date first.",
    summary: "Your request summary",
    requestType: "Request type",
    format: "Format",
    duration: "Duration",
    name: "First name",
    contact: "Contact",
    destination: "Destination / context",
    confirm: "Confirm my time request",
    submitting: "Submitting...",
    error: "Your request could not be saved. Please try again.",
    confirmedTitle: "Your request has been submitted",
    confirmed:
      "Your time request has been sent. Grégory or his team will personally confirm this appointment.",
    calendar: "Add to Google Calendar",
    whatsapp: "Send a WhatsApp message",
    pending: "Requested time, pending confirmation",
    training: "Training",
    workshop: "Workshop",
    back: "Back",
  },
  ES: {
    title: "Elija el formato de su conversación",
    subtitle: "Una solicitud de horario confidencial, confirmada personalmente por nuestro equipo.",
    timezone: "Su zona horaria",
    date: "Elegir una fecha",
    time: "Elegir una hora",
    noTime: "No hay horarios disponibles para esta fecha.",
    selectDate: "Seleccione primero una fecha.",
    summary: "Resumen de su solicitud",
    requestType: "Tipo de solicitud",
    format: "Formato",
    duration: "Duración",
    name: "Nombre",
    contact: "Contacto",
    destination: "Destino / contexto",
    confirm: "Confirmar mi solicitud de horario",
    submitting: "Enviando...",
    error: "No se pudo guardar la solicitud. Inténtelo de nuevo.",
    confirmedTitle: "Su solicitud ha sido enviada",
    confirmed:
      "Su solicitud de horario ha sido transmitida. Grégory o su equipo confirmará personalmente esta cita.",
    calendar: "Añadir a Google Calendar",
    whatsapp: "Enviar un mensaje por WhatsApp",
    pending: "Horario solicitado, pendiente de confirmación",
    training: "Formación",
    workshop: "Workshop",
    back: "Atrás",
  },
};

function calendarTitle(lang: Language, intent: BookingIntent) {
  if (intent === "workshop") {
    if (lang === "EN") return "Méthode TMS® — Workshop consultation";
    if (lang === "ES") return "Método TMS® — Consulta workshop";
    return "Méthode TMS® — Entretien workshop";
  }

  if (lang === "EN") return "Méthode TMS® — Training consultation";
  if (lang === "ES") return "Método TMS® — Consulta formación";
  return "Méthode TMS® — Entretien formation";
}

export default function BookingExperience({
  lang,
  intent,
  firstName,
  contact,
  qualificationData,
  onConfirmBooking,
  onBack,
}: Props) {
  const copy = TEXT[lang];
  const [selectedFormat, setSelectedFormat] = useState<BookingFormat | null>(null);
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<BookingConfirmationPayload | null>(null);

  const timezoneOptions = useMemo(
    () => (TIMEZONES.includes(timezone) ? TIMEZONES : [timezone, ...TIMEZONES]),
    [timezone]
  );

  const days = useMemo(
    () =>
      selectedFormat
        ? generateBookingSlots({
            intent,
            durationMinutes: selectedFormat.durationMinutes,
            timezone,
            daysAhead: 14,
            lang,
          })
        : [],
    [intent, lang, selectedFormat, timezone]
  );

  const selectedDay = days.find((day) => day.date === selectedDate) ?? null;
  const availableSlots = selectedDay?.slots.filter((slot) => slot.available) ?? [];
  const destination =
    qualificationData.destination ||
    qualificationData.currentLocation ||
    qualificationData.context ||
    "";

  function chooseFormat(format: BookingFormat) {
    setSelectedFormat(format);
    setSelectedDate("");
    setSelectedSlot(null);
    setError(null);
  }

  function chooseTimezone(value: string) {
    setTimezone(value);
    setSelectedDate("");
    setSelectedSlot(null);
    setError(null);
  }

  async function confirmBooking() {
    if (!selectedFormat || !selectedDay || !selectedSlot) return;

    const payload: BookingConfirmationPayload = {
      intent,
      bookingFormat: selectedFormat.label[lang],
      bookingInternalType: selectedFormat.internalType,
      durationMinutes: selectedFormat.durationMinutes,
      selectedDate: selectedDay.date,
      selectedDayLabel: selectedDay.label,
      selectedTime: selectedSlot.time,
      selectedDateTime: selectedSlot.selectedDateTime,
      timezone,
    };

    setLoading(true);
    setError(null);
    try {
      const result = await onConfirmBooking(payload);
      if (!result.ok) throw new Error("Booking request failed");
      setConfirmed(payload);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    const calendarUrl = createGoogleCalendarUrl({
      title: calendarTitle(lang, intent),
      startDateTime: confirmed.selectedDateTime,
      durationMinutes: confirmed.durationMinutes,
      details: copy.pending,
      location: destination || undefined,
    });
    const whatsappUrl = getBookingWhatsAppUrl(
      lang,
      firstName,
      intent,
      confirmed.selectedDayLabel,
      confirmed.selectedTime,
      confirmed.timezone
    );

    return (
      <div className="sf-confirm booking-confirm">
        <div className="sf-confirm__photo">
          <Image
            src="/portrait.webp"
            alt="Grégory Tordjman"
            width={72}
            height={72}
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
          />
        </div>
        <h3 className="sf-confirm__headline">{copy.confirmedTitle}</h3>
        <p className="sf-confirm__call">{copy.confirmed}</p>
        <div className="booking-confirm__slot">
          <strong>{confirmed.selectedDayLabel}</strong>
          <span>{confirmed.selectedTime}</span>
          <small>{confirmed.timezone}</small>
        </div>
        <p className="sf-confirm__sms">{copy.pending}</p>
        <div className="sf-confirm__actions booking-confirm__actions">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noreferrer"
            className="sf-btn sf-btn--calendar"
          >
            {copy.calendar}
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="sf-confirm__wa"
          >
            {copy.whatsapp}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-experience">
      {onBack && (
        <button className="booking-back" onClick={onBack} type="button">
          <span aria-hidden="true">←</span>
          {copy.back}
        </button>
      )}
      <div className="booking-heading">
        <p className="sf-step__title">{copy.title}</p>
        <p className="booking-heading__sub">{copy.subtitle}</p>
      </div>

      <div className="booking-formats">
        {FORMATS[intent].map((format) => (
          <button
            className={`booking-format ${selectedFormat?.internalType === format.internalType ? "is-selected" : ""}`}
            key={format.internalType}
            onClick={() => chooseFormat(format)}
            type="button"
          >
            <span className="booking-format__duration">{format.durationMinutes} min</span>
            <strong>{format.label[lang]}</strong>
            <span>{format.description[lang]}</span>
          </button>
        ))}
      </div>

      {selectedFormat && (
        <>
          <div className="booking-grid">
            <aside className="booking-panel booking-panel--identity">
              <Image
                className="booking-panel__portrait"
                src="/portrait.webp"
                alt="Grégory Tordjman"
                width={64}
                height={64}
              />
              <p className="booking-panel__eyebrow">Méthode TMS®</p>
              <h3>Grégory Tordjman</h3>
              <p className="booking-panel__format">{selectedFormat.label[lang]}</p>
              <dl className="booking-meta">
                <div>
                  <dt>{copy.duration}</dt>
                  <dd>{selectedFormat.durationMinutes} min</dd>
                </div>
                <div>
                  <dt>{copy.timezone}</dt>
                  <dd>{timezone}</dd>
                </div>
              </dl>
              <label className="booking-timezone">
                <span>{copy.timezone}</span>
                <select value={timezone} onChange={(event) => chooseTimezone(event.target.value)}>
                  {timezoneOptions.map((zone) => (
                    <option value={zone} key={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </label>
            </aside>

            <div className="booking-panel booking-panel--dates">
              <h3>{copy.date}</h3>
              <div className="booking-days" role="list">
                {days.map((day) => {
                  const availableCount = day.slots.filter((slot) => slot.available).length;
                  return (
                    <button
                      className={`sf-day booking-day ${selectedDate === day.date ? "is-selected" : ""}`}
                      key={day.date}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedSlot(null);
                        setError(null);
                      }}
                      type="button"
                      disabled={availableCount === 0}
                    >
                      <span>{day.shortLabel}</span>
                      <small>{availableCount}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="booking-panel booking-panel--times">
              <h3>{copy.time}</h3>
              {!selectedDay ? (
                <p className="booking-empty">{copy.selectDate}</p>
              ) : availableSlots.length === 0 ? (
                <p className="booking-empty">{copy.noTime}</p>
              ) : (
                <div className="booking-times">
                  {availableSlots.map((slot) => (
                    <button
                      className={`sf-slot ${selectedSlot?.selectedDateTime === slot.selectedDateTime ? "sf-slot--selected" : ""}`}
                      key={slot.selectedDateTime}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setError(null);
                      }}
                      type="button"
                    >
                      <span className="sf-slot__time">{slot.time}</span>
                      <span className="booking-slot__duration">
                        {selectedFormat.durationMinutes} min
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedDay && selectedSlot && (
            <div className="booking-summary">
              <div className="booking-summary__head">
                <p className="booking-panel__eyebrow">{copy.summary}</p>
                <strong>{copy.pending}</strong>
              </div>
              <dl className="booking-summary__grid">
                <div>
                  <dt>{copy.requestType}</dt>
                  <dd>{intent === "training" ? copy.training : copy.workshop}</dd>
                </div>
                <div>
                  <dt>{copy.format}</dt>
                  <dd>{selectedFormat.label[lang]}</dd>
                </div>
                <div>
                  <dt>{copy.duration}</dt>
                  <dd>{selectedFormat.durationMinutes} min</dd>
                </div>
                <div>
                  <dt>{copy.name}</dt>
                  <dd>{firstName}</dd>
                </div>
                <div>
                  <dt>{copy.contact}</dt>
                  <dd>{contact}</dd>
                </div>
                <div>
                  <dt>{copy.date}</dt>
                  <dd>{selectedDay.label}</dd>
                </div>
                <div>
                  <dt>{copy.time}</dt>
                  <dd>{selectedSlot.time}</dd>
                </div>
                <div>
                  <dt>{copy.timezone}</dt>
                  <dd>{timezone}</dd>
                </div>
                {destination && (
                  <div className="booking-summary__wide">
                    <dt>{copy.destination}</dt>
                    <dd>{destination}</dd>
                  </div>
                )}
              </dl>
              <button
                className={`sf-btn sf-btn--cta booking-summary__cta ${loading ? "is-loading" : ""}`}
                onClick={confirmBooking}
                disabled={loading}
                type="button"
              >
                {loading ? <span className="sf-spinner" /> : copy.confirm}
              </button>
              {error && (
                <p className="sf-error" role="alert" aria-live="polite">
                  {error}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
