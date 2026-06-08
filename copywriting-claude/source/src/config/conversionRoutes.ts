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
