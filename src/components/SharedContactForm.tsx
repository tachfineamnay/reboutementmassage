"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { COPY, Language } from "@/data/copy";
import { INTENT_LABELS, ConversionIntent } from "@/config/conversionRoutes";
import { trackMetaLead } from "@/components/MetaPixel";
import {
  resolveGhlCalendarUrl,
  type GhlCalendarIntent,
  type GhlCalendarResolution,
} from "@/lib/ghl/calendar-resolver";

/* ─────────────────────────────────────────────────────────────
   Reveal — fade-up on scroll
   ──────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function Reveal({
  as: Tag = "div",
  delay = 0,
  children,
  className = "",
  style = {},
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; delay?: number; children: React.ReactNode }) {
  const [ref, shown] = useReveal();
  const s: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(20px)",
    transition: `opacity .8s cubic-bezier(.25,.1,.25,1), transform .8s cubic-bezier(.25,.1,.25,1)`,
    transitionDelay: `${delay}s`,
    ...style,
  };
  return <Tag ref={ref} className={className} style={s} {...rest}>{children}</Tag>;
}

/* ─────────────────────────────────────────────────────────────
   StepField
   ──────────────────────────────────────────────────────────── */
type StepFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  valid?: boolean;
  multiline?: boolean;
  autoFocus?: boolean;
  inputType?: string;
};

const StepField = React.forwardRef<HTMLInputElement, StepFieldProps>(function StepField(
  { label, placeholder, value, onChange, valid, multiline, autoFocus, inputType = "text" }, ref
) {
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
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={3}
            autoFocus={autoFocus}
          />
        ) : (
          <input
            ref={ref}
            className="sf-field__input"
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
          />
        )}
        {valid && (
          <span className="sf-field__check" aria-label="Valid">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <polyline points="1,5.5 5,9.5 13,1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      <span className="sf-field__rule" />
    </label>
  );
});

/* ─────────────────────────────────────────────────────────────
   Validation helpers
   ──────────────────────────────────────────────────────────── */
function isValidFirstName(value: string) { return value.trim().length >= 2; }
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

function getLeadSegment(intent: ConversionIntent | "") {
  switch (intent) {
    case "private_session":
    case "training":
      return "b2c_premium";
    case "hospitality_partner":
      return "luxury_hospitality";
    case "workshop":
    case "partnership":
      return "b2b";
    case "other":
      return null;
    default:
      return null;
  }
}

export function getGhlCalendarIntent(
  intent: ConversionIntent | "",
  preferredChannel: "ghl" | "callback" | "" = ""
): GhlCalendarIntent | null {
  if (intent === "training" || intent === "workshop") return intent;
  if (intent === "private_session" && preferredChannel === "callback") return "callback";
  if (preferredChannel === "callback") return "callback";
  return null;
}

export function resolveSharedContactCalendar(
  intent: ConversionIntent | "",
  lang: Language,
  preferredChannel: "ghl" | "callback" | "" = ""
): GhlCalendarResolution | null {
  const calendarIntent = getGhlCalendarIntent(intent, preferredChannel);
  return calendarIntent ? resolveGhlCalendarUrl(calendarIntent, lang) : null;
}

export function shouldUseGhlCalendarBeforeLocalSubmission(resolution: GhlCalendarResolution | null) {
  return resolution?.status === "configured";
}

/* ─────────────────────────────────────────────────────────────
   Form state
   ──────────────────────────────────────────────────────────── */
type ContactFormState = {
  intent: ConversionIntent | "";
  firstName: string;
  contact: string;
  context: string;

  // private_session specific
  currentLocation: string;
  needType: string;
  urgency: string;
  preferredChannel: "ghl" | "callback" | "";

  // hospitality_partner specific
  companyName: string;
  jobTitle: string;
  propertyType: string;
  destination: string;
  volumePotential: string;

  // training specific
  profile: string;
  level: string;
  targetLang: string;
  goal: string;

  // workshop specific
  participantCount: string;

  // partnership specific
  collabNature: string;
};

const initialForm: ContactFormState = {
  intent: "",
  firstName: "",
  contact: "",
  context: "",

  currentLocation: "",
  needType: "",
  urgency: "",
  preferredChannel: "",

  companyName: "",
  jobTitle: "",
  propertyType: "",
  destination: "",
  volumePotential: "",

  profile: "",
  level: "",
  targetLang: "",
  goal: "",

  participantCount: "",

  collabNature: "",
};

/* ─────────────────────────────────────────────────────────────
   Traductions locales additionnelles pour l'assistant
   ──────────────────────────────────────────────────────────── */
