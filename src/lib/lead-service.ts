import "server-only";

import type { Prisma } from "@prisma/client";
import { Resend } from "resend";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type LeadSubmissionStatus = "CAPTURED" | "MOCKED" | "SENT_TO_GHL" | "FAILED" | "ARCHIVED";

type LeadPayload = {
  firstName: string;
  contact: string;
  type: string;
  context: string | null;
  lang: string;
  selectedDayLabel: string | null;
  selectedTime: string | null;
  selectedDateTime: string | null;
  timezone: string | null;
  pageUrl: string | null;
  utm: Record<string, string>;
  branchData: unknown;
  companyName: string | null;
  jobTitle: string | null;
  propertyType: string | null;
  destination: string | null;
  leadSegment: string | null;
  intent: string | null;
  preferredChannel: string | null;
  routedToUrl: string | null;
  urgency: string | null;
  needType: string | null;
  volumePotential: string | null;
  participantCount: string | null;
  currentLocation: string | null;
};

type GhlContactResponse = {
  id?: string;
  contact?: {
    id?: string;
  };
  traceId?: string;
};

type GhlCustomField = {
  id: string;
  name: string;
  fieldKey?: string;
  model?: string;
};

type GhlCustomFieldsResponse = {
  customFields?: GhlCustomField[];
};

type GhlContactCustomField = {
  id: string;
  fieldValue: string;
};

type GhlRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

type NotificationResult =
  | { status: "sent"; resendEmailId: string }
  | { status: "not_configured"; error: "RESEND_NOT_CONFIGURED" }
  | { status: "failed"; error: string };

const DEFAULT_GHL_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_GHL_API_VERSION = "2021-07-28";
const DEFAULT_TAGS = ["source-site-premium", "channel-ghl"];
const DEFAULT_GHL_SOURCE = "Landing Méthode TMS";
const GHL_INTENT_LABELS: Record<string, string> = {
  private_session: "Demande privée Méthode TMS",
  hospitality_partner: "Partenaire hospitality",
  training: "Formation TMS",
  workshop: "Workshop TMS",
  partnership: "Partenariat",
  other: "Demande générale site",
};
const GHL_CUSTOM_FIELD_NAMES = {
  intent: "GT - Intention",
  channel: "GT - Canal",
  segment: "GT - Segment",
  needType: "GT - Besoin principal",
  urgency: "GT - Urgence / période",
  location: "GT - Lieu actuel / destination",
  bookingFormat: "GT - Format choisi",
  duration: "GT - Durée",
  companyName: "GT - Établissement / société",
  jobTitle: "GT - Fonction",
  propertyType: "GT - Type établissement",
  participantCount: "GT - Nombre participants",
} as const;
const ghlCustomFieldCache = new Map<string, Promise<Map<string, string>>>();

const LeadRequestSchema = z
  .object({
    firstName: z.string().trim().min(2).max(120),
    contact: z.string().trim().min(3).max(255),
    type: z.string().trim().min(2).max(255),
    context: z.string().trim().max(4000).optional().nullable(),
    lang: z.string().trim().max(8).optional().default("FR"),
    selectedDayLabel: z.string().trim().max(120).optional().nullable(),
    selectedTime: z.string().trim().min(1).max(20).optional().nullable(),
    selectedDateTime: z
      .string()
      .trim()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Invalid selectedDateTime",
      })
      .optional()
      .nullable(),
    timezone: z.string().trim().max(120).optional().nullable(),
    pageUrl: z.string().trim().max(1000).optional().nullable(),
    utm: z.unknown().optional(),
    branchData: z.unknown().optional(),
    companyName: z.string().trim().max(180).optional().nullable(),
    jobTitle: z.string().trim().max(180).optional().nullable(),
    propertyType: z.string().trim().max(180).optional().nullable(),
    destination: z.string().trim().max(180).optional().nullable(),
    leadSegment: z.string().trim().max(80).optional().nullable(),
    intent: z.string().trim().max(100).optional().nullable(),
    preferredChannel: z.string().trim().max(50).optional().nullable(),
    routedToUrl: z.string().trim().max(1000).optional().nullable(),
    urgency: z.string().trim().max(100).optional().nullable(),
    needType: z.string().trim().max(255).optional().nullable(),
    volumePotential: z.string().trim().max(100).optional().nullable(),
    participantCount: z.string().trim().max(100).optional().nullable(),
    currentLocation: z.string().trim().max(255).optional().nullable(),
  })
  .superRefine((data, context) => {
    const isInternalBooking =
      (data.intent === "training" || data.intent === "workshop") &&
      data.preferredChannel === "internal_booking";

    if (isInternalBooking && !data.selectedDateTime) {
      context.addIssue({
        code: "custom",
        path: ["selectedDateTime"],
        message: "selectedDateTime is required for internal bookings",
      });
    }

    if (isInternalBooking && !data.selectedTime) {
      context.addIssue({
        code: "custom",
        path: ["selectedTime"],
        message: "selectedTime is required for internal bookings",
      });
    }
  });

