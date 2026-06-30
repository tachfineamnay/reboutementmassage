import type { Locale, WhatsappChannel } from "@prisma/client";

export type WhatsappIntent =
  | "default"
  | "book_intent"
  | "more_info_intent"
  | "testimonial_cta"
  | "sticky_cta";

const INTENT_SUFFIX: Record<WhatsappIntent, Record<Locale, string>> = {
  default: { FR: "", EN: "", ES: "" },
  book_intent: {
    FR: " Je souhaite réserver une séance.",
    EN: " I would like to book a session.",
    ES: " Quiero reservar una sesión.",
  },
  more_info_intent: {
    FR: " J'aimerais plus d'informations.",
    EN: " I would like more information.",
    ES: " Me gustaría más información.",
  },
  testimonial_cta: {
    FR: " J'ai vu le témoignage et j'aimerais savoir si une séance est adaptée.",
    EN: " I watched the testimonial and would like to know if a session is right for me.",
    ES: " Vi el testimonio y quiero saber si una sesión es adecuada.",
  },
  sticky_cta: { FR: "", EN: "", ES: "" },
};

export function getPrefilledMessage(channel: WhatsappChannel, locale: Locale): string {
  if (locale === "EN") return channel.prefilledMessageEn;
  if (locale === "ES") return channel.prefilledMessageEs;
  return channel.prefilledMessageFr;
}

export function buildWhatsappMessage(
  channel: WhatsappChannel,
  locale: Locale,
  intent: WhatsappIntent = "default",
  context?: { city?: string }
): string {
  let message = getPrefilledMessage(channel, locale);
  if (context?.city) {
    message = message.replace(/\{city\}/gi, context.city);
  }
  message += INTENT_SUFFIX[intent][locale] ?? "";
  return message.trim();
}

export function generateWhatsappUrl(
  channel: WhatsappChannel,
  locale: Locale,
  intent: WhatsappIntent = "default",
  context?: { city?: string }
): string {
  const phone = channel.phoneE164.replace(/\D/g, "");
  const text = buildWhatsappMessage(channel, locale, intent, context);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function isWhatsappChannelActive(channel: WhatsappChannel | null | undefined): boolean {
  return channel?.status === "ACTIVE";
}

export function isValidE164(phone: string): boolean {
  return /^\+?[1-9]\d{6,14}$/.test(phone.replace(/\s/g, ""));
}
