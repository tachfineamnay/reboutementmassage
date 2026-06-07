import type { LeadStatus } from "@prisma/client";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  CAPTURED: "Nouvelle",
  MOCKED: "Test",
  SENT_TO_GHL: "Envoyée GHL",
  FAILED: "Erreur",
  ARCHIVED: "Archivée",
};

export const LEAD_STATUS_CLASSES: Record<LeadStatus, string> = {
  CAPTURED: "badge badge--lead-new",
  MOCKED: "badge badge--draft",
  SENT_TO_GHL: "badge badge--published",
  FAILED: "badge badge--lead-error",
  ARCHIVED: "badge badge--archived",
};

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "CAPTURED",
  "MOCKED",
  "SENT_TO_GHL",
  "FAILED",
  "ARCHIVED",
];

export function isLeadStatus(value: string | undefined): value is LeadStatus {
  return LEAD_STATUS_OPTIONS.includes(value as LeadStatus);
}

export function isEmailContact(contact: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
}

export function normalizePhoneContact(contact: string) {
  const trimmed = contact.trim();
  if (!trimmed) return null;

  const phoneLike = /^[+()\d\s.-]{7,}$/.test(trimmed);
  if (!phoneLike) return null;

  const tel = trimmed.replace(/[^\d+]/g, "");
  const whatsapp = tel.replace(/[^\d]/g, "");
  if (whatsapp.length < 7) return null;

  return { tel, whatsapp };
}

export function formatLeadSlot(lead: {
  selectedDayLabel: string | null;
  selectedTime: string | null;
  timezone: string | null;
}) {
  const parts = [lead.selectedDayLabel, lead.selectedTime].filter(Boolean);
  const label = parts.length > 0 ? parts.join(" · ") : "—";
  return lead.timezone ? `${label} (${lead.timezone})` : label;
}

export function formatSourcePage(pageUrl: string | null) {
  if (!pageUrl) return "—";

  try {
    const url = new URL(pageUrl);
    return url.pathname || pageUrl;
  } catch {
    return pageUrl;
  }
}