function jsonError(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableText(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : null;
}

function parseUtm(value: unknown) {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<Record<string, string>>((acc, [key, raw]) => {
    if (typeof raw === "string" && key.toLowerCase().startsWith("utm_")) {
      acc[key] = raw.slice(0, 200);
    }
    return acc;
  }, {});
}

function inferLeadSegment(payload: Omit<LeadPayload, "leadSegment">, explicitSegment: string | null) {
  switch (payload.intent) {
    case "private_session":
    case "training":
      return "b2c_premium";
    case "workshop":
      return payload.companyName || payload.propertyType || payload.destination
        ? "b2b"
        : "b2c_premium";
    case "hospitality_partner":
      return "luxury_hospitality";
    case "partnership":
      return "b2b";
    case "other":
      return null;
    default:
      return explicitSegment;
  }
}

function normalizePayload(raw: unknown): LeadPayload | null {
  const parsed = LeadRequestSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Lead validation failed", parsed.error);
    return null;
  }

  const data = parsed.data;
  const payloadWithoutSegment = {
    firstName: data.firstName,
    contact: data.contact,
    type: data.type,
    context: nullableText(data.context),
    lang: data.lang,
    selectedDayLabel: nullableText(data.selectedDayLabel),
    selectedTime: nullableText(data.selectedTime),
    selectedDateTime: nullableText(data.selectedDateTime),
    timezone: nullableText(data.timezone),
    pageUrl: nullableText(data.pageUrl),
    utm: parseUtm(data.utm),
    branchData: data.branchData ?? {},
    companyName: nullableText(data.companyName),
    jobTitle: nullableText(data.jobTitle),
    propertyType: nullableText(data.propertyType),
    destination: nullableText(data.destination),
    intent: nullableText(data.intent),
    preferredChannel: nullableText(data.preferredChannel) ?? "ghl",
    routedToUrl: nullableText(data.routedToUrl),
    urgency: nullableText(data.urgency),
    needType: nullableText(data.needType),
    volumePotential: nullableText(data.volumePotential),
    participantCount: nullableText(data.participantCount),
    currentLocation: nullableText(data.currentLocation),
  };

  return {
    ...payloadWithoutSegment,
    leadSegment: inferLeadSegment(payloadWithoutSegment, nullableText(data.leadSegment)),
  };
}

function normalizeLocale(lang: string): "FR" | "EN" | "ES" {
  const locale = lang.trim().toUpperCase();
  if (locale === "EN" || locale === "ES") return locale;
  return "FR";
}

function splitContact(contact: string): { email?: string; phone?: string } | null {
  if (contact.includes("@")) {
    const email = contact.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return { email };
  }

  const digits = contact.replace(/\D/g, "");
  if (digits.length < 6) return null;
  return { phone: contact };
}

