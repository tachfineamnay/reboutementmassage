import type { Language } from "@/data/copy";

export type CampaignLeadOption = {
  value: string;
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
    title: [string, string];
    subtitle: string;
    cta: string;
    note: string;
  };
  trust: Array<{ value: string; label: string }>;
  sections: {
    situationsEyebrow: string;
    situationsTitle: string;
    situationsSub: string;
    differenceImageAlt: string;
    processEyebrow: string;
    processTitle: string;
    faqEyebrow: string;
    faqTitle: string;
  };
  situations: Array<{ title: string; body: string }>;
  difference: {
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  };
  process: Array<{ title: string; body: string }>;
  form: {
    label: string;
    headline: string;
    sub: string;
    steps: string[];
    needQuestion: string;
    locationQuestion: string;
    identityQuestion: string;
    contextQuestion: string;
    availabilityLabel: string;
    needOptions: CampaignLeadOption[];
    urgencyOptions: CampaignLeadOption[];
    fields: {
      location: string;
      locationPlaceholder: string;
      firstName: string;
      firstNamePlaceholder: string;
      contact: string;
      contactPlaceholder: string;
      context: string;
      contextPlaceholder: string;
    };
    next: string;
    back: string;
    submit: string;
    submitting: string;
    contactError: string;
    requiredError: string;
    submitError: string;
    successTitle: string;
    successBody: string;
    successNote: string;
    newRequest: string;
    whatsappLabel: string;
    whatsappUrl: string;
    whatsappText: string;
  };
  faq: Array<{ question: string; answer: string }>;
};

const whatsappNumber = "33665517735";

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
};