const EXTRA_TEXTS = {
  FR: {
    back: "Retour",
    next: "Continuer",
    chooseIntent: "Sélectionnez votre demande",
    chooseIntentSub: "Nous vous orientons instantanément vers le bon parcours.",
    intentQuestion: "Quelle est votre demande ?",
    channelQuestion: "Comment souhaitez-vous transmettre votre demande ?",
    privateSubmit: "Transmettre ma demande privée",
    channelCallback: "Demander un rappel prioritaire",
    confirmSubmit: "Transmettre ma demande",
    hospitalityTitle: "Finalisez votre demande partenaire",
    hospitalitySubmit: "Transmettre ma demande partenaire",
    hospitalityCallback: "Demander un rappel",
    finalTitle: "Finalisez votre demande",
    calendarOpen: "Ouvrir le calendrier officiel",
    calendarMissing: "Calendrier GHL non configuré. Vous pouvez transmettre une demande de contact.",
    contactFallback: "Être recontacté",
    submitting: "Transmission en cours...",
    requiredField: "Ce champ est requis.",
    privateConfirmation:
      "Votre demande privée a bien été transmise. Grégory ou son équipe reviendra vers vous personnellement.",
    requestConfirmation:
      "Votre demande a bien été transmise. Grégory ou son équipe l’analysera personnellement et reviendra vers vous.",
    steps: ["Intention", "Identité", "Qualification", "Finalisation", "Confirmé"],
    fields: {
      currentLocation: "Lieu actuel ou destination",
      currentLocationPh: "Ex: Monaco, Chalet Courchevel, Yacht Cannes...",
      needType: "Besoin principal",
      needTypes: ["Inconfort corporel", "Mobilité ressentie", "Récupération", "Fatigue", "Rythme soutenu", "Autre"],
      urgency: "Niveau d'urgence",
      urgencies: ["Aujourd'hui", "Cette semaine", "Plus tard"],
      companyName: "Nom de l'établissement / société",
      companyNamePh: "Votre hôtel, villa ou conciergerie",
      jobTitle: "Votre fonction",
      jobTitlePh: "Ex: GM, Chef de cabine, Villa Manager, Concierge...",
      destination: "Localisation de l'établissement",
      destinationPh: "Ville, Pays ou zone",
      propertyType: "Type d'établissement",
      propertyTypes: ["Hôtel de luxe", "Villa privée", "Yacht", "Conciergerie", "Spa / Resort", "Autre"],
      b2bNeed: "Nature du besoin",
      b2bNeeds: ["Intervention client VIP", "Équipe spa", "Workshop interne", "Partenariat saisonnier", "Autre"],
      volumePotential: "Volume potentiel d'interventions",
      volumePotentials: ["Ponctuel", "Saisonnier", "Récurrent", "À définir"],
      profile: "Votre profil",
      profiles: ["Praticien / Thérapeute", "Wellness manager / Spa", "Reconversion professionnelle", "Autre"],
      level: "Votre niveau actuel",
      levels: ["Débutant", "Intermédiaire", "Professionnel confirmé"],
      targetLang: "Langue souhaitée pour l'apprentissage",
      targetLangPh: "Ex: Français, Anglais...",
      goal: "Votre objectif",
      goals: ["Apprendre pour soi", "Intégrer à ma pratique", "Former mon équipe", "Construire un parcours progressif"],
      workshopTypes: ["Équipe spa", "Hôtel", "Praticiens", "Événement privé", "Autre"],
      participantCount: "Nombre de participants estimé",
      participantCountPh: "Ex: 5, 12, 20...",
      periodPreference: "Période souhaitée",
      periodPreferencePh: "Ex: Juillet 2026, Saison d'été...",
      organization: "Organisation / Société",
      organizationPh: "Ex: Hôtel Royal, Spa Océan, Villa Blue...",
      cityCountry: "Pays / Ville",
      cityCountryPh: "Ex: Saint-Tropez, Suisse...",
      collabNature: "Nature de la collaboration souhaitée",
      collabNaturePh: "Décrivez brièvement votre projet...",
      context: "Détails ou contexte complémentaire",
      contextPh: "Précisez vos attentes, contraintes ou dates clés...",
    },
  },
  EN: {
    back: "Back",
    next: "Continue",
    chooseIntent: "Select your request",
    chooseIntentSub: "We will route you instantly to the appropriate path.",
    intentQuestion: "What is your request?",
    channelQuestion: "How would you like to submit your request?",
    privateSubmit: "Submit my private request",
    channelCallback: "Request a priority callback",
    confirmSubmit: "Submit my request",
    hospitalityTitle: "Finalize your partner request",
    hospitalitySubmit: "Submit my partner request",
    hospitalityCallback: "Request a callback",
    finalTitle: "Finalize your request",
    calendarOpen: "Open official calendar",
    calendarMissing: "GHL calendar is not configured. You can submit a contact request instead.",
    contactFallback: "Request contact",
    submitting: "Submitting...",
    requiredField: "This field is required.",
    privateConfirmation:
      "Your private request has been submitted. Grégory or his team will personally get back to you.",
    requestConfirmation:
      "Your request has been submitted. Grégory or his team will personally review it and get back to you.",
    steps: ["Intent", "Identity", "Qualification", "Finalize", "Confirmed"],
    fields: {
      currentLocation: "Current location or destination",
      currentLocationPh: "E.g., Monaco, Chalet Courchevel, Yacht Cannes...",
      needType: "Primary need",
      needTypes: ["Physical discomfort", "Perceived mobility", "Recovery", "Fatigue", "Demanding schedule", "Other"],
      urgency: "Urgency level",
      urgencies: ["Today", "This week", "Later"],
      companyName: "Establishment / Company Name",
      companyNamePh: "Your hotel, villa, or concierge agency",
      jobTitle: "Your title",
      jobTitlePh: "E.g., GM, Chief Stew, Villa Manager, Concierge...",
      destination: "Location of the establishment",
      destinationPh: "City, Country, or Zone",
      propertyType: "Type of property",
      propertyTypes: ["Luxury Hotel", "Private Villa", "Yacht", "Concierge", "Spa / Resort", "Other"],
      b2bNeed: "Nature of the need",
      b2bNeeds: ["VIP client intervention", "Spa team", "Internal workshop", "Seasonal partnership", "Other"],
      volumePotential: "Potential volume of interventions",
      volumePotentials: ["One-off", "Seasonal", "Recurring", "To be defined"],
      profile: "Your profile",
      profiles: ["Pracititioner / Therapist", "Wellness / Spa Manager", "Career change", "Other"],
      level: "Your current level",
      levels: ["Beginner", "Intermediate", "Confirmed professional"],
      targetLang: "Desired language for learning",
      targetLangPh: "E.g., French, English...",
      goal: "Your goal",
      goals: ["Learn for myself", "Integrate into my practice", "Train my team", "Build a progressive pathway"],
      workshopTypes: ["Spa team", "Hotel", "Practitioners", "Private event", "Other"],
      participantCount: "Estimated number of participants",
      participantCountPh: "E.g., 5, 12, 20...",
      periodPreference: "Preferred period",
      periodPreferencePh: "E.g., July 2026, summer season...",
      organization: "Organization / Company",
      organizationPh: "E.g., Royal Hotel, Ocean Spa, Blue Villa...",
      cityCountry: "Country / City",
      cityCountryPh: "E.g., Saint-Tropez, Switzerland...",
      collabNature: "Nature of the collaboration",
      collabNaturePh: "Briefly describe your project...",
      context: "Additional details or context",
      contextPh: "Specify any expectations, constraints, or key dates...",
    },
  },
  ES: {
    back: "Atrás",
    next: "Continuar",
    chooseIntent: "Seleccione su solicitud",
    chooseIntentSub: "Le orientaremos instantáneamente hacia la ruta correcta.",
    intentQuestion: "¿Cuál es su solicitud?",
    channelQuestion: "¿Cómo desea enviar su solicitud?",
    privateSubmit: "Enviar mi solicitud privada",
    channelCallback: "Solicitar una llamada prioritaria",
    confirmSubmit: "Enviar mi solicitud",
    hospitalityTitle: "Finalice su solicitud de colaboración",
    hospitalitySubmit: "Enviar mi solicitud de colaboración",
    hospitalityCallback: "Solicitar una llamada",
    finalTitle: "Finalice su solicitud",
    calendarOpen: "Abrir calendario oficial",
    calendarMissing: "El calendario GHL no está configurado. Puede enviar una solicitud de contacto.",
    contactFallback: "Solicitar contacto",
    submitting: "Enviando...",
    requiredField: "Este campo es obligatorio.",
    privateConfirmation:
      "Su solicitud privada ha sido enviada. Grégory o su equipo se pondrá en contacto personalmente.",
    requestConfirmation:
      "Su solicitud ha sido enviada. Grégory o su equipo la revisará personalmente y se pondrá en contacto.",
    steps: ["Solicitud", "Identidad", "Calificación", "Finalización", "Confirmado"],
    fields: {
      currentLocation: "Ubicación actual o destino",
      currentLocationPh: "Ej: Mónaco, Chalet Courchevel, Yate Cannes...",
      needType: "Necesidad principal",
      needTypes: ["Incomodidad corporal", "Movilidad percibida", "Recuperación", "Fatiga", "Ritmo exigente", "Otro"],
      urgency: "Nivel de urgencia",
      urgencies: ["Hoy", "Esta semana", "Más tarde"],
      companyName: "Nombre del establecimiento / empresa",
      companyNamePh: "Su hotel, villa o conserjería",
      jobTitle: "Su función",
      jobTitlePh: "Ej: GM, Jefe de cabina, Villa Manager, Conserje...",
      destination: "Ubicación del establecimiento",
      destinationPh: "Ciudad, País o zona",
      propertyType: "Tipo de establecimiento",
      propertyTypes: ["Hotel de lujo", "Villa privada", "Yate", "Conserjería", "Spa / Resort", "Otro"],
      b2bNeed: "Naturaleza de la necesidad",
      b2bNeeds: ["Intervención cliente VIP", "Equipo de spa", "Taller interno", "Alianza estacional", "Otro"],
      volumePotential: "Volumen potencial de intervenciones",
      volumePotentials: ["Puntual", "Estacional", "Recurrente", "Por definir"],
      profile: "Su perfil",
      profiles: ["Práctico / Terapeuta", "Wellness / Spa Manager", "Reconversión profesional", "Otro"],
      level: "Su nivel actual",
      levels: ["Principiante", "Intermedio", "Profesional confirmado"],
      targetLang: "Idioma deseado para el aprendizaje",
      targetLangPh: "Ej: Francés, Inglés...",
      goal: "Su objetivo",
      goals: ["Aprender para mí", "Integrar a mi práctica", "Capacitar a mi equipo", "Construir un recorrido progresivo"],
      workshopTypes: ["Equipo de spa", "Hotel", "Profesionales", "Evento privado", "Otro"],
      participantCount: "Número estimado de participantes",
      participantCountPh: "Ej: 5, 12, 20...",
      periodPreference: "Periodo deseado",
      periodPreferencePh: "Ej: julio de 2026, temporada de verano...",
      organization: "Organización / Empresa",
      organizationPh: "Ej: Hotel Royal, Spa Océano, Villa Blue...",
      cityCountry: "País / Ciudad",
      cityCountryPh: "Ej: Saint-Tropez, Suiza...",
      collabNature: "Naturaleza de la colaboración",
      collabNaturePh: "Describa brevemente su proyecto...",
      context: "Detalles o contexto adicional",
      contextPh: "Especifique sus expectativas, limitaciones o fechas clave...",
    },
  },
};

