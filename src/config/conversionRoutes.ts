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

function getWhatsAppNumber(lang: string) {
  const cleanLang = lang.toUpperCase();
  const phone =
    (cleanLang === "FR"
      ? process.env.NEXT_PUBLIC_WHATSAPP_FR
      : cleanLang === "ES"
      ? process.env.NEXT_PUBLIC_WHATSAPP_ES
      : process.env.NEXT_PUBLIC_WHATSAPP_EN) || DEFAULT_WHATSAPP_NUMBER;

  return phone.replace(/[^\d]/g, "");
}

export function getWhatsAppUrl(lang: string, firstName: string): string {
  const cleanLang = lang.toUpperCase();
  const greeting = firstName ? ` ${firstName}` : "";
  let message = "";

  if (cleanLang === "FR") {
    message = `Bonjour Grégory, je suis${greeting}. Je souhaite échanger concernant une séance privée Méthode TMS®.`;
  } else if (cleanLang === "ES") {
    message = `Hola Grégory, soy${greeting}. Me gustaría hablar sobre una sesión privada de Método TMS®.`;
  } else {
    message = `Hello Grégory, I am${greeting}. I would like to discuss a private Méthode TMS® session.`;
  }

  return `https://wa.me/${getWhatsAppNumber(lang)}?text=${encodeURIComponent(message)}`;
}

export function getBookingWhatsAppUrl(
  lang: string,
  firstName: string,
  intent: "training" | "workshop",
  dayLabel: string,
  time: string,
  timezone: string
) {
  const cleanLang = lang.toUpperCase();
  const requestType =
    intent === "training"
      ? cleanLang === "FR"
        ? "formation"
        : cleanLang === "ES"
          ? "formación"
          : "training"
      : "workshop";
  const message =
    cleanLang === "FR"
      ? `Bonjour Grégory, je suis ${firstName}. Ma demande de créneau ${requestType} a été transmise pour le ${dayLabel} à ${time} (${timezone}).`
      : cleanLang === "ES"
        ? `Hola Grégory, soy ${firstName}. Mi solicitud de horario para ${requestType} fue enviada para el ${dayLabel} a las ${time} (${timezone}).`
        : `Hello Grégory, I am ${firstName}. My ${requestType} time request was submitted for ${dayLabel} at ${time} (${timezone}).`;

  return `https://wa.me/${getWhatsAppNumber(lang)}?text=${encodeURIComponent(message)}`;
}

export function getCalendlyUrl(
  type: "b2b",
  lang: string
): string | null {
  const cleanLang = lang.toUpperCase();

  if (type === "b2b") {
    if (cleanLang === "FR") return process.env.NEXT_PUBLIC_CALENDLY_B2B_FR || null;
    if (cleanLang === "ES") return process.env.NEXT_PUBLIC_CALENDLY_B2B_ES || null;
    return process.env.NEXT_PUBLIC_CALENDLY_B2B_EN || null;
  }

  return null;
}
