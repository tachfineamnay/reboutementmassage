import type { Language } from "@/data/copy";

export type CampaignNeedCategory =
  | "back"
  | "neck"
  | "stress"
  | "fatigue"
  | "travel"
  | "mobility"
  | "other";

export type WhatsappIntent =
  | "default"
  | "book_intent"
  | "more_info_intent"
  | "testimonial_cta"
  | "sticky_cta";

export type CampaignLeadOption = {
  value: CampaignNeedCategory;
  label: string;
};

export type CampaignLandingConfig = {
  id: string;
  route: string;
  language: Language;
  htmlLang: "fr" | "en" | "es";
  cityName: string;
  destination: string;
  offer: string;
  leadType: string;
  leadSegment: string;
  meta: {
    title: string;
    description: string;
  };
  tracking: {
    viewContentName: string;
    contentCategory: "manual_therapy";
  };
  branchData: Record<string, string>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    microNote: string;
    ctaPrimary: string;
    ctaSecondary: string;
    proofLine: string;
    imageAlt: string;
  };
  forYouIf: {
    title: string;
    items: string[];
  };
  difference: {
    title: string;
    body: string;
    points: string[];
    imageAlt: string;
  };
  offerBlock: {
    title: string;
    bullets: string[];
    launchRateLine?: string;
    showPrice: boolean;
    priceLabel?: string;
    priceValue?: string;
  };
  proof: {
    badges: Array<{ value: string; label: string }>;
  };
  testimonial: {
    posterSrc: string;
    videoSrc?: string;
    cta: string;
  };
  process: {
    title: string;
    steps: string[];
  };
  shortForm: {
    label: string;
    headline: string;
    sub: string;
    tensionLabel: string;
    tensionPlaceholder: string;
    whatsappLabel: string;
    whatsappPlaceholder: string;
    languageLabel: string;
    languageOptions: Array<{ value: "FR" | "EN" | "ES"; label: string }>;
    needOptions: CampaignLeadOption[];
    submit: string;
    submitting: string;
    contactError: string;
    requiredError: string;
    submitError: string;
    successTitle: string;
    successBody: string;
    successNote: string;
    newRequest: string;
    whatsappAfterLabel: string;
  };
  stickyCta: {
    whatsapp: string;
    booking: string;
  };
  whatsapp: {
    messages: Record<WhatsappIntent, string>;
  };
  sections: {
    processEyebrow: string;
    faqEyebrow: string;
    faqTitle: string;
  };
  faq: Array<{ question: string; answer: string }>;
  landingPageId?: string;
  destinationId?: string;
  offerId?: string | null;
  destinationSlug: string;
  country: string;
  currency: string;
  durationMinutes: number;
  offerType: string;
  bookingUrl: string | null;
  paymentUrl: string | null;
  whatsappUrls: {
    default: string;
    book_intent: string;
    more_info_intent: string;
    testimonial_cta: string;
    sticky_cta: string;
  };
};

const DEFAULT_WHATSAPP_NUMBER = "33665517735";

export function getCdmxWhatsappNumber() {
  return process.env.NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER?.replace(/\D/g, "") || DEFAULT_WHATSAPP_NUMBER;
}

