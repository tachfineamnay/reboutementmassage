export type ConversionIntent =
  | "private_session"
  | "hospitality_partner"
  | "training"
  | "workshop"
  | "partnership"
  | "other";

export const INTENT_LABELS: Record<string, Record<string, string>> = {
  private_session: {
    FR: "Séance privée",
    EN: "Private session",
    ES: "Sesión privada",
  },
  hospitality_partner: {
    FR: "Hôtel / villa / yacht / conciergerie",
    EN: "Hotel / villa / yacht / concierge",
    ES: "Hotel / villa / yate / conserjería",
  },
  training: {
    FR: "Formation",
    EN: "Training",
    ES: "Formación",
  },
  workshop: {
    FR: "Workshop / atelier",
    EN: "Workshop",
    ES: "Workshop / taller",
  },
  partnership: {
    FR: "Partenariat / collaboration",
    EN: "Partnership / collaboration",
    ES: "Colaboración / alianza",
  },
  other: {
    FR: "Autre demande",
    EN: "Other request",
    ES: "Otra solicitud",
  },
};

export const DEFAULT_WHATSAPP_NUMBER = "33665517735"; // +33 6 65 51 77 35 from copy

export function getWhatsAppUrl(lang: string, firstName: string): string {
  const cleanLang = lang.toUpperCase();
  const phone =
    (cleanLang === "FR"
      ? process.env.NEXT_PUBLIC_WHATSAPP_FR
      : cleanLang === "ES"
      ? process.env.NEXT_PUBLIC_WHATSAPP_ES
      : process.env.NEXT_PUBLIC_WHATSAPP_EN) || DEFAULT_WHATSAPP_NUMBER;

  // Clean phone number: remove non-digits, keep leading '+' if present (wa.me accepts pure digits best)
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  const greeting = firstName ? ` ${firstName}` : "";
  let message = "";

  if (cleanLang === "FR") {
    message = `Bonjour Grégory, je suis${greeting}. Je souhaite échanger concernant une séance privée Méthode TMS®.`;
  } else if (cleanLang === "ES") {
    message = `Hola Grégory, soy${greeting}. Me gustaría hablar sobre una sesión privada de Método TMS®.`;
  } else {
    message = `Hello Grégory, I am${greeting}. I would like to discuss a private Méthode TMS® session.`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getCalendlyUrl(
  type: "training" | "workshop" | "b2b",
  lang: string
): string | null {
  const cleanLang = lang.toUpperCase();

  if (type === "training") {
    if (cleanLang === "FR") return process.env.NEXT_PUBLIC_CALENDLY_TRAINING_FR || null;
    if (cleanLang === "ES") return process.env.NEXT_PUBLIC_CALENDLY_TRAINING_ES || null;
    return process.env.NEXT_PUBLIC_CALENDLY_TRAINING_EN || null;
  }

  if (type === "workshop") {
    if (cleanLang === "FR") return process.env.NEXT_PUBLIC_CALENDLY_WORKSHOP_FR || null;
    if (cleanLang === "ES") return process.env.NEXT_PUBLIC_CALENDLY_WORKSHOP_ES || null;
    return process.env.NEXT_PUBLIC_CALENDLY_WORKSHOP_EN || null;
  }

  if (type === "b2b") {
    if (cleanLang === "FR") return process.env.NEXT_PUBLIC_CALENDLY_B2B_FR || null;
    if (cleanLang === "ES") return process.env.NEXT_PUBLIC_CALENDLY_B2B_ES || null;
    return process.env.NEXT_PUBLIC_CALENDLY_B2B_EN || null;
  }

  return null;
}
