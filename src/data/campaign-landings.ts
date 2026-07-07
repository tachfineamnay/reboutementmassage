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
  value: string;
  label: string;
};

export type CampaignOfferBlock = {
  title: string;
  bullets: string[];
  launchRateLine?: string;
  showPrice: boolean;
  priceLabel?: string;
  priceValue?: string;
  whatsappIntent?: WhatsappIntent;
  ctaLabel?: string;
};

export type CampaignOfferCard = {
  title: string;
  subtitle: string;
  description: string;
  includes: string[];
  ctaLabel: string;
  whatsappIntent: WhatsappIntent;
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
    body?: string;
    microNote: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaSecondaryHref?: string;
    proofLine: string;
    imageSrc?: string;
    imageAlt: string;
  };
  forYouIf: {
    title: string;
    body?: string;
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
    cards?: CampaignOfferCard[];
  };
  finalCta?: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  offerBlocks?: CampaignOfferBlock[];
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
    nameLabel?: string;
    namePlaceholder?: string;
    zoneLabel?: string;
    zonePlaceholder?: string;
    offerLabel?: string;
    offerPlaceholder?: string;
    offerOptions?: Array<{ value: string; label: string }>;
    urgencyLabel?: string;
    urgencyPlaceholder?: string;
    urgencyOptions?: Array<{ value: string; label: string }>;
    contextLabel?: string;
    contextPlaceholder?: string;
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

const DEFAULT_WHATSAPP_NUMBER = "";

export function getCdmxWhatsappNumber() {
  return process.env.NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER?.replace(/\D/g, "") || DEFAULT_WHATSAPP_NUMBER;
}

// Hardcoded CDMX WhatsApp URLs for the static landing page
// These bypass the env-var system for the stable /es/reset-corporal-frances-cdmx route
const CDMX_STATIC_PHONE = "525633003042";

// Single, unified WhatsApp link for the /es/reset-corporal-frances-cdmx landing.
// Every CTA on that page must point here.
export const CDMX_WHATSAPP_URL = `https://wa.me/${CDMX_STATIC_PHONE}?text=${encodeURIComponent(
  "Hola, quiero reservar una sesi\u00f3n de French Body Reset en CDMX. Quiero saber qu\u00e9 formato me conviene: Body Reset Fix o Body Reset Full."
)}`;

export const CDMX_STATIC_WA_URLS = {
  book_intent: CDMX_WHATSAPP_URL,
  more_info_intent: CDMX_WHATSAPP_URL,
  corporate: CDMX_WHATSAPP_URL,
  sticky_cta: CDMX_WHATSAPP_URL,
  default: CDMX_WHATSAPP_URL,
};

