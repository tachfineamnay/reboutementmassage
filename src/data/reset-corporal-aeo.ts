export type QuickQuestion = {
  q: string;
  a: string;
};

// AEO quick questions rendered on /es/reset-corporal-frances-cdmx.
// Shared between the visible section and the JSON-LD FAQPage so both stay in sync.
export const RESET_CORPORAL_AEO_QUESTIONS: QuickQuestion[] = [
  {
    q: "¿Qué es French Body Reset?",
    a: "Es una sesión manual profunda y personalizada creada desde el Método TMS. No es un masaje tradicional: combina lectura corporal, trabajo preciso sobre tensiones y acompañamiento respiratorio para ayudar al cuerpo a sentirse más libre y ligero.",
  },
  {
    q: "¿Es un masaje profundo en CDMX?",
    a: "Puede sentirse más profundo que un masaje convencional, pero el enfoque es diferente: no busca solo relajar, sino trabajar de forma precisa las zonas donde el cuerpo acumula tensión.",
  },
  {
    q: "¿Qué diferencia hay entre Body Reset Fix y Body Reset Full?",
    a: "Body Reset Fix se enfoca en una zona prioritaria. Body Reset Full es una experiencia más completa para espalda, cuello, hombros, pelvis, respiración y tensión global.",
  },
  {
    q: "¿Para quién es adecuado?",
    a: "Para personas con cuerpo cargado, cuello rígido, espalda tensa, estrés acumulado o sensación de bloqueo corporal, siempre que no exista una condición médica que requiera atención profesional previa.",
  },
  {
    q: "¿Cómo reservar en CDMX?",
    a: "La reserva se hace directamente por WhatsApp. Envías tu necesidad, tu disponibilidad y recibes orientación para elegir Body Reset Fix o Body Reset Full.",
  },
];