const CDMX_WHATSAPP_MESSAGES: Record<"fr" | "en" | "es", Record<WhatsappIntent, string>> = {
  es: {
    default:
      "Hola Grégory, estoy en CDMX y quiero consultar disponibilidad para una sesión de 75 min de Reset Corporal Francés.",
    book_intent:
      "Hola Grégory, estoy en CDMX y quiero reservar una sesión de 75 min de Reset Corporal Francés.",
    more_info_intent:
      "Hola Grégory, estoy en CDMX y me gustaría más información sobre el Reset Corporal Francés.",
    testimonial_cta:
      "Hola Grégory, vi el testimonio y me gustaría saber si una sesión de Reset Corporal Francés es adecuada para mí en CDMX.",
    sticky_cta:
      "Hola Grégory, estoy en CDMX y quiero consultar disponibilidad para una sesión de 75 min.",
  },
  en: {
    default:
      "Hi Grégory, I'm in Mexico City and I'd like to check availability for a 75-min French Body Reset session.",
    book_intent:
      "Hi Grégory, I'm in Mexico City and I'd like to book a 75-min French Body Reset session.",
    more_info_intent:
      "Hi Grégory, I'm in Mexico City and I'd like more information about the French Body Reset.",
    testimonial_cta:
      "Hi Grégory, I watched the testimonial and would like to know if a French Body Reset session is right for me in Mexico City.",
    sticky_cta:
      "Hi Grégory, I'm in Mexico City and I'd like to check availability for a 75-min session.",
  },
  fr: {
    default:
      "Bonjour Grégory, je suis à Mexico City et je souhaite vérifier une disponibilité pour une séance de 75 min de French Body Reset.",
    book_intent:
      "Bonjour Grégory, je suis à Mexico City et je souhaite réserver une séance de 75 min de French Body Reset.",
    more_info_intent:
      "Bonjour Grégory, je suis à Mexico City et j'aimerais plus d'informations sur le French Body Reset.",
    testimonial_cta:
      "Bonjour Grégory, j'ai vu le témoignage et j'aimerais savoir si une séance de French Body Reset est adaptée pour moi à Mexico City.",
    sticky_cta:
      "Bonjour Grégory, je suis à Mexico City et je souhaite vérifier une disponibilité pour une séance de 75 min.",
  },
};

function buildCdmxWhatsappUrl(locale: "fr" | "en" | "es", intent: WhatsappIntent) {
  const text = CDMX_WHATSAPP_MESSAGES[locale][intent];
  return `https://wa.me/${getCdmxWhatsappNumber()}?text=${encodeURIComponent(text)}`;
}

export function getCdmxWhatsappUrl(locale: "fr" | "en" | "es", intent: WhatsappIntent = "default") {
  return buildCdmxWhatsappUrl(locale, intent);
}

const campaignCore = {
  id: "cdmx_private_session",
  cityName: "Ciudad de México",
  destination: "Ciudad de México",
  offer: "private_session",
  leadType: "Client privé CDMX",
  leadSegment: "b2c_premium",
  tracking: {
    viewContentName: "cdmx_private_session",
    contentCategory: "manual_therapy" as const,
  },
  branchData: {
    campaignCity: "cdmx",
    offer: "private_session",
    landing: "cdmx_private_session",
  },
  landingPageId: "cdmx_private_session",
  destinationId: "cdmx",
  offerId: "private_session",
  destinationSlug: "cdmx",
  country: "Mexico",
  currency: "MXN",
  durationMinutes: 75,
  offerType: "private_session",
  bookingUrl: null,
  paymentUrl: null,
};

const sharedNeedOptions: Record<"fr" | "en" | "es", CampaignLeadOption[]> = {
  en: [
    { value: "neck", label: "Stiff neck" },
    { value: "back", label: "Back tension" },
    { value: "fatigue", label: "Heavy body" },
    { value: "stress", label: "Stress accumulated" },
    { value: "travel", label: "After travel" },
    { value: "mobility", label: "Too much laptop" },
    { value: "other", label: "Sport or intense rhythm" },
  ],
  es: [
    { value: "neck", label: "Cuello rígido" },
    { value: "back", label: "Espalda cargada" },
    { value: "fatigue", label: "Cuerpo pesado" },
    { value: "stress", label: "Estrés acumulado" },
    { value: "travel", label: "Después de viaje" },
    { value: "mobility", label: "Demasiada computadora" },
    { value: "other", label: "Deporte o ritmo intenso" },
  ],
  fr: [
    { value: "neck", label: "Nuque raide" },
    { value: "back", label: "Dos chargé" },
    { value: "fatigue", label: "Corps lourd" },
    { value: "stress", label: "Stress accumulé" },
    { value: "travel", label: "Après voyage" },
    { value: "mobility", label: "Trop d'ordinateur" },
    { value: "other", label: "Sport ou rythme intense" },
  ],
};