function slugTag(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function configuredTags(payload: LeadPayload) {
  const envTags = process.env.GHL_DEFAULT_TAGS?.split(",") ?? DEFAULT_TAGS;
  const derivedTags = [
    `type ${payload.type}`,
    payload.lang ? `lang ${payload.lang.toLowerCase()}` : "",
    payload.leadSegment ? `segment ${payload.leadSegment}` : "",
    payload.propertyType ? `property ${payload.propertyType}` : "",
    payload.destination ? `destination ${payload.destination}` : "",
    payload.intent ? `intent ${payload.intent}` : "",
    payload.preferredChannel ? `channel ${payload.preferredChannel}` : "channel ghl",
    payload.preferredChannel === "internal_booking" ? "internal booking" : "",
    "channel ghl",
    "source site premium",
    payload.intent === "hospitality_partner" ? "segment b2b" : "",
    payload.intent === "hospitality_partner" ? "hospitality premium" : "",
    payload.intent === "training" ? "training premium" : "",
    payload.intent === "workshop" ? "workshop premium" : "",
  ];

  return Array.from(
    new Set(
      [...envTags, ...derivedTags]
        .map((tag) => slugTag(tag.trim()))
        .filter(Boolean)
    )
  );
}

async function createLeadSubmission(payload: LeadPayload, tags: string[]) {
  try {
    const lead = await prisma.leadSubmission.create({
      data: {
        firstName: payload.firstName,
        contact: payload.contact,
        type: payload.type,
        context: payload.context,
        locale: normalizeLocale(payload.lang),
        companyName: payload.companyName,
        jobTitle: payload.jobTitle,
        propertyType: payload.propertyType,
        destination: payload.destination,
        leadSegment: payload.leadSegment,
        intent: payload.intent,
        preferredChannel: payload.preferredChannel,
        routedToUrl: payload.routedToUrl,
        urgency: payload.urgency,
        needType: payload.needType,
        volumePotential: payload.volumePotential,
        participantCount: payload.participantCount,
        currentLocation: payload.currentLocation,
        selectedDayLabel: payload.selectedDayLabel,
        selectedTime: payload.selectedTime,
        selectedAt: payload.selectedDateTime ? new Date(payload.selectedDateTime) : null,
        timezone: payload.timezone,
        pageUrl: payload.pageUrl,
        utm: payload.utm,
        branchData: (payload.branchData ?? {}) as Prisma.InputJsonValue,
        tags,
        status: "CAPTURED",
      },
      select: { id: true },
    });

    return lead.id;
  } catch (error) {
    console.error("Lead persistence failed", error);
    return null;
  }
}

async function updateLeadSubmission(
  leadSubmissionId: string | null,
  data: {
    status?: LeadSubmissionStatus;
    ghlContactId?: string | null;
    errorMessage?: string | null;
    resendEmailId?: string | null;
    notificationSentAt?: Date | null;
    notificationError?: string | null;
  }
) {
  if (!leadSubmissionId) return;

  try {
    await prisma.leadSubmission.update({
      where: { id: leadSubmissionId },
      data,
    });
  } catch (error) {
    console.error("Lead status update failed", error);
  }
}

function getLeadMode() {
  const mode = process.env.GHL_LEAD_MODE?.trim().toLowerCase();
  if (mode === "mock" || mode === "live") return mode;
  return process.env.NODE_ENV === "production" ? "live" : "mock";
}

function mockLeadResponse(payload: LeadPayload, tags: string[], notification: NotificationResult) {
  console.info("GHL mock lead submission", {
    firstName: payload.firstName,
    contact: payload.contact,
    type: payload.type,
    lang: payload.lang,
    selectedDateTime: payload.selectedDateTime,
    leadSegment: payload.leadSegment,
    tags,
    notificationStatus: notification.status,
  });

  return Response.json({
    ok: true,
    mode: "mock",
    ghlStatus: "mocked",
    tags,
    notification: notification.status,
  });
}

function makeQualificationLines(payload: LeadPayload) {
  return [
    payload.companyName ? `Entreprise: ${payload.companyName}` : "",
    payload.jobTitle ? `Fonction: ${payload.jobTitle}` : "",
    payload.propertyType ? `Type d'établissement: ${payload.propertyType}` : "",
    payload.destination ? `Destination: ${payload.destination}` : "",
    payload.leadSegment ? `Segment: ${payload.leadSegment}` : "",
  ].filter(Boolean);
}

function getBranchData(payload: LeadPayload) {
  return isRecord(payload.branchData) ? payload.branchData : {};
}

function branchText(branchData: Record<string, unknown>, key: string) {
  const value = branchData[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function branchNumber(branchData: Record<string, unknown>, key: string) {
  const value = branchData[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeCustomFieldName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function getGhlContactCustomFieldIds(
  config: NonNullable<ReturnType<typeof getGhlConfig>>
) {
  const cacheKey = `${config.baseUrl}:${config.locationId}`;
  const cached = ghlCustomFieldCache.get(cacheKey);
  if (cached) return cached;

  const request = ghlFetch<GhlCustomFieldsResponse>(
    config,
    `/locations/${config.locationId}/customFields?model=contact`,
    { method: "GET" }
  )
    .then((response) => {
      const fields = response.customFields ?? [];
      return new Map(
        fields
          .filter((field) => field.id && field.name && field.model !== "opportunity")
          .map((field) => [normalizeCustomFieldName(field.name), field.id])
      );
    })
    .catch((error) => {
      ghlCustomFieldCache.delete(cacheKey);
      throw error;
    });

  ghlCustomFieldCache.set(cacheKey, request);
  return request;
}

async function makeGhlCustomFields(
  config: NonNullable<ReturnType<typeof getGhlConfig>>,
  payload: LeadPayload
): Promise<GhlContactCustomField[]> {
  const branchData = getBranchData(payload);
  const bookingFormat = branchText(branchData, "bookingFormat");
  const durationMinutes = branchNumber(branchData, "durationMinutes");
  const values = new Map<string, string | null>([
    [GHL_CUSTOM_FIELD_NAMES.intent, payload.intent],
    [GHL_CUSTOM_FIELD_NAMES.channel, payload.preferredChannel],
    [GHL_CUSTOM_FIELD_NAMES.segment, payload.leadSegment],
    [GHL_CUSTOM_FIELD_NAMES.needType, payload.needType],
    [GHL_CUSTOM_FIELD_NAMES.urgency, payload.urgency],
    [
      GHL_CUSTOM_FIELD_NAMES.location,
      payload.currentLocation || payload.destination,
    ],
    [GHL_CUSTOM_FIELD_NAMES.bookingFormat, bookingFormat],
    [
      GHL_CUSTOM_FIELD_NAMES.duration,
      durationMinutes === null ? null : `${durationMinutes} min`,
    ],
    [GHL_CUSTOM_FIELD_NAMES.companyName, payload.companyName],
    [GHL_CUSTOM_FIELD_NAMES.jobTitle, payload.jobTitle],
    [GHL_CUSTOM_FIELD_NAMES.propertyType, payload.propertyType],
    [GHL_CUSTOM_FIELD_NAMES.participantCount, payload.participantCount],
  ]);

  let fieldIds: Map<string, string>;
  try {
    fieldIds = await getGhlContactCustomFieldIds(config);
  } catch (error) {
    console.error("GHL custom field lookup failed", error);
    return [];
  }

  const customFields: GhlContactCustomField[] = [];
  const missingFields: string[] = [];

  for (const [name, value] of values) {
    if (!value) continue;

    const id = fieldIds.get(normalizeCustomFieldName(name));
    if (!id) {
      missingFields.push(name);
      continue;
    }

    customFields.push({ id, fieldValue: value });
  }

  if (missingFields.length > 0) {
    console.warn("GHL custom fields not found", { fields: missingFields });
  }

  return customFields;
}

function getTaskTitle(intent: string | null) {
  switch (intent) {
    case "private_session":
      return "Traiter demande privée — Méthode TMS";
    case "hospitality_partner":
      return "Qualifier établissement / partenaire";
    case "training":
      return "Confirmer le créneau — Formation TMS";
    case "workshop":
      return "Confirmer le créneau — Workshop TMS";
    case "partnership":
      return "Analyser demande de partenariat";
    default:
      return "Traiter demande générale site";
  }
}

function getIntentLabel(intent: string | null) {
  if (!intent) return "Demande site Méthode TMS";
  return GHL_INTENT_LABELS[intent] ?? `Demande ${intent}`;
}

function makeNoteBody(payload: LeadPayload) {
  const utm = Object.entries(payload.utm)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const qualification = makeQualificationLines(payload);
  const branchData = getBranchData(payload);
  const bookingFormat = branchText(branchData, "bookingFormat");
  const durationMinutes = branchNumber(branchData, "durationMinutes");

  const lines = [
    "Demande transmise depuis le site Méthode TMS®.",
    "",
    `Prénom: ${payload.firstName}`,
    `Contact: ${payload.contact}`,
    `Type de demande: ${payload.type}`,
    payload.intent ? `Intention: ${payload.intent}` : "",
    payload.preferredChannel ? `Canal préféré: ${payload.preferredChannel}` : "",
    payload.routedToUrl ? `Redirigé vers: ${payload.routedToUrl}` : "",
    bookingFormat ? `Format choisi: ${bookingFormat}` : "",
    durationMinutes ? `Durée: ${durationMinutes} minutes` : "",
    payload.selectedTime
      ? `Créneau souhaité: ${payload.selectedDayLabel ?? "date non précisée"} à ${payload.selectedTime}`
      : "Créneau souhaité: non précisé",
    payload.selectedDateTime ? `Date ISO: ${payload.selectedDateTime}` : "",
    `Langue: ${payload.lang || "non précisée"}`,
    `Fuseau horaire: ${payload.timezone || "non précisé"}`,
  ];

  const specificLines: string[] = [];
  const trainingProfile = branchText(branchData, "trainingProfile");
  const trainingLevel = branchText(branchData, "trainingLevel");
  const trainingGoal = branchText(branchData, "trainingGoal");
  const targetLang = branchText(branchData, "targetLang");
  const workshopType = branchText(branchData, "workshopType");
  const periodPreference = branchText(branchData, "periodPreference");

  if (trainingProfile) specificLines.push(`Profil formation: ${trainingProfile}`);
  if (trainingLevel) specificLines.push(`Niveau formation: ${trainingLevel}`);
  if (trainingGoal) specificLines.push(`Objectif formation: ${trainingGoal}`);
  if (targetLang) specificLines.push(`Langue de formation: ${targetLang}`);
  if (workshopType) specificLines.push(`Type workshop: ${workshopType}`);
  if (periodPreference) specificLines.push(`Période souhaitée: ${periodPreference}`);
  if (payload.currentLocation) specificLines.push(`Lieu actuel / Destination: ${payload.currentLocation}`);
  if (payload.urgency) specificLines.push(`Urgence: ${payload.urgency}`);
  if (payload.needType) specificLines.push(`Besoin principal: ${payload.needType}`);
  if (payload.volumePotential) specificLines.push(`Volume potentiel B2B: ${payload.volumePotential}`);
  if (payload.participantCount) specificLines.push(`Nombre de participants: ${payload.participantCount}`);

  if (specificLines.length > 0) {
    lines.push("", "Qualification spécifique:", ...specificLines);
  }

  if (qualification.length > 0) {
    lines.push("", "Qualification B2B standard:", ...qualification);
  }

  lines.push(
    "",
    "Contexte:",
    payload.context || "Non précisé.",
    "",
    `Page: ${payload.pageUrl || "non précisée"}`
  );

  if (utm) lines.push("", "UTM:", utm);

  return lines.join("\n");
}

function getGhlConfig() {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) return null;

  return {
    token,
    locationId,
    baseUrl: (process.env.GHL_BASE_URL || DEFAULT_GHL_BASE_URL).replace(/\/+$/, ""),
    version: process.env.GHL_API_VERSION || DEFAULT_GHL_API_VERSION,
    assignedUserId: process.env.GHL_ASSIGNED_USER_ID,
    pipelineId: process.env.GHL_PIPELINE_ID,
    pipelineStageId: process.env.GHL_PIPELINE_STAGE_ID,
    workflowId: process.env.GHL_WORKFLOW_ID,
    source: process.env.GHL_SOURCE || DEFAULT_GHL_SOURCE,
  };
}

async function ghlFetch<T>(
  config: NonNullable<ReturnType<typeof getGhlConfig>>,
  path: string,
  options: GhlRequestOptions = {}
) {
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: options.method ?? "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      Version: config.version,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    data = { raw: text } as T;
  }

  if (!response.ok) {
    throw new Error(`GHL ${response.status} ${path}: ${text}`);
  }

  return data;
}

async function optionalGhlStep(label: string, run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    console.error(`Optional GHL step failed: ${label}`, error);
  }
}

function getLeadNotificationConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  const to = process.env.LEAD_NOTIFICATION_TO?.split(",").map((value) => value.trim()).filter(Boolean);
  const bcc = process.env.LEAD_NOTIFICATION_BCC?.split(",").map((value) => value.trim()).filter(Boolean);

  if (!apiKey || !from || !to || to.length === 0) return null;

  return {
    apiKey,
    from,
    to,
    bcc,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatHtmlLines(lines: string[]) {
  return lines
    .map((line) => {
      if (!line) return "<br />";
      const [label, ...rest] = line.split(":");
      if (rest.length === 0) return `<p>${escapeHtml(line)}</p>`;
      return `<p><strong>${escapeHtml(label)}:</strong>${escapeHtml(rest.join(":"))}</p>`;
    })
    .join("\n");
}

async function sendLeadNotification(payload: LeadPayload, tags: string[]): Promise<NotificationResult> {
  const config = getLeadNotificationConfig();
  if (!config) return { status: "not_configured", error: "RESEND_NOT_CONFIGURED" };

  const resend = new Resend(config.apiKey);
  const subjectPrefix = payload.leadSegment === "luxury_hospitality" ? "Lead B2B Hospitality" : "Lead TMS";
  const subject = `${subjectPrefix} - ${payload.firstName} - ${payload.type}`.slice(0, 180);
  const noteBody = makeNoteBody(payload);
  const text = [noteBody, "", `Tags: ${tags.join(", ")}`].join("\n");
  const html = [
    "<h2>Nouvelle demande Méthode TMS</h2>",
    formatHtmlLines(noteBody.split("\n")),
    `<p><strong>Tags:</strong> ${escapeHtml(tags.join(", "))}</p>`,
  ].join("\n");
  const replyTo = payload.contact.includes("@") ? payload.contact.toLowerCase() : undefined;

  try {
    const { data, error } = await resend.emails.send({
      from: config.from,
      to: config.to,
      ...(config.bcc && config.bcc.length > 0 ? { bcc: config.bcc } : {}),
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
      html,
    });

    if (error) {
      return { status: "failed", error: error.message || "RESEND_SEND_FAILED" };
    }

    return { status: "sent", resendEmailId: data?.id ?? "" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message.slice(0, 4000) : "RESEND_SEND_FAILED",
    };
  }
}

async function persistNotificationResult(leadSubmissionId: string | null, notification: NotificationResult) {
  if (notification.status === "sent") {
    await updateLeadSubmission(leadSubmissionId, {
      resendEmailId: notification.resendEmailId || null,
      notificationSentAt: new Date(),
      notificationError: null,
    });
    return;
  }

  await updateLeadSubmission(leadSubmissionId, {
    notificationError: notification.error,
  });
}

export async function handleLeadRequest(request: Request) {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON");
  }

  const payload = normalizePayload(raw);
  if (!payload) return jsonError(400, "INVALID_LEAD");

  const parsedContact = splitContact(payload.contact);
  if (!parsedContact) return jsonError(400, "INVALID_CONTACT");

  const tags = configuredTags(payload);
  const leadSubmissionId = await createLeadSubmission(payload, tags);
  if (!leadSubmissionId) return jsonError(500, "LEAD_PERSISTENCE_FAILED");

  const notification = await sendLeadNotification(payload, tags);
  await persistNotificationResult(leadSubmissionId, notification);

  if (getLeadMode() === "mock") {
    await updateLeadSubmission(leadSubmissionId, { status: "MOCKED" });
    return mockLeadResponse(payload, tags, notification);
  }

  const config = getGhlConfig();
  if (!config) {
    console.error("Missing required GHL environment variables.");
    await updateLeadSubmission(leadSubmissionId, {
      status: "FAILED",
      errorMessage: "GHL_NOT_CONFIGURED",
    });
    return Response.json({
      ok: true,
      ghlStatus: "failed",
      notification: notification.status,
    });
  }

  try {
    const customFields = await makeGhlCustomFields(config, payload);
    const contactResponse = await ghlFetch<GhlContactResponse>(config, "/contacts/upsert", {
      body: {
        locationId: config.locationId,
        firstName: payload.firstName,
        name: payload.firstName,
        ...parsedContact,
        source: config.source,
        ...(customFields.length > 0 ? { customFields } : {}),
        ...(config.assignedUserId ? { assignedTo: config.assignedUserId } : {}),
      },
    });

    const contactId = contactResponse.contact?.id ?? contactResponse.id;
    if (!contactId) {
      throw new Error(`GHL upsert did not return a contact id: ${contactResponse.traceId ?? "no traceId"}`);
    }

    const noteBody = makeNoteBody(payload);
    const branchData = getBranchData(payload);
    const bookingFormat = branchText(branchData, "bookingFormat");
    const durationMinutes = branchNumber(branchData, "durationMinutes");
    const taskBody = [
      payload.selectedTime
        ? `Créneau demandé: ${payload.selectedDayLabel ?? "date non précisée"} à ${payload.selectedTime}`
        : "Créneau demandé: non précisé",
      payload.timezone ? `Fuseau horaire: ${payload.timezone}` : "",
      bookingFormat ? `Format: ${bookingFormat}` : "",
      durationMinutes ? `Durée: ${durationMinutes} minutes` : "",
      `Type: ${payload.type}`,
      payload.intent ? `Intention: ${payload.intent}` : "",
      `Contact: ${payload.contact}`,
      payload.companyName ? `Entreprise: ${payload.companyName}` : "",
      payload.leadSegment ? `Segment: ${payload.leadSegment}` : "",
      payload.destination ? `Destination: ${payload.destination}` : "",
      payload.context ? `Contexte:\n${payload.context}` : "",
    ].filter(Boolean).join("\n");
    const taskTitle = getTaskTitle(payload.intent);

    await ghlFetch(config, `/contacts/${contactId}/tags`, {
      body: { tags },
    });

    await ghlFetch(config, `/contacts/${contactId}/notes`, {
      body: {
        title: `${getIntentLabel(payload.intent)} — Méthode TMS®`,
        body: noteBody,
        pinned: false,
      },
    });

    const createTask = () =>
      ghlFetch(config, `/contacts/${contactId}/tasks`, {
        body: {
          title: taskTitle,
          body: taskBody,
          ...(payload.selectedDateTime ? { dueDate: payload.selectedDateTime } : {}),
          completed: false,
          ...(config.assignedUserId ? { assignedTo: config.assignedUserId } : {}),
        },
      });

    await createTask();

    if (config.pipelineId && config.pipelineStageId) {
      await optionalGhlStep("create opportunity", () =>
        ghlFetch(config, "/opportunities/", {
          body: {
            pipelineId: config.pipelineId,
            pipelineStageId: config.pipelineStageId,
            locationId: config.locationId,
            name: `${getIntentLabel(payload.intent)} - ${payload.firstName}`,
            status: "open",
            contactId,
            ...(config.assignedUserId ? { assignedTo: config.assignedUserId } : {}),
          },
        })
      );
    }

    if (config.workflowId) {
      await optionalGhlStep("add contact to workflow", () =>
        ghlFetch(config, `/contacts/${contactId}/workflow/${config.workflowId}`, {
          body: payload.selectedDateTime
            ? { eventStartTime: payload.selectedDateTime }
            : {},
        })
      );
    }

    await updateLeadSubmission(leadSubmissionId, {
      status: "SENT_TO_GHL",
      ghlContactId: contactId,
      errorMessage: null,
    });

    return Response.json({
      ok: true,
      ghlStatus: "sent",
      notification: notification.status,
    });
  } catch (error) {
    console.error("GHL lead submission failed", error);
    await updateLeadSubmission(leadSubmissionId, {
      status: "FAILED",
      errorMessage: error instanceof Error ? error.message.slice(0, 4000) : "GHL_SUBMISSION_FAILED",
    });
    return Response.json({
      ok: true,
      ghlStatus: "failed",
      notification: notification.status,
    });
  }
}
