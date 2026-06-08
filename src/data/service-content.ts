export type PublicLocale = "fr" | "en" | "es";

export type PublicFaqItem = {
  question: string;
  answer: string;
};

export const SESSION_FAQ: Record<PublicLocale, PublicFaqItem[]> = {
  fr: [
    {
      question: "Qu'est-ce qu'une séance de reboutement TMS® ?",
      answer:
        "Une séance de reboutement TMS® est un accompagnement manuel personnalisé, inspiré du reboutement traditionnel et intégré à la Méthode TMS®. Grégory commence par observer le contexte, la posture et les zones de tension, puis adapte ses gestes au confort, aux réactions et aux limites de la personne.",
    },
    {
      question: "Quelle différence avec un massage ou une consultation médicale ?",
      answer:
        "La séance n'est ni un massage standardisé ni une consultation médicale. Elle associe observation, toucher manuel et repères personnalisés dans une démarche de confort corporel. Elle ne pose pas de diagnostic, ne traite pas une maladie et ne remplace pas l'avis d'un médecin ou d'un professionnel de santé.",
    },
    {
      question: "Dans quelles situations demander une séance ?",
      answer:
        "La demande peut concerner une sensation de raideur, de fatigue corporelle ou d'inconfort après un voyage, une période de travail intense, un effort ou un rythme prolongé. Grégory échange d'abord sur le contexte afin de vérifier qu'une séance manuelle est adaptée et qu'un avis médical n'est pas prioritaire.",
    },
  ],
  en: [
    {
      question: "What is a TMS® Manual Therapy session?",
      answer:
        "A TMS® Manual Therapy session is personalised hands-on support inspired by traditional French bonesetting and integrated into the Méthode TMS®. Grégory first considers the context, posture and areas of tension, then adapts each gesture to the person's comfort, responses and individual boundaries.",
    },
    {
      question: "How is it different from massage or medical care?",
      answer:
        "The session is neither a standard massage nor medical care. It combines observation, hands-on work and personalised guidance to support physical comfort. It does not diagnose or treat disease and never replaces advice, examination or treatment from a doctor or another qualified healthcare professional.",
    },
    {
      question: "When might someone request a session?",
      answer:
        "A request may relate to stiffness, physical fatigue or discomfort after travel, sustained work, exercise or a demanding schedule. Grégory first discusses the person's context to decide whether hands-on support is appropriate and whether medical advice should take priority.",
    },
  ],
  es: [
    {
      question: "¿Qué es una sesión de Terapia manual TMS®?",
      answer:
        "Una sesión de Terapia manual TMS® es un acompañamiento manual personalizado, inspirado en el reboutement tradicional francés e integrado en el Método TMS®. Grégory observa primero el contexto, la postura y las zonas de tensión, y adapta después cada gesto al confort, las reacciones y los límites de la persona.",
    },
    {
      question: "¿En qué se diferencia de un masaje o de una consulta médica?",
      answer:
        "La sesión no es un masaje estandarizado ni una consulta médica. Combina observación, trabajo manual y pautas personalizadas para favorecer el confort corporal. No diagnostica ni trata enfermedades y nunca sustituye el consejo, la evaluación o el tratamiento de un médico u otro profesional sanitario cualificado.",
    },
    {
      question: "¿En qué situaciones se puede solicitar una sesión?",
      answer:
        "La solicitud puede estar relacionada con rigidez, fatiga corporal o incomodidad después de un viaje, una etapa de trabajo intenso, ejercicio o un ritmo exigente. Grégory conversa primero sobre el contexto para valorar si el acompañamiento manual es adecuado o si debe priorizarse una consulta médica.",
    },
  ],
};

export const SESSION_PRECAUTIONS: Record<
  PublicLocale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    points: string[];
    medicalLinkLabel: string;
    emergencyLinkLabel: string;
  }
> = {
  fr: {
    eyebrow: "Cadre & précautions",
    title: "Quand la séance doit-elle laisser place à un avis médical ?",
    intro:
      "La Méthode TMS® accompagne le confort corporel. Elle ne remplace ni un diagnostic, ni un traitement, ni un suivi médical.",
    points: [
      "Une douleur brutale, inhabituelle, persistante ou qui s'aggrave nécessite un avis professionnel.",
      "Après un traumatisme, en cas de fièvre, de perte de force, de trouble neurologique ou de symptôme inquiétant, la séance est différée.",
      "Les traitements, antécédents et contre-indications connus doivent être signalés avant toute intervention.",
    ],
    medicalLinkLabel: "Repères officiels de l'Assurance Maladie",
    emergencyLinkLabel: "Numéros d'urgence en France",
  },
  en: {
    eyebrow: "Scope & precautions",
    title: "When should medical advice take priority?",
    intro:
      "The Méthode TMS® supports physical comfort. It does not replace diagnosis, treatment or ongoing medical care.",
    points: [
      "Sudden, unusual, persistent or worsening pain requires professional medical advice.",
      "After trauma, or with fever, loss of strength, neurological signs or any worrying symptom, the session is postponed.",
      "Known treatments, medical history and contraindications must be disclosed before any hands-on intervention.",
    ],
    medicalLinkLabel: "Official guidance from Assurance Maladie",
    emergencyLinkLabel: "Emergency numbers in France",
  },
  es: {
    eyebrow: "Marco y precauciones",
    title: "¿Cuándo debe priorizarse una consulta médica?",
    intro:
      "El Método TMS® acompaña el confort corporal. No sustituye un diagnóstico, un tratamiento ni un seguimiento médico.",
    points: [
      "Un dolor repentino, inusual, persistente o que empeora requiere una valoración profesional.",
      "Después de un traumatismo, o ante fiebre, pérdida de fuerza, signos neurológicos o síntomas preocupantes, la sesión se pospone.",
      "Los tratamientos, antecedentes y contraindicaciones conocidos deben comunicarse antes de cualquier intervención manual.",
    ],
    medicalLinkLabel: "Información oficial del Assurance Maladie",
    emergencyLinkLabel: "Números de urgencia en Francia",
  },
};