export default function SharedContactForm({ lang, id = "contact" }: { lang: Language; id?: string }) {
  const t = COPY[lang];
  const tc = t.contact;
  const ext = EXTRA_TEXTS[lang];

  /* 
     Step management:
     1: Intent selection
     2: Identity & Contact (Prénom + Contact)
     3: Intent-specific details (Lieu, besoin, etc.)
     4: Finalization or official GHL calendar handoff
     6: Success confirmation
  */
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);
  const submissionInFlightRef = useRef(false);
  const trackedLeadEventIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (step === 2) setTimeout(() => firstNameRef.current?.focus(), 350);
  }, [step]);

  function updateField(key: "firstName" | "contact", value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setValidated((v) => ({ ...v, [key]: key === "firstName" ? isValidFirstName(value) : isValidContactValue(value) }));
    setSubmitError(null);
  }

  function goNext() {
    setStep((s) => {
      if (s === 1 && !form.intent) return s;
      if (s === 2 && !(isValidFirstName(form.firstName) && isValidContactValue(form.contact))) return s;
      
      // Step 3 conditional validation
      if (s === 3) {
        if (form.intent === "private_session" && (!form.needType || !form.urgency)) return s;
        if (form.intent === "hospitality_partner" && (!form.companyName || !form.propertyType)) return s;
        if (form.intent === "training" && (!form.profile || !form.goal)) return s;
        if (form.intent === "workshop" && (!form.needType || !form.participantCount)) return s;
        if (form.intent === "partnership" && !form.companyName) return s;
      }

      return Math.min(s + 1, 6);
    });
  }

  function goBack() {
    setStep((s) => {
      if (s === 6) return 4;
      return Math.max(s - 1, 1);
    });
  }

  // Helper to serialize custom inputs into Context so we don't lose any detail
  const compiledContext = useMemo(() => {
    const lines: string[] = [];
    if (form.intent === "training") {
      lines.push(`[FORMATION] Profil: ${form.profile}`);
      lines.push(`Niveau: ${form.level}`);
      lines.push(`Langue souhaitée: ${form.targetLang}`);
      lines.push(`Objectif: ${form.goal}`);
    } else if (form.intent === "workshop") {
      lines.push(`[WORKSHOP] Type: ${form.needType}`);
      lines.push(`Période souhaitée: ${form.urgency}`);
    } else if (form.intent === "partnership") {
      lines.push(`[PARTENARIAT] Collaboration: ${form.collabNature}`);
    }
    
    if (form.context.trim()) {
      lines.push(`Message context: ${form.context.trim()}`);
    }
    return lines.join("\n");
  }, [form]);

  // Backward compatibility type mapping
  const mappedType = useMemo(() => {
    if (form.intent === "private_session") return "Client privé";
    if (form.intent === "hospitality_partner") return form.propertyType || "Hôtel / villa / yacht";
    if (form.intent === "training") return "Formation / workshop";
    if (form.intent === "workshop") return "Workshop";
    if (form.intent === "partnership") return "Partenariat";
    return "Autre";
  }, [form.intent, form.propertyType]);

  type LeadApiResult = {
    ok?: boolean;
    error?: string;
    ghlStatus?: "sent" | "failed" | "mocked";
  };

  async function submitLead({
    preferredChannel,
  }: {
    preferredChannel: "ghl" | "callback";
  }) {
    if (submissionInFlightRef.current) {
      throw new Error("SUBMISSION_IN_PROGRESS");
    }

    submissionInFlightRef.current = true;
    const eventId = createMetaEventId();

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utm = Object.fromEntries(
        Array.from(searchParams.entries()).filter(([key]) =>
          key.toLowerCase().startsWith("utm_")
        )
      );
      const branchData = {
        trainingProfile: form.profile || null,
        trainingLevel: form.level || null,
        trainingGoal: form.goal || null,
        targetLang: form.targetLang || null,
        workshopType: form.needType || null,
        participantCount: form.participantCount || null,
        periodPreference: form.urgency || null,
      };

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          contact: form.contact.trim(),
          type: mappedType,
          context: compiledContext || null,
          lang,
          selectedDayLabel: null,
          selectedTime: null,
          selectedDateTime: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          pageUrl: window.location.href,
          eventId,
          utm,
          branchData,
          intent: form.intent,
          preferredChannel,
          routedToUrl: null,
          urgency: form.urgency || null,
          needType: form.needType || null,
          volumePotential: form.volumePotential || null,
          participantCount: form.participantCount || null,
          currentLocation: form.currentLocation || form.destination || null,
          companyName: form.companyName.trim() || null,
          jobTitle: form.jobTitle.trim() || null,
          propertyType: form.propertyType || null,
          destination: form.destination.trim() || null,
        }),
      });

      const result = (await response.json().catch(() => null)) as LeadApiResult | null;
      if (!response.ok || !result?.ok) {
        if (result?.error === "INVALID_CONTACT") {
          throw new Error("INVALID_CONTACT");
        }
        throw new Error("Lead submission failed");
      }

      if (!trackedLeadEventIdsRef.current.has(eventId)) {
        trackedLeadEventIdsRef.current.add(eventId);
        trackMetaLead(
          {
            content_name: "lead_form_submission",
            content_category: "manual_therapy",
            lang,
            intent: form.intent || null,
            preferred_channel: preferredChannel,
            lead_segment: getLeadSegment(form.intent),
            page_path: window.location.pathname,
          },
          { eventID: eventId }
        );
      }

      return {
        ok: true,
        ghlStatus: result.ghlStatus,
      };
    } finally {
      submissionInFlightRef.current = false;
    }
  }

  async function handleFinalSubmit(
    overrideChannel?: "ghl" | "callback"
  ) {
    if (loading || submissionInFlightRef.current) return;

    setLoading(true);
    setSubmitError(null);
    const preferredChannel = overrideChannel || form.preferredChannel || "ghl";
    setForm((current) => ({ ...current, preferredChannel }));

    try {
      await submitLead({
        preferredChannel,
      });

      setStep(6);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message === "INVALID_CONTACT"
          ? tc.step1.contactError
          : tc.submitError
      );
    } finally {
      setLoading(false);
    }
  }

  const canProceed2 = isValidFirstName(form.firstName) && isValidContactValue(form.contact);
  
  const canProceed3 = useMemo(() => {
    if (form.intent === "private_session") return form.needType !== "" && form.urgency !== "";
    if (form.intent === "hospitality_partner") return form.companyName.trim() !== "" && form.propertyType !== "";
    if (form.intent === "training") return form.profile !== "" && form.goal !== "";
    if (form.intent === "workshop") return form.needType !== "" && form.participantCount.trim() !== "";
    if (form.intent === "partnership") return form.companyName.trim() !== "";
    if (form.intent === "other") return true; // Contexte is optional
    return false;
  }, [form]);

  const showContactError = form.contact.trim().length > 0 && !isValidContactValue(form.contact);
  const bookingCalendarResolution = useMemo(
    () => resolveSharedContactCalendar(form.intent, lang),
    [form.intent, lang]
  );
  const callbackCalendarResolution = useMemo(
    () => resolveSharedContactCalendar(form.intent, lang, "callback"),
    [form.intent, lang]
  );
  const hasBookingCalendar = shouldUseGhlCalendarBeforeLocalSubmission(bookingCalendarResolution);
  const hasCallbackCalendar = shouldUseGhlCalendarBeforeLocalSubmission(callbackCalendarResolution);

  useEffect(() => {
    if (step !== 4) return;

    const resolution =
      form.intent === "training" || form.intent === "workshop"
        ? bookingCalendarResolution
        : form.intent === "private_session" || form.intent === "hospitality_partner"
          ? callbackCalendarResolution
          : null;

    if (resolution?.status === "missing") {
      console.warn("Missing public GHL calendar URL", {
        envVar: resolution.envVar,
        intent: resolution.intent,
        lang: resolution.lang,
      });
    }
  }, [bookingCalendarResolution, callbackCalendarResolution, form.intent, lang, step]);

  const arrow = (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
      <line x1="0" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="0.7" />
      <polyline points="8,1 12,5 8,9" fill="none" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );

  function resetAll() {
    trackedLeadEventIdsRef.current.clear();
    setStep(1);
    setForm(initialForm);
    setValidated({});
    setSubmitError(null);
  }

  // Step Indicators mapping based on step
  const activeIndicatorIndex = useMemo(() => {
    if (step <= 3) return step - 1; // 0, 1, 2
    if (step === 4) return 3; // Finalisation
    return 4; // Confirmed
  }, [step]);

  return (
    <section className="contact" id={id}>
      <div
        className={`container container--form ${
          step === 4 && (form.intent === "training" || form.intent === "workshop")
            ? "container--booking"
            : ""
        }`}
      >
        {/* Header */}
        <div className="contact-head">
          <Reveal><span className="eyebrow eyebrow--gold">{tc.label}</span></Reveal>
          <Reveal delay={0.1}>
            <h2 className="contact-headline">
              {step === 1 ? ext.chooseIntent : tc.headline}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="contact-sub">
              {step === 1 ? ext.chooseIntentSub : tc.sub}
            </p>
          </Reveal>
        </div>

        {/* Progress bar */}
        <Reveal delay={0.3}>
          <div className="sf-progress">
            <div className="sf-progress__fill" style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }} />
          </div>
        </Reveal>

        {/* Step indicators */}
        <Reveal delay={0.35}>
          <div className="sf-indicators">
            {ext.steps.slice(0, 5).map((label: string, i: number) => (
              <button
                key={i}
                className={`sf-ind ${activeIndicatorIndex === i ? "is-active" : ""} ${activeIndicatorIndex > i ? "is-done" : ""}`}
                onClick={() => { if (step > i + 1 && i < 3) setStep(i + 1); }}
                disabled={step <= i + 1 || i >= 3}
                type="button"
              >
                <span className="sf-ind__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="sf-ind__sep">—</span>
                <span className="sf-ind__text">{label}</span>
              </button>
            ))}
            <div className="sf-ind__track">
              <div className="sf-ind__fill" style={{ width: `${(activeIndicatorIndex / 4) * 100}%` }} />
            </div>
          </div>
        </Reveal>

        {/* Step content */}
        <div className="sf-content">
          <div className="sf-slider">

            {/* STEP 1: Intent Selection */}
            {step === 1 && (
              <div className="sf-slide is-active">
                <p className="sf-step__title">{ext.intentQuestion}</p>
                <div className="sf-types" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {(Object.keys(INTENT_LABELS) as ConversionIntent[]).map((intentKey) => (
                    <button
                      key={intentKey}
                      className={`sf-type ${form.intent === intentKey ? "is-selected" : ""}`}
                      onClick={() => {
                        setForm((f) => ({ ...f, intent: intentKey }));
                        setSubmitError(null);
                        setTimeout(() => setStep(2), 250);
                      }}
                      aria-pressed={form.intent === intentKey}
                      type="button"
                      style={{ padding: "20px", fontSize: "0.95rem", textAlign: "left" }}
                    >
                      {INTENT_LABELS[intentKey][lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Identity & Contact */}
            {step === 2 && (
              <div className="sf-slide is-active">
                <p className="sf-step__title">{tc.step1.title}</p>
                <div className="sf-fields">
                  <StepField
                    ref={firstNameRef}
                    label={tc.step1.firstName}
                    placeholder={tc.step1.firstNamePh}
                    value={form.firstName}
                    onChange={(v) => updateField("firstName", v)}
                    valid={validated.firstName}
                  />
                  <StepField
                    label={tc.step1.contact}
                    placeholder={tc.step1.contactPh}
                    value={form.contact}
                    onChange={(v) => updateField("contact", v)}
                    valid={validated.contact}
                  />
                </div>
                {showContactError && <p className="sf-help" role="status">{tc.step1.contactError}</p>}
                <div className="sf-nav sf-nav--between">
                  <button className="sf-btn sf-btn--back" onClick={goBack} type="button">←</button>
                  <button className="sf-btn" onClick={goNext} disabled={!canProceed2} type="button">
                    <span>{ext.next}</span>{arrow}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Qualification specific details */}
            {step === 3 && (
              <div className="sf-slide is-active">
                <p className="sf-step__title">{tc.step2.title}</p>
                
                {/* Branch A: Private Session */}
                {form.intent === "private_session" && (
                  <div className="sf-fields">
                    <label className="sf-field__label" style={{ marginBottom: "12px", display: "block" }}>{ext.fields.needType}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.needTypes.map((need) => (
                        <button
                          key={need}
                          className={`sf-type ${form.needType === need ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, needType: need }))}
                          type="button"
                        >{need}</button>
                      ))}
                    </div>

                    <StepField
                      label={ext.fields.currentLocation}
                      placeholder={ext.fields.currentLocationPh}
                      value={form.currentLocation}
                      onChange={(v) => setForm((f) => ({ ...f, currentLocation: v }))}
                    />

                    <label className="sf-field__label" style={{ marginTop: "20px", marginBottom: "12px", display: "block" }}>{ext.fields.urgency}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.urgencies.map((u: string) => (
                        <button
                          key={u}
                          className={`sf-type ${form.urgency === u ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, urgency: u }))}
                          type="button"
                        >{u}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branch B: Hospitality Partner */}
                {form.intent === "hospitality_partner" && (
                  <div className="sf-fields">
                    <StepField
                      label={ext.fields.companyName}
                      placeholder={ext.fields.companyNamePh}
                      value={form.companyName}
                      onChange={(v) => setForm((f) => ({ ...f, companyName: v }))}
                    />
                    <StepField
                      label={ext.fields.jobTitle}
                      placeholder={ext.fields.jobTitlePh}
                      value={form.jobTitle}
                      onChange={(v) => setForm((f) => ({ ...f, jobTitle: v }))}
                    />

                    <label className="sf-field__label" style={{ marginTop: "12px", marginBottom: "12px", display: "block" }}>{ext.fields.propertyType}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.propertyTypes.map((type) => (
                        <button
                          key={type}
                          className={`sf-type ${form.propertyType === type ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, propertyType: type }))}
                          type="button"
                        >{type}</button>
                      ))}
                    </div>

                    <StepField
                      label={ext.fields.destination}
                      placeholder={ext.fields.destinationPh}
                      value={form.destination}
                      onChange={(v) => setForm((f) => ({ ...f, destination: v }))}
                    />

                    <label className="sf-field__label" style={{ marginTop: "12px", marginBottom: "12px", display: "block" }}>{ext.fields.b2bNeed}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.b2bNeeds.map((need) => (
                        <button
                          key={need}
                          className={`sf-type ${form.needType === need ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, needType: need }))}
                          type="button"
                        >{need}</button>
                      ))}
                    </div>

                    <label className="sf-field__label" style={{ marginTop: "12px", marginBottom: "12px", display: "block" }}>{ext.fields.volumePotential}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.volumePotentials.map((vol) => (
                        <button
                          key={vol}
                          className={`sf-type ${form.volumePotential === vol ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, volumePotential: vol }))}
                          type="button"
                        >{vol}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branch C: Training */}
                {form.intent === "training" && (
                  <div className="sf-fields">
                    <label className="sf-field__label" style={{ marginBottom: "12px", display: "block" }}>{ext.fields.profile}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.profiles.map((p: string) => (
                        <button
                          key={p}
                          className={`sf-type ${form.profile === p ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, profile: p }))}
                          type="button"
                        >{p}</button>
                      ))}
                    </div>

                    <label className="sf-field__label" style={{ marginBottom: "12px", display: "block" }}>{ext.fields.level}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.levels.map((lvl: string) => (
                        <button
                          key={lvl}
                          className={`sf-type ${form.level === lvl ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, level: lvl }))}
                          type="button"
                        >{lvl}</button>
                      ))}
                    </div>

                    <StepField
                      label={ext.fields.destination}
                      placeholder={ext.fields.destinationPh}
                      value={form.destination}
                      onChange={(v) => setForm((f) => ({ ...f, destination: v }))}
                    />
                    <StepField
                      label={ext.fields.targetLang}
                      placeholder={ext.fields.targetLangPh}
                      value={form.targetLang}
                      onChange={(v) => setForm((f) => ({ ...f, targetLang: v }))}
                    />

                    <label className="sf-field__label" style={{ marginTop: "12px", marginBottom: "12px", display: "block" }}>{ext.fields.goal}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.goals.map((g: string) => (
                        <button
                          key={g}
                          className={`sf-type ${form.goal === g ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, goal: g }))}
                          type="button"
                        >{g}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branch D: Workshop */}
                {form.intent === "workshop" && (
                  <div className="sf-fields">
                    <label className="sf-field__label" style={{ marginBottom: "12px", display: "block" }}>{ext.fields.propertyType}</label>
                    <div className="sf-types" style={{ marginBottom: "24px" }}>
                      {ext.fields.workshopTypes.map((w) => (
                        <button
                          key={w}
                          className={`sf-type ${form.needType === w ? "is-selected" : ""}`}
                          onClick={() => setForm((f) => ({ ...f, needType: w }))}
                          type="button"
                        >{w}</button>
                      ))}
                    </div>

                    <StepField
                      label={ext.fields.currentLocation}
                      placeholder={ext.fields.currentLocationPh}
                      value={form.currentLocation}
                      onChange={(v) => setForm((f) => ({ ...f, currentLocation: v }))}
                    />
                    <StepField
                      label={ext.fields.participantCount}
                      placeholder={ext.fields.participantCountPh}
                      value={form.participantCount}
                      onChange={(v) => setForm((f) => ({ ...f, participantCount: v }))}
                    />
                    <StepField
                      label={ext.fields.periodPreference}
                      placeholder={ext.fields.periodPreferencePh}
                      value={form.urgency}
                      onChange={(v) => setForm((f) => ({ ...f, urgency: v }))}
                    />
                  </div>
                )}

                {/* Branch E: Partnership */}
                {form.intent === "partnership" && (
                  <div className="sf-fields">
                    <StepField
                      label={ext.fields.organization}
                      placeholder={ext.fields.organizationPh}
                      value={form.companyName}
                      onChange={(v) => setForm((f) => ({ ...f, companyName: v }))}
                    />
                    <StepField
                      label={ext.fields.cityCountry}
                      placeholder={ext.fields.cityCountryPh}
                      value={form.destination}
                      onChange={(v) => setForm((f) => ({ ...f, destination: v }))}
                    />
                    <StepField
                      label={ext.fields.collabNature}
                      placeholder={ext.fields.collabNaturePh}
                      value={form.collabNature}
                      onChange={(v) => setForm((f) => ({ ...f, collabNature: v }))}
                    />
                  </div>
                )}

                {/* Common context area */}
                <div className="sf-fields" style={{ marginTop: "24px" }}>
                  <StepField
                    label={ext.fields.context}
                    placeholder={ext.fields.contextPh}
                    value={form.context}
                    onChange={(v) => setForm((f) => ({ ...f, context: v }))}
                    multiline
                  />
                </div>

                <div className="sf-nav sf-nav--between">
                  <button className="sf-btn sf-btn--back" onClick={goBack} type="button">←</button>
                  <button className="sf-btn" onClick={goNext} disabled={!canProceed3} type="button">
                    <span>{ext.next}</span>{arrow}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: GHL finalization or embedded booking */}
            {step === 4 && (
              <div className="sf-slide is-active">
                
                {/* Branch A: Private Session */}
                {form.intent === "private_session" && (
                  <div>
                    <p className="sf-step__title">{ext.channelQuestion}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "30px 0" }}>
                      <button
                        className="sf-btn sf-btn--cta"
                        onClick={() => handleFinalSubmit("ghl")}
                        disabled={loading}
                        type="button"
                        style={{ justifyContent: "center", padding: "18px" }}
                      >
                        {loading ? <span className="sf-spinner" /> : <span>{ext.privateSubmit}</span>}
                      </button>
                      
                      <button
                        className="sf-btn sf-btn--ghost"
                        onClick={() => handleFinalSubmit("callback")}
                        disabled={loading}
                        type="button"
                        style={{ padding: "18px", border: "1px solid var(--forest)" }}
                      >
                        {loading ? <span className="sf-spinner" /> : <span>{ext.contactFallback}</span>}
                      </button>
                      {hasCallbackCalendar && callbackCalendarResolution?.status === "configured" ? (
                        <a
                          className="sf-btn sf-btn--calendar"
                          href={callbackCalendarResolution.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ justifyContent: "center", padding: "18px" }}
                        >
                          {ext.channelCallback}
                        </a>
                      ) : (
                        <p className="sf-help">{ext.calendarMissing}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Branch B: Hospitality Partner final choices */}
                {form.intent === "hospitality_partner" && (
                  <div>
                    <p className="sf-step__title">{ext.hospitalityTitle}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "30px 0" }}>
                      <button
                        className="sf-btn sf-btn--cta"
                        onClick={() => handleFinalSubmit("ghl")}
                        disabled={loading}
                        type="button"
                        style={{ justifyContent: "center", padding: "18px" }}
                      >
                        {loading ? <span className="sf-spinner" /> : <span>{ext.hospitalitySubmit}</span>}
                      </button>
                      <button
                        className="sf-btn sf-btn--ghost"
                        onClick={() => handleFinalSubmit("callback")}
                        disabled={loading}
                        type="button"
                        style={{ padding: "18px", border: "1px solid var(--forest)" }}
                      >
                        {loading ? <span className="sf-spinner" /> : <span>{ext.contactFallback}</span>}
                      </button>
                      {hasCallbackCalendar && callbackCalendarResolution?.status === "configured" ? (
                        <a
                          className="sf-btn sf-btn--calendar"
                          href={callbackCalendarResolution.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ justifyContent: "center", padding: "18px" }}
                        >
                          {ext.hospitalityCallback}
                        </a>
                      ) : (
                        <p className="sf-help">{ext.calendarMissing}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Branch C & D: Official GHL training/workshop calendar */}
                {(form.intent === "training" || form.intent === "workshop") && (
                  <div>
                    <p className="sf-step__title">{ext.finalTitle}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "30px 0" }}>
                      {hasBookingCalendar && bookingCalendarResolution?.status === "configured" ? (
                        <a
                          className="sf-btn sf-btn--cta"
                          href={bookingCalendarResolution.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ justifyContent: "center", padding: "18px" }}
                        >
                          <span>{ext.calendarOpen}</span>
                        </a>
                      ) : (
                        <>
                          <p className="sf-help">{ext.calendarMissing}</p>
                          <button
                            className="sf-btn sf-btn--cta"
                            onClick={() => handleFinalSubmit("ghl")}
                            disabled={loading}
                            type="button"
                            style={{ justifyContent: "center", padding: "18px" }}
                          >
                            {loading ? <span className="sf-spinner" /> : <span>{ext.contactFallback}</span>}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="sf-nav">
                      <button className="sf-btn sf-btn--back" onClick={goBack} type="button">←</button>
                    </div>
                  </div>
                )}

                {/* Branch E & F: Partnership & Other Submit flow */}
                {(form.intent === "partnership" || form.intent === "other") && (
                  <div>
                    <p className="sf-step__title">{ext.finalTitle}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "30px 0" }}>
                      <button
                        className="sf-btn sf-btn--cta"
                        onClick={() => handleFinalSubmit("ghl")}
                        disabled={loading}
                        type="button"
                        style={{ justifyContent: "center", padding: "18px" }}
                      >
                        {loading ? <span className="sf-spinner" /> : <span>{ext.confirmSubmit}</span>}
                      </button>
                    </div>
                  </div>
                )}

                {form.intent !== "training" && form.intent !== "workshop" && (
                  <div className="sf-nav">
                    <button className="sf-btn sf-btn--back" onClick={goBack} type="button">←</button>
                  </div>
                )}
                {submitError && <p className="sf-error" role="alert" aria-live="polite">{submitError}</p>}
              </div>
            )}

            {/* STEP 6: Confirmation */}
            {step === 6 && (
              <div className="sf-slide is-active">
                <div className="sf-confirm">
                  <div className="sf-confirm__photo">
                    <Image
                      src="/portrait.webp"
                      alt={t.imageAlts.portrait}
                      width={72}
                      height={72}
                      style={{ objectFit: "cover", objectPosition: "center 20%" }}
                    />
                  </div>
                  
                  <h3 className="sf-confirm__headline">{tc.step4.headline}</h3>
                  <p className="sf-confirm__call" style={{ margin: "20px 0" }}>
                    {form.intent === "private_session"
                      ? ext.privateConfirmation
                      : ext.requestConfirmation}
                  </p>
                  
                  <button className="sf-btn sf-btn--ghost" onClick={resetAll} type="button" style={{ marginTop: "24px" }}>
                    {tc.step4.newRequest}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