const CDMX_WHATSAPP_MESSAGES: Record<"fr" | "en" | "es", Record<WhatsappIntent, string>> = {
  es: {
    default:
      "Hola Grégory, estoy en CDMX y quiero reservar una sesión de Body Reset. Me interesa saber si me conviene Body Reset Fix o French Body Reset Full.",
    book_intent:
      "Hola Grégory, estoy en CDMX y quiero reservar Body Reset Fix para una zona prioritaria.",
    more_info_intent:
      "Hola Grégory, estoy en CDMX y quiero información sobre French Body Reset Full, el protocolo de 3 sesiones.",
    testimonial_cta:
      "Hola Grégory, vi la información de Body Reset en CDMX y quiero saber qué formato me conviene.",
    sticky_cta:
      "Hola Grégory, estoy en CDMX y quiero reservar una sesión de Body Reset.",
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
  const phone = getCdmxWhatsappNumber();
  if (!phone) return "#";
  const text = CDMX_WHATSAPP_MESSAGES[locale][intent];
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
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
    route: "/es/reset-corporal-frances-cdmx",
    language: "ES",
    htmlLang: "es",
    whatsappUrls: {
      default: CDMX_STATIC_WA_URLS.book_intent,
      book_intent: CDMX_STATIC_WA_URLS.book_intent,
      more_info_intent: CDMX_STATIC_WA_URLS.more_info_intent,
      testimonial_cta: CDMX_STATIC_WA_URLS.more_info_intent,
      sticky_cta: CDMX_STATIC_WA_URLS.sticky_cta,
    },
    meta: {
      title: "Reset Corporal Francés en CDMX | Sesión manual profunda",
      description:
        "Sesión privada de Reset Corporal Francés en Ciudad de México. Trabajo manual profundo, preciso y personalizado para tensión corporal, espalda cargada, cuello rígido y estrés acumulado. Reserva por WhatsApp.",
    },
    hero: {
      eyebrow: "CDMX · Sesión privada",
      title: "French Body Reset en Ciudad de México",
      subtitle:
        "No es un masaje tradicional. Es un reset profundo del cuerpo: una experiencia manual precisa para liberar tensión, soltar el sistema nervioso y recuperar más ligereza, respiración y claridad.",
      microNote: "Reserva simple por WhatsApp · Atención premium en CDMX",
      ctaPrimary: "Reservar por WhatsApp",
      ctaSecondary: "Pedir información",
      ctaSecondaryHref: CDMX_STATIC_WA_URLS.more_info_intent,
      proofLine: "Método francés · Preciso · Profundo · Personalizado",
      imageAlt: "French Body Reset en Ciudad de México — sesión manual premium",
    },
    forYouIf: {
      title: "Para ti si…",
      items: [
        "Sientes la espalda cargada",
        "Tienes cuello y hombros tensos",
        "Tu cuerpo se siente bloqueado",
        "Acumulas estrés físico o mental",
        "Buscas algo más profundo que un masaje tradicional",
        "Quieres una experiencia manual seria, premium y personalizada",
      ],
    },
    difference: {
      title: "No es un masaje. Es un reset del cuerpo.",
      body: "Es un trabajo manual profundo, preciso y personalizado. No es relajación superficial: es una intervención calibrada que lee el cuerpo antes de actuar — tensiones, respiración, movilidad, sistema nervioso. Cada sesión se adapta a lo que el cuerpo presenta ese día.\n\nNo promete curación ni sustituye una consulta médica. Es un acompañamiento corporal premium para personas que quieren algo más que un masaje tradicional.",
      points: [
        "Lectura del cuerpo antes de intervenir",
        "Trabajo manual profundo, preciso y calibrado",
        "Enfoque en tensión, respiración y sistema nervioso",
        "Personalizado: cada sesión es diferente",
        "La orientación médica sigue siendo prioritaria cuando hace falta",
      ],
      imageAlt: "Sesión de French Body Reset — método manual francés en CDMX",
    },
    offerBlock: {
      title: "Dos formatos. Una misma calidad.",
      bullets: [],
      showPrice: false,
      cards: [
        {
          title: "Body Reset Fix",
          subtitle: "Sesión puntual para una tensión prioritaria",
          description:
            "Ideal si quieres trabajar una zona prioritaria: espalda, cuello, hombros, zona lumbar o tensión acumulada. Una sesión precisa para desbloquear lo esencial.",
          includes: [
            "Zona de trabajo: espalda, cuello, hombros o lumbar",
            "Lectura corporal previa",
            "Trabajo manual profundo y calibrado",
            "Reserva directa por WhatsApp",
          ],
          ctaLabel: "Reservar Body Reset Fix",
          whatsappIntent: "book_intent",
        },
        {
          title: "Body Reset Full",
          subtitle: "Experiencia completa · Reset profundo",
          description:
            "Una sesión más completa para resetear el cuerpo en profundidad: espalda, cuello, hombros, pelvis, respiración y sistema nervioso. Ideal si sientes el cuerpo cargado o saturado.",
          includes: [
            "Trabajo global: espalda, cuello, pelvis, hombros",
            "Trabajo de respiración y sistema nervioso",
            "Sesión más completa y personalizada",
            "Orientación: Fix o Full por WhatsApp",
          ],
          ctaLabel: "Reservar Body Reset Full",
          whatsappIntent: "more_info_intent",
        },
      ],
    },
    proof: {
      badges: [
        { value: "Método francés", label: "creado por Grégory Tordjman" },
        { value: "9,000+", label: "cuerpos acompañados" },
        { value: "230+", label: "terapeutas formados" },
        { value: "CDMX", label: "sesiones privadas disponibles" },
        { value: "Desde 2014", label: "experiencia clínica probada" },
      ],
    },
    testimonial: {
      posterSrc: "/practice-01.webp",
      cta: "Preguntar si la sesión es adecuada para mí",
    },
    process: {
      title: "Reserva simple. Atención premium.",
      steps: [
        "Escribe por WhatsApp",
        "Indica tu necesidad y disponibilidad",
        "Recibe orientación: Fix o Full",
        "Confirma tu sesión privada en CDMX",
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
      nameLabel: "Nombre",
      namePlaceholder: "Tu nombre",
      zoneLabel: "Zona prioritaria",
      zonePlaceholder: "Polanco, Roma, Condesa, Reforma…",
      offerLabel: "Oferta deseada",
      offerPlaceholder: "Selecciona una opción",
      offerOptions: [
        { value: "body_reset_fix", label: "Body Reset Fix — sesión puntual" },
        { value: "body_reset_full", label: "Body Reset Full — reset completo" },
        { value: "unsure", label: "No sé todavía, quiero orientación" },
      ],
      urgencyLabel: "Urgencia",
      urgencyPlaceholder: "Selecciona una opción",
      urgencyOptions: [
        { value: "this_week", label: "Esta semana" },
        { value: "next_week", label: "Próxima semana" },
        { value: "this_month", label: "Este mes" },
        { value: "flexible", label: "Flexible" },
      ],
      contextLabel: "Mensaje opcional",
      contextPlaceholder: "Cuéntanos brevemente lo que sientes o lo que buscas",
    },
    stickyCta: {
      whatsapp: "Reservar por WhatsApp",
      booking: "",
    },
    whatsapp: {
      messages: CDMX_WHATSAPP_MESSAGES.es,
    },
    sections: {
      processEyebrow: "¿Cómo funciona?",
      faqEyebrow: "Preguntas",
      faqTitle: "Preguntas frecuentes",
    },
    faq: [
      {
        question: "¿Es un masaje tradicional?",
        answer:
          "No. French Body Reset es un trabajo manual profundo y preciso, diferente de un masaje de spa o relajación. Comienza con una lectura del cuerpo y se adapta a lo que el cuerpo presenta ese día.",
      },
      {
        question: "¿Cuál es la diferencia entre Body Reset Fix y Body Reset Full?",
        answer:
          "Body Reset Fix es una sesión puntual enfocada en una zona prioritaria (espalda, cuello, hombros o lumbar). Body Reset Full es una sesión más completa que trabaja el cuerpo globalmente — espalda, cuello, pelvis, respiración y sistema nervioso.",
      },
      {
        question: "¿Dónde se realiza la sesión en CDMX?",
        answer:
          "La sesión se realiza en un espacio privado en CDMX. La ubicación exacta se confirma por WhatsApp al reservar, según disponibilidad y condiciones del lugar.",
      },
      {
        question: "¿Puedo escribir antes de reservar?",
        answer:
          "Sí. Puedes escribir directamente por WhatsApp para hacer preguntas, pedir orientación sobre qué formato te conviene, o confirmar disponibilidad sin ningún compromiso.",
      },
      {
        question: "¿Qué pasa si tengo dolor fuerte o una lesión?",
        answer:
          "Esta sesión no sustituye diagnóstico ni tratamiento médico. Si tienes una lesión, dolor intenso o condición médica importante, consulta primero con un profesional de salud.",
      },
    ],
    finalCta: {
      title: "Tu cuerpo no necesita más ruido. Necesita un reset preciso.",
      body: "Reserva simple por WhatsApp. Sin formularios complicados. Atención premium en CDMX.",
      primary: "Reservar por WhatsApp",
      secondary: "Pedir información",
    },
  },

  en: {
    ...campaignCore,
    route: "/en/mexico-city-french-body-reset",
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
    route: "/fr/french-body-reset-mexico-city",
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