function whatsappUrl(text: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const CDMX_PRIVATE_SESSION_CAMPAIGNS: Record<"fr" | "en" | "es", CampaignLandingConfig> = {
  es: {
    ...campaignCore,
    route: "/es/sesion-privada-cdmx",
    language: "ES",
    htmlLang: "es",
    meta: {
      title: "Reset corporal francés privado en CDMX | Grégory Tordjman",
      description:
        "Sesión privada Método TMS® en Ciudad de México: acompañamiento manual preciso, discreto y personalizado para viajeros, ejecutivos y cuerpos bajo alta demanda.",
    },
    hero: {
      eyebrow: "Sesión privada · Ciudad de México",
      title: ["Reset corporal francés", "privado en CDMX."],
      subtitle:
        "Para viajeros, ejecutivos, deportistas y cuerpos bajo alta demanda. Una sesión manual precisa, discreta y personalizada con Grégory Tordjman.",
      cta: "Solicitar revisión privada",
      note: "Respuesta personal. Confidencial. Según disponibilidad.",
    },
    trust: [
      { value: "Desde 2014", label: "Método TMS®" },
      { value: "9,000+", label: "cuerpos acompañados" },
      { value: "230+", label: "terapeutas formados" },
      { value: "CDMX", label: "sesiones privadas" },
    ],
    sections: {
      situationsEyebrow: "Cuándo pedir una revisión",
      situationsTitle: "CDMX exige mucho al cuerpo.",
      situationsSub:
        "El formulario ayuda a entender el contexto antes de proponer una sesión privada.",
      differenceImageAlt: "Gesto manual de la Método TMS®",
      processEyebrow: "Proceso",
      processTitle: "Una solicitud corta. Una revisión personal.",
      faqEyebrow: "FAQ",
      faqTitle: "Antes de enviar la solicitud.",
    },
    situations: [
      {
        title: "Después de viaje",
        body: "Vuelo largo, cuerpo pesado, agenda exigente o necesidad de recuperar movilidad antes de continuar.",
      },
      {
        title: "Ritmo intenso",
        body: "Juntas, pantalla, tráfico y estrés acumulado. Una revisión manual para volver a sentir espacio en el cuerpo.",
      },
      {
        title: "Estancia privada",
        body: "Hotel, residencia, villa o espacio privado. Organización discreta y adaptada al contexto.",
      },
    ],
    difference: {
      eyebrow: "No es un masaje clásico",
      title: "Una lectura manual precisa antes de intervenir.",
      body:
        "La sesión empieza por observar el cuerpo, el contexto y las zonas de tensión percibidas. El gesto se adapta a la persona, sin diagnóstico médico ni promesa de resultado.",
      points: [
        "Lectura global: postura, respiración, movilidad y tensiones.",
        "Trabajo manual profundo pero calibrado.",
        "Marco confidencial, personalizado y sin compromiso.",
        "Orientación médica recomendada si la situación lo requiere.",
      ],
    },
    process: [
      { title: "Solicitud", body: "Complete el formulario corto con su zona, disponibilidad y contexto principal." },
      { title: "Revisión", body: "Grégory revisa personalmente si una sesión privada es pertinente y posible." },
      { title: "Propuesta", body: "Recibirá una respuesta según disponibilidad, ubicación y condiciones de intervención." },
    ],
    form: {
      label: "Solicitud privada CDMX",
      headline: "Recibir una respuesta personal.",
      sub: "Formulario corto para revisar disponibilidad y pertinencia de una sesión privada en Ciudad de México.",
      steps: ["Necesidad", "Zona", "Contacto", "Contexto"],
      needQuestion: "¿Cuál es el contexto principal?",
      locationQuestion: "¿Dónde y cuándo sería la sesión?",
      identityQuestion: "¿Cómo podemos responderle?",
      contextQuestion: "Añada un contexto breve si lo desea.",
      availabilityLabel: "Disponibilidad",
      needOptions: [
        { value: "Cuerpo cargado", label: "Cuerpo cargado" },
        { value: "Cuello / espalda", label: "Cuello / espalda" },
        { value: "Después de viaje", label: "Después de viaje" },
        { value: "Estrés / ritmo intenso", label: "Estrés / ritmo intenso" },
        { value: "Recuperación", label: "Recuperación" },
        { value: "Otro", label: "Otro" },
      ],
      urgencyOptions: [
        { value: "Hoy", label: "Hoy" },
        { value: "Esta semana", label: "Esta semana" },
        { value: "Más adelante", label: "Más adelante" },
      ],
      fields: {
        location: "Barrio, hotel o zona",
        locationPlaceholder: "Ej: Polanco, Roma Norte, hotel en Reforma...",
        firstName: "Nombre",
        firstNamePlaceholder: "Su nombre",
        contact: "WhatsApp o email",
        contactPlaceholder: "+52... o email",
        context: "Mensaje opcional",
        contextPlaceholder: "Ej: llego después de un vuelo, estoy en Polanco hasta el viernes...",
      },
      next: "Continuar",
      back: "Volver",
      submit: "Enviar solicitud privada",
      submitting: "Enviando...",
      contactError: "Indique un WhatsApp o email válido.",
      requiredError: "Este campo es necesario para continuar.",
      submitError: "No se pudo enviar la solicitud. Revise el contacto e inténtelo de nuevo.",
      successTitle: "Solicitud recibida.",
      successBody: "Grégory revisará personalmente el contexto y responderá según disponibilidad.",
      successNote: "Su solicitud queda registrada de forma confidencial.",
      newRequest: "Enviar otra solicitud",
      whatsappLabel: "Añadir contexto por WhatsApp",
      whatsappText: "Hola Grégory, acabo de enviar una solicitud privada para Ciudad de México y quiero compartir más contexto.",
      whatsappUrl: whatsappUrl("Hola Grégory, acabo de enviar una solicitud privada para Ciudad de México y quiero compartir más contexto."),
    },
    faq: [
      {
        question: "¿La sesión reemplaza una consulta médica?",
        answer: "No. La Método TMS® es un acompañamiento manual de bienestar y confort corporal. No reemplaza un diagnóstico ni un tratamiento médico.",
      },
      {
        question: "¿Dónde se realiza la sesión?",
        answer: "Según disponibilidad y condiciones del lugar: hotel, residencia privada o espacio adaptado en Ciudad de México.",
      },
      {
        question: "¿Cuánto tarda la respuesta?",
        answer: "La solicitud se revisa personalmente. La respuesta depende de disponibilidad, zona y contexto.",
      },
    ],
  },

  en: {
    ...campaignCore,
    route: "/en/mexico-city-private-session",
    language: "EN",
    htmlLang: "en",
    meta: {
      title: "Private French Body Reset in Mexico City | Grégory Tordjman",
      description:
        "Private Méthode TMS® session in Mexico City: precise, discreet and personalised hands-on support for travelers, executives and high-demand bodies.",
    },
    hero: {
      eyebrow: "Private session · Mexico City",
      title: ["Private French", "Body Reset in CDMX."],
      subtitle:
        "For travelers, executives, athletes and high-demand bodies. A precise, discreet and personalised manual session with Grégory Tordjman.",
      cta: "Request private review",
      note: "Personal response. Confidential. Subject to availability.",
    },
    trust: [
      { value: "Since 2014", label: "Méthode TMS®" },
      { value: "9,000+", label: "bodies supported" },
      { value: "230+", label: "therapists trained" },
      { value: "CDMX", label: "private sessions" },
    ],
    sections: {
      situationsEyebrow: "When to request a review",
      situationsTitle: "Mexico City asks a lot from the body.",
      situationsSub:
        "The form helps clarify the context before a private session is proposed.",
      differenceImageAlt: "Méthode TMS® manual gesture",
      processEyebrow: "Process",
      processTitle: "One short request. One personal review.",
      faqEyebrow: "FAQ",
      faqTitle: "Before sending the request.",
    },
    situations: [
      {
        title: "After travel",
        body: "Long flight, heavy body, demanding schedule or the need to regain mobility before continuing.",
      },
      {
        title: "Intense rhythm",
        body: "Meetings, screens, traffic and accumulated stress. A manual review to help the body feel more available.",
      },
      {
        title: "Private stay",
        body: "Hotel, residence, villa or private space. Discreet organisation adapted to the setting.",
      },
    ],
    difference: {
      eyebrow: "Not a regular massage",
      title: "A precise body reading before any hands-on work.",
      body:
        "The session begins by observing the body, context and perceived tension areas. The gesture adapts to the person, without medical diagnosis or promised outcome.",
      points: [
        "Global reading: posture, breathing, mobility and tensions.",
        "Deep but calibrated manual work.",
        "Confidential, personalised and no-obligation framework.",
        "Medical advice remains priority when the situation requires it.",
      ],
    },
    process: [
      { title: "Request", body: "Complete the short form with your area, availability and main context." },
      { title: "Review", body: "Grégory personally reviews whether a private session is relevant and possible." },
      { title: "Proposal", body: "You receive a response based on availability, location and intervention conditions." },
    ],
    form: {
      label: "Private request CDMX",
      headline: "Receive a personal response.",
      sub: "A short form to review availability and relevance for a private session in Mexico City.",
      steps: ["Need", "Area", "Contact", "Context"],
      needQuestion: "What is the main context?",
      locationQuestion: "Where and when would the session take place?",
      identityQuestion: "How can we respond?",
      contextQuestion: "Add brief context if useful.",
      availabilityLabel: "Availability",
      needOptions: [
        { value: "Heavy body", label: "Heavy body" },
        { value: "Neck / back", label: "Neck / back" },
        { value: "After travel", label: "After travel" },
        { value: "Stress / intense rhythm", label: "Stress / intense rhythm" },
        { value: "Recovery", label: "Recovery" },
        { value: "Other", label: "Other" },
      ],
      urgencyOptions: [
        { value: "Today", label: "Today" },
        { value: "This week", label: "This week" },
        { value: "Later", label: "Later" },
      ],
      fields: {
        location: "Area, hotel or neighborhood",
        locationPlaceholder: "E.g., Polanco, Roma Norte, hotel near Reforma...",
        firstName: "First name",
        firstNamePlaceholder: "Your first name",
        contact: "WhatsApp or email",
        contactPlaceholder: "+52... or email",
        context: "Optional message",
        contextPlaceholder: "E.g., I arrive after a flight, I am in Polanco until Friday...",
      },
      next: "Continue",
      back: "Back",
      submit: "Send private request",
      submitting: "Sending...",
      contactError: "Please enter a valid WhatsApp or email.",
      requiredError: "This field is required to continue.",
      submitError: "The request could not be sent. Check the contact and try again.",
      successTitle: "Request received.",
      successBody: "Grégory will personally review the context and respond according to availability.",
      successNote: "Your request is recorded confidentially.",
      newRequest: "Send another request",
      whatsappLabel: "Add context on WhatsApp",
      whatsappText: "Hello Grégory, I just submitted a private request for Mexico City and would like to share more context.",
      whatsappUrl: whatsappUrl("Hello Grégory, I just submitted a private request for Mexico City and would like to share more context."),
    },
    faq: [
      {
        question: "Does the session replace medical care?",
        answer: "No. Méthode TMS® is hands-on wellbeing and body-comfort support. It does not replace medical diagnosis or treatment.",
      },
      {
        question: "Where does the session take place?",
        answer: "Depending on availability and setting conditions: hotel, private residence or adapted space in Mexico City.",
      },
      {
        question: "How fast is the response?",
        answer: "The request is reviewed personally. Response time depends on availability, area and context.",
      },
    ],
  },

  fr: {
    ...campaignCore,
    route: "/fr/seance-privee-mexico-city",
    language: "FR",
    htmlLang: "fr",
    meta: {
      title: "Séance privée French Body Reset à Mexico City | Grégory Tordjman",
      description:
        "Séance privée Méthode TMS® à Mexico City : accompagnement manuel précis, discret et personnalisé pour voyageurs, dirigeants et corps sous forte demande.",
    },
    hero: {
      eyebrow: "Séance privée · Mexico City",
      title: ["French Body Reset", "privé à Mexico City."],
      subtitle:
        "Pour voyageurs, dirigeants, sportifs et corps sous forte demande. Une séance manuelle précise, discrète et personnalisée avec Grégory Tordjman.",
      cta: "Demander une étude privée",
      note: "Réponse personnelle. Confidentiel. Selon disponibilité.",
    },
    trust: [
      { value: "Depuis 2014", label: "Méthode TMS®" },
      { value: "9 000+", label: "corps accompagnés" },
      { value: "230+", label: "thérapeutes formés" },
      { value: "CDMX", label: "séances privées" },
    ],
    sections: {
      situationsEyebrow: "Quand demander une étude",
      situationsTitle: "Mexico City sollicite beaucoup le corps.",
      situationsSub:
        "Le formulaire permet de comprendre le contexte avant de proposer une séance privée.",
      differenceImageAlt: "Geste manuel de la Méthode TMS®",
      processEyebrow: "Processus",
      processTitle: "Une demande courte. Une étude personnelle.",
      faqEyebrow: "FAQ",
      faqTitle: "Avant d'envoyer la demande.",
    },
    situations: [
      {
        title: "Après un voyage",
        body: "Vol long, corps lourd, agenda exigeant ou besoin de retrouver de la mobilité avant de continuer.",
      },
      {
        title: "Rythme intense",
        body: "Rendez-vous, écran, trafic et stress accumulé. Une lecture manuelle pour redonner de l'espace au corps.",
      },
      {
        title: "Séjour privé",
        body: "Hôtel, résidence, villa ou espace privé. Organisation discrète et adaptée au contexte.",
      },
    ],
    difference: {
      eyebrow: "Pas un massage classique",
      title: "Une lecture manuelle précise avant d'intervenir.",
      body:
        "La séance commence par l'observation du corps, du contexte et des zones de tension ressenties. Le geste s'adapte à la personne, sans diagnostic médical ni promesse de résultat.",
      points: [
        "Lecture globale : posture, respiration, mobilité et tensions.",
        "Travail manuel profond mais calibré.",
        "Cadre confidentiel, personnalisé et sans engagement.",
        "L'avis médical reste prioritaire lorsque la situation l'exige.",
      ],
    },
    process: [
      { title: "Demande", body: "Remplissez le formulaire court avec votre zone, disponibilité et contexte principal." },
      { title: "Étude", body: "Grégory vérifie personnellement si une séance privée est pertinente et possible." },
      { title: "Proposition", body: "Vous recevez une réponse selon disponibilité, localisation et conditions d'intervention." },
    ],
    form: {
      label: "Demande privée CDMX",
      headline: "Recevoir une réponse personnelle.",
      sub: "Un formulaire court pour étudier la disponibilité et la pertinence d'une séance privée à Mexico City.",
      steps: ["Besoin", "Zone", "Contact", "Contexte"],
      needQuestion: "Quel est le contexte principal ?",
      locationQuestion: "Où et quand aurait lieu la séance ?",
      identityQuestion: "Comment pouvons-nous vous répondre ?",
      contextQuestion: "Ajoutez un contexte bref si utile.",
      availabilityLabel: "Disponibilité",
      needOptions: [
        { value: "Corps chargé", label: "Corps chargé" },
        { value: "Nuque / dos", label: "Nuque / dos" },
        { value: "Après voyage", label: "Après voyage" },
        { value: "Stress / rythme intense", label: "Stress / rythme intense" },
        { value: "Récupération", label: "Récupération" },
        { value: "Autre", label: "Autre" },
      ],
      urgencyOptions: [
        { value: "Aujourd'hui", label: "Aujourd'hui" },
        { value: "Cette semaine", label: "Cette semaine" },
        { value: "Plus tard", label: "Plus tard" },
      ],
      fields: {
        location: "Quartier, hôtel ou zone",
        locationPlaceholder: "Ex : Polanco, Roma Norte, hôtel près de Reforma...",
        firstName: "Prénom",
        firstNamePlaceholder: "Votre prénom",
        contact: "WhatsApp ou email",
        contactPlaceholder: "+52... ou email",
        context: "Message optionnel",
        contextPlaceholder: "Ex : j'arrive après un vol, je suis à Polanco jusqu'à vendredi...",
      },
      next: "Continuer",
      back: "Retour",
      submit: "Envoyer la demande privée",
      submitting: "Envoi...",
      contactError: "Indiquez un WhatsApp ou email valide.",
      requiredError: "Ce champ est nécessaire pour continuer.",
      submitError: "La demande n'a pas pu être envoyée. Vérifiez le contact puis réessayez.",
      successTitle: "Demande reçue.",
      successBody: "Grégory étudiera personnellement le contexte et répondra selon disponibilité.",
      successNote: "Votre demande est enregistrée de façon confidentielle.",
      newRequest: "Envoyer une autre demande",
      whatsappLabel: "Ajouter du contexte sur WhatsApp",
      whatsappText: "Bonjour Grégory, je viens d'envoyer une demande privée pour Mexico City et je souhaite ajouter du contexte.",
      whatsappUrl: whatsappUrl("Bonjour Grégory, je viens d'envoyer une demande privée pour Mexico City et je souhaite ajouter du contexte."),
    },
    faq: [
      {
        question: "La séance remplace-t-elle une consultation médicale ?",
        answer: "Non. La Méthode TMS® est un accompagnement manuel de bien-être et de confort corporel. Elle ne remplace pas un diagnostic ou un traitement médical.",
      },
      {
        question: "Où se déroule la séance ?",
        answer: "Selon disponibilité et conditions du lieu : hôtel, résidence privée ou espace adapté à Mexico City.",
      },
      {
        question: "Sous quel délai reçoit-on une réponse ?",
        answer: "La demande est étudiée personnellement. Le délai dépend de la disponibilité, de la zone et du contexte.",
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