export const CDMX_PRIVATE_SESSION_CAMPAIGNS: Record<"fr" | "en" | "es", CampaignLandingConfig> = {
  es: {
    ...campaignCore,
    route: "/es/sesion-privada-cdmx",
    language: "ES",
    htmlLang: "es",
    whatsappUrls: {
      default: getCdmxWhatsappUrl("es", "default"),
      book_intent: getCdmxWhatsappUrl("es", "book_intent"),
      more_info_intent: getCdmxWhatsappUrl("es", "more_info_intent"),
      testimonial_cta: getCdmxWhatsappUrl("es", "testimonial_cta"),
      sticky_cta: getCdmxWhatsappUrl("es", "sticky_cta"),
    },
    meta: {
      title: "Reset Corporal Francés en CDMX | No es un masaje clásico | Grégory Tordjman",
      description:
        "No es un masaje clásico. Sesión privada de 75 minutos de Reset Corporal Francés en Ciudad de México con Grégory Tordjman. Disponibilidad limitada esta semana.",
    },
    hero: {
      eyebrow: "Sesión privada · CDMX",
      title: "¿Cuello rígido, espalda cargada o cuerpo pesado en CDMX?",
      subtitle:
        "No es un masaje clásico. Es una sesión de 75 minutos de Reset Corporal Francés con Grégory Tordjman para ayudar al cuerpo a soltar tensión profunda, recuperar movilidad y bajar el estrés acumulado.",
      microNote: "Sesiones privadas en CDMX con cita previa. Disponibilidad limitada esta semana.",
      ctaPrimary: "Consultar disponibilidad por WhatsApp",
      ctaSecondary: "Reservar una sesión de 75 min",
      proofLine: "Desde 2014 · 9,000+ cuerpos acompañados · 230+ terapeutas formados",
      imageAlt: "Grégory Tordjman — Reset Corporal Francés en CDMX",
    },
    forYouIf: {
      title: "Para ti si tu cuerpo se siente cargado.",
      items: sharedNeedOptions.es.map((o) => o.label),
    },
    difference: {
      title: "Esto no es un masaje de spa.",
      body: "Un masaje de spa suele buscar relajación general. El Reset Corporal Francés empieza con una lectura del cuerpo: postura, respiración, zonas de tensión y movilidad. Después, el trabajo manual se adapta a lo que tu cuerpo presenta ese día.",
      points: [
        "Lectura del cuerpo primero",
        "Trabajo manual profundo pero calibrado",
        "Enfoque en tensión, movilidad y relajación del sistema nervioso",
        "Respuesta personal de Grégory",
        "La orientación médica sigue siendo prioritaria cuando hace falta",
      ],
      imageAlt: "Gesto manual de la Método TMS®",
    },
    offerBlock: {
      title: "Sesión de lanzamiento CDMX",
      bullets: [
        "Sesión privada de 75 minutos",
        "Solo con cita previa",
        "Respuesta personal por WhatsApp",
        "Disponibilidad limitada esta semana",
      ],
      launchRateLine: "Tarifa de lanzamiento disponible esta semana por WhatsApp.",
      showPrice: false,
    },
    proof: {
      badges: [
        { value: "Desde 2014", label: "Método TMS®" },
        { value: "9,000+", label: "cuerpos acompañados" },
        { value: "230+", label: "terapeutas formados" },
        { value: "MX & US", label: "testimonios verificados" },
        { value: "Grégory Tordjman", label: "método creado por" },
      ],
    },
    testimonial: {
      posterSrc: "/practice-01.webp",
      cta: "Preguntar a Grégory si una sesión es adecuada para ti",
    },
    process: {
      title: "Cómo funciona",
      steps: [
        "Envía un WhatsApp",
        "Dime dónde sientes tensión",
        "Grégory revisa la disponibilidad",
        "Reserva tu sesión de 75 min",
        "Recibe tu Reset Corporal Francés",
      ],
    },
    shortForm: {
      label: "Solicitud rápida",
      headline: "Prefieres escribir antes de WhatsApp",
      sub: "Formulario corto — Grégory o el equipo responde según disponibilidad.",
      tensionLabel: "Tensión principal",
      tensionPlaceholder: "Selecciona una opción",
      whatsappLabel: "WhatsApp",
      whatsappPlaceholder: "+52...",
      languageLabel: "Idioma preferido",
      languageOptions: [
        { value: "ES", label: "Español" },
        { value: "EN", label: "English" },
        { value: "FR", label: "Français" },
      ],
      needOptions: sharedNeedOptions.es,
      submit: "Enviar solicitud",
      submitting: "Enviando...",
      contactError: "Indica un WhatsApp válido.",
      requiredError: "Este campo es necesario.",
      submitError: "No se pudo enviar. Revisa el contacto e inténtalo de nuevo.",
      successTitle: "Solicitud recibida.",
      successBody: "Grégory revisará personalmente y responderá según disponibilidad.",
      successNote: "Tu solicitud queda registrada de forma confidencial.",
      newRequest: "Enviar otra solicitud",
      whatsappAfterLabel: "Añadir contexto por WhatsApp",
    },
    stickyCta: {
      whatsapp: "WhatsApp Grégory",
      booking: "Reservar 75 min",
    },
    whatsapp: {
      messages: {
        default:
          "Hola Grégory, estoy en CDMX y quiero consultar disponibilidad para una sesión de 75 min de Reset Corporal Francés.",
        book_intent:
          "Hola Grégory, estoy en CDMX y quiero reservar una sesión de 75 min de Reset Corporal Francés.",
        more_info_intent:
          "Hola Grégory, estoy en CDMX y me gustaría más información sobre el Reset Corporal Francés.",
        testimonial_cta:
          "Hola Grégory, vi el testimonio y me gustaría saber si una sesión de Reset Corporal Francés es adecuada para mí en CDMX.",
        sticky_cta:
          "Hola Grégory, estoy en CDMX y quiero consultar disponibilidad para una sesión de 75 min.",
      },
    },
    sections: {
      processEyebrow: "Proceso",
      faqEyebrow: "FAQ",
      faqTitle: "Preguntas frecuentes",
    },
    faq: [
      {
        question: "¿Reemplaza una consulta médica?",
        answer:
          "No. La Método TMS® es un acompañamiento manual de bienestar y confort corporal. No reemplaza un diagnóstico ni un tratamiento médico.",
      },
      {
        question: "¿Duele?",
        answer:
          "El trabajo puede ser profundo, pero está calibrado. Grégory trabaja con el cuerpo, nunca contra él.",
      },
      {
        question: "¿Dónde se realiza la sesión?",
        answer:
          "Según disponibilidad y condiciones del lugar, en un espacio privado adaptado en Ciudad de México.",
      },
      {
        question: "¿Cuánto dura la sesión?",
        answer: "La sesión privada CDMX dura 75 minutos.",
      },
      {
        question: "¿Cómo reservo?",
        answer:
          "Envía un WhatsApp. Grégory o el workflow CRM calificará tu solicitud y te propondrá la próxima disponibilidad.",
      },
    ],
  },

  en: {
    ...campaignCore,
    route: "/en/mexico-city-private-session",
    language: "EN",
    htmlLang: "en",
    whatsappUrls: {
      default: getCdmxWhatsappUrl("en", "default"),
      book_intent: getCdmxWhatsappUrl("en", "book_intent"),
      more_info_intent: getCdmxWhatsappUrl("en", "more_info_intent"),
      testimonial_cta: getCdmxWhatsappUrl("en", "testimonial_cta"),
      sticky_cta: getCdmxWhatsappUrl("en", "sticky_cta"),
    },
    meta: {
      title: "French Body Reset in Mexico City | Not a regular massage | Grégory Tordjman",
      description:
        "Not a regular massage. A 75-minute private French Body Reset session in Mexico City with Grégory Tordjman. Limited availability this week. Personal WhatsApp response.",
    },
    hero: {
      eyebrow: "Private session · CDMX",
      title: "Stiff neck, heavy body or back tension in Mexico City?",
      subtitle:
        "Not a regular massage. A 75-minute French Body Reset session with Grégory Tordjman to help your body release deep tension, recover mobility and calm accumulated stress.",
      microNote: "Private sessions in CDMX by appointment. Limited availability this week.",
      ctaPrimary: "Check availability on WhatsApp",
      ctaSecondary: "Book a 75-min session",
      proofLine: "Since 2014 · 9,000+ bodies supported · 230+ therapists trained",
      imageAlt: "Grégory Tordjman — French Body Reset in Mexico City",
    },
    forYouIf: {
      title: "For you if your body feels overloaded.",
      items: sharedNeedOptions.en.map((o) => o.label),
    },
    difference: {
      title: "This is not a spa massage.",
      body: "A spa massage usually focuses on relaxation. French Body Reset starts with a body reading: posture, breathing, tension areas and mobility. Then the manual work is adapted to what your body presents that day.",
      points: [
        "Body reading first",
        "Deep but calibrated manual work",
        "Focus on tension, mobility and nervous system release",
        "Personal response by Grégory",
        "Medical advice remains priority when needed",
      ],
      imageAlt: "Méthode TMS® manual gesture",
    },
    offerBlock: {
      title: "CDMX Founder Session",
      bullets: [
        "75-minute private session",
        "By appointment only",
        "Personal WhatsApp response",
        "Limited availability this week",
      ],
      launchRateLine: "Launch rate available this week by WhatsApp.",
      showPrice: false,
    },
    proof: {
      badges: [
        { value: "Since 2014", label: "Méthode TMS®" },
        { value: "9,000+", label: "bodies supported" },
        { value: "230+", label: "therapists trained" },
        { value: "MX & US", label: "verified testimonials" },
        { value: "Grégory Tordjman", label: "method created by" },
      ],
    },
    testimonial: {
      posterSrc: "/practice-01.webp",
      cta: "Ask Grégory if a session is right for you",
    },
    process: {
      title: "How it works",
      steps: [
        "Send a WhatsApp",
        "Tell where you feel tension",
        "Grégory checks availability",
        "Book your 75-min session",
        "Receive your French Body Reset",
      ],
    },
    shortForm: {
      label: "Quick request",
      headline: "Prefer to write before WhatsApp",
      sub: "Short form — Grégory or the team responds based on availability.",
      tensionLabel: "Main tension",
      tensionPlaceholder: "Select an option",
      whatsappLabel: "WhatsApp",
      whatsappPlaceholder: "+52...",
      languageLabel: "Preferred language",
      languageOptions: [
        { value: "EN", label: "English" },
        { value: "ES", label: "Español" },
        { value: "FR", label: "Français" },
      ],
      needOptions: sharedNeedOptions.en,
      submit: "Send request",
      submitting: "Sending...",
      contactError: "Please enter a valid WhatsApp number.",
      requiredError: "This field is required.",
      submitError: "Could not send. Check your contact and try again.",
      successTitle: "Request received.",
      successBody: "Grégory will personally review and respond based on availability.",
      successNote: "Your request is recorded confidentially.",
      newRequest: "Send another request",
      whatsappAfterLabel: "Add context on WhatsApp",
    },
    stickyCta: {
      whatsapp: "WhatsApp Grégory",
      booking: "Book 75 min",
    },
    whatsapp: {
      messages: {
        default:
          "Hi Grégory, I'm in Mexico City and I'd like to check availability for a 75-min French Body Reset session.",
        book_intent:
          "Hi Grégory, I'm in Mexico City and I'd like to book a 75-min French Body Reset session.",
        more_info_intent:
          "Hi Grégory, I'm in Mexico City and I'd like more information about the French Body Reset.",
        testimonial_cta:
          "Hi Grégory, I watched the testimonial and would like to know if a French Body Reset session is right for me in Mexico City.",
        sticky_cta:
          "Hi Grégory, I'm in Mexico City and I'd like to check availability for a 75-min session.",
      },
    },
    sections: {
      processEyebrow: "Process",
      faqEyebrow: "FAQ",
      faqTitle: "Frequently asked questions",
    },
    faq: [
      {
        question: "Does it replace medical care?",
        answer:
          "No. Méthode TMS® is a hands-on wellbeing and body-comfort approach. It does not replace medical diagnosis or treatment.",
      },
      {
        question: "Is it painful?",
        answer:
          "The work can be deep, but it is calibrated. Grégory works with the body, never against it.",
      },
      {
        question: "Where does the session happen?",
        answer:
          "Depending on availability and setting conditions, in an adapted private space in Mexico City.",
      },
      {
        question: "How long is the session?",
        answer: "The CDMX private session lasts 75 minutes.",
      },
      {
        question: "How do I book?",
        answer:
          "Send a WhatsApp. Grégory or the CRM workflow will qualify your request and offer the next available option.",
      },
    ],
  },

  fr: {
    ...campaignCore,
    route: "/fr/seance-privee-mexico-city",
    language: "FR",
    htmlLang: "fr",
    whatsappUrls: {
      default: getCdmxWhatsappUrl("fr", "default"),
      book_intent: getCdmxWhatsappUrl("fr", "book_intent"),
      more_info_intent: getCdmxWhatsappUrl("fr", "more_info_intent"),
      testimonial_cta: getCdmxWhatsappUrl("fr", "testimonial_cta"),
      sticky_cta: getCdmxWhatsappUrl("fr", "sticky_cta"),
    },
    meta: {
      title: "French Body Reset à Mexico City | Pas un massage classique | Grégory Tordjman",
      description:
        "Pas un massage classique. Séance privée de 75 minutes de French Body Reset à Mexico City avec Grégory Tordjman. Disponibilités limitées cette semaine.",
    },
    hero: {
      eyebrow: "Séance privée · CDMX",
      title: "Nuque raide, dos chargé ou corps lourd à Mexico City ?",
      subtitle:
        "Pas un massage classique. Une séance de 75 minutes de French Body Reset avec Grégory Tordjman pour aider le corps à relâcher les tensions profondes, retrouver de la mobilité et calmer le stress accumulé.",
      microNote: "Séances privées à CDMX sur rendez-vous. Disponibilités limitées cette semaine.",
      ctaPrimary: "Vérifier une disponibilité sur WhatsApp",
      ctaSecondary: "Réserver une séance de 75 min",
      proofLine: "Depuis 2014 · 9 000+ corps accompagnés · 230+ thérapeutes formés",
      imageAlt: "Grégory Tordjman — French Body Reset à Mexico City",
    },
    forYouIf: {
      title: "Pour vous si votre corps se sent chargé.",
      items: sharedNeedOptions.fr.map((o) => o.label),
    },
    difference: {
      title: "Ce n'est pas un massage spa.",
      body: "Un massage spa cherche souvent une détente générale. Le French Body Reset commence par une lecture du corps : posture, respiration, zones de tension et mobilité. Ensuite, le travail manuel s'adapte à ce que le corps présente ce jour-là.",
      points: [
        "Lecture du corps d'abord",
        "Travail manuel profond mais calibré",
        "Focus sur tension, mobilité et relâchement du système nerveux",
        "Réponse personnelle de Grégory",
        "L'avis médical reste prioritaire lorsque nécessaire",
      ],
      imageAlt: "Geste manuel de la Méthode TMS®",
    },
    offerBlock: {
      title: "Session de lancement CDMX",
      bullets: [
        "Séance privée de 75 minutes",
        "Sur rendez-vous uniquement",
        "Réponse personnelle par WhatsApp",
        "Disponibilités limitées cette semaine",
      ],
      launchRateLine: "Tarif de lancement disponible cette semaine par WhatsApp.",
      showPrice: false,
    },
    proof: {
      badges: [
        { value: "Depuis 2014", label: "Méthode TMS®" },
        { value: "9 000+", label: "corps accompagnés" },
        { value: "230+", label: "thérapeutes formés" },
        { value: "MX & US", label: "témoignages vérifiés" },
        { value: "Grégory Tordjman", label: "méthode créée par" },
      ],
    },
    testimonial: {
      posterSrc: "/practice-01.webp",
      cta: "Demander à Grégory si une séance est adaptée",
    },
    process: {
      title: "Comment ça se passe",
      steps: [
        "Envoyez un WhatsApp",
        "Indiquez où se situe la tension",
        "Grégory vérifie la disponibilité",
        "Réservez votre séance de 75 min",
        "Recevez votre French Body Reset",
      ],
    },
    shortForm: {
      label: "Demande rapide",
      headline: "Vous préférez écrire avant WhatsApp",
      sub: "Formulaire court — Grégory ou l'équipe répond selon disponibilité.",
      tensionLabel: "Tension principale",
      tensionPlaceholder: "Sélectionnez une option",
      whatsappLabel: "WhatsApp",
      whatsappPlaceholder: "+52...",
      languageLabel: "Langue préférée",
      languageOptions: [
        { value: "FR", label: "Français" },
        { value: "EN", label: "English" },
        { value: "ES", label: "Español" },
      ],
      needOptions: sharedNeedOptions.fr,
      submit: "Envoyer la demande",
      submitting: "Envoi...",
      contactError: "Indiquez un WhatsApp valide.",
      requiredError: "Ce champ est nécessaire.",
      submitError: "La demande n'a pas pu être envoyée. Vérifiez le contact puis réessayez.",
      successTitle: "Demande reçue.",
      successBody: "Grégory étudiera personnellement et répondra selon disponibilité.",
      successNote: "Votre demande est enregistrée de façon confidentielle.",
      newRequest: "Envoyer une autre demande",
      whatsappAfterLabel: "Ajouter du contexte sur WhatsApp",
    },
    stickyCta: {
      whatsapp: "WhatsApp Grégory",
      booking: "Réserver 75 min",
    },
    whatsapp: {
      messages: {
        default:
          "Bonjour Grégory, je suis à Mexico City et je souhaite vérifier une disponibilité pour une séance de 75 min de French Body Reset.",
        book_intent:
          "Bonjour Grégory, je suis à Mexico City et je souhaite réserver une séance de 75 min de French Body Reset.",
        more_info_intent:
          "Bonjour Grégory, je suis à Mexico City et j'aimerais plus d'informations sur le French Body Reset.",
        testimonial_cta:
          "Bonjour Grégory, j'ai vu le témoignage et j'aimerais savoir si une séance de French Body Reset est adaptée pour moi à Mexico City.",
        sticky_cta:
          "Bonjour Grégory, je suis à Mexico City et je souhaite vérifier une disponibilité pour une séance de 75 min.",
      },
    },
    sections: {
      processEyebrow: "Processus",
      faqEyebrow: "FAQ",
      faqTitle: "Questions fréquentes",
    },
    faq: [
      {
        question: "La séance remplace-t-elle une consultation médicale ?",
        answer:
          "Non. La Méthode TMS® est une approche manuelle de bien-être et de confort corporel. Elle ne remplace pas un diagnostic ou un traitement médical.",
      },
      {
        question: "Est-ce douloureux ?",
        answer:
          "Le travail peut être profond, mais il est calibré. Grégory travaille avec le corps, jamais contre lui.",
      },
      {
        question: "Où se déroule la séance ?",
        answer:
          "Selon disponibilité et conditions du lieu, dans un espace privé adapté à Mexico City.",
      },
      {
        question: "Combien de temps dure la séance ?",
        answer: "La séance privée CDMX dure 75 minutes.",
      },
      {
        question: "Comment réserver ?",
        answer:
          "Envoyez un WhatsApp. Grégory ou le workflow CRM qualifie la demande et propose la prochaine disponibilité.",
      },
    ],
  },
};

export const CDMX_PRIVATE_SESSION_CAMPAIGN = CDMX_PRIVATE_SESSION_CAMPAIGNS.es;

export function getCdmxPrivateSessionCampaign(locale: string) {
  if (locale === "fr" || locale === "en" || locale === "es") {
    return CDMX_PRIVATE_SESSION_CAMPAIGNS[locale];
  }

  return null;
}

export function getCdmxCampaignAlternates() {
  return {
    "x-default": CDMX_PRIVATE_SESSION_CAMPAIGNS.es.route,
    fr: CDMX_PRIVATE_SESSION_CAMPAIGNS.fr.route,
    en: CDMX_PRIVATE_SESSION_CAMPAIGNS.en.route,
    es: CDMX_PRIVATE_SESSION_CAMPAIGNS.es.route,
  };
}

export function getCdmxLocaleFromLanguage(language: Language): "fr" | "en" | "es" {
  if (language === "EN") return "en";
  if (language === "ES") return "es";
  return "fr";
}
