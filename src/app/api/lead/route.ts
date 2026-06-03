type LeadPayload = {
  firstName: string;
  contact: string;
  type: string;
  context: string;
  lang: string;
  selectedDayLabel: string;
  selectedTime: string;
  selectedDateTime: string;
  timezone: string;
  pageUrl: string;
  utm: Record<string, string>;
};

type GhlContactResponse = {
  id?: string;
  contact?: {
    id?: string;
  };
  traceId?: string;
};

type GhlRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

const DEFAULT_GHL_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_GHL_API_VERSION = "2021-07-28";
const DEFAULT_TAGS = ["landing-tms", "demande-privee", "source-landing-page"];
const DEFAULT_GHL_SOURCE = "Landing Méthode TMS";

function jsonError(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function normalizePayload(raw: unknown): LeadPayload | null {
  if (!isRecord(raw)) return null;

  const payload = {
    firstName: stringValue(raw.firstName),
    contact: stringValue(raw.contact),
    type: stringValue(raw.type),
    context: stringValue(raw.context).slice(0, 4000),
    lang: stringValue(raw.lang).slice(0, 8),
    selectedDayLabel: stringValue(raw.selectedDayLabel),
    selectedTime: stringValue(raw.selectedTime),
    selectedDateTime: stringValue(raw.selectedDateTime),
    timezone: stringValue(raw.timezone),
    pageUrl: stringValue(raw.pageUrl).slice(0, 1000),
    utm: parseUtm(raw.utm),
  };

  if (
    payload.firstName.length < 2 ||
    payload.contact.length < 3 ||
    payload.type.length < 2 ||
    !payload.selectedTime ||
    !payload.selectedDateTime ||
    Number.isNaN(Date.parse(payload.selectedDateTime))
  ) {
    return null;
  }

  return payload;
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
  const requestTag = slugTag(`type ${payload.type}`);
  const languageTag = payload.lang ? slugTag(`lang ${payload.lang.toLowerCase()}`) : "";

  return Array.from(
    new Set(
      [...envTags, requestTag, languageTag]
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function getLeadMode() {
  const mode = process.env.GHL_LEAD_MODE?.trim().toLowerCase();
  if (mode === "mock" || mode === "live") return mode;
  return process.env.NODE_ENV === "production" ? "live" : "mock";
}

function mockLeadResponse(payload: LeadPayload, tags: string[]) {
  console.info("GHL mock lead submission", {
    firstName: payload.firstName,
    contact: payload.contact,
    type: payload.type,
    lang: payload.lang,
    selectedDateTime: payload.selectedDateTime,
    tags,
  });

  return Response.json({ ok: true, mode: "mock", tags });
}

function makeNoteBody(payload: LeadPayload) {
  const utm = Object.entries(payload.utm)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const lines = [
    "Demande privée transmise depuis la landing Méthode TMS®.",
    "",
    `Prénom: ${payload.firstName}`,
    `Contact: ${payload.contact}`,
    `Type de demande: ${payload.type}`,
    `Créneau souhaité: ${payload.selectedDayLabel} à ${payload.selectedTime}`,
    `Date ISO: ${payload.selectedDateTime}`,
    `Langue: ${payload.lang || "non précisée"}`,
    `Fuseau horaire: ${payload.timezone || "non précisé"}`,
    "",
    "Contexte:",
    payload.context || "Non précisé.",
    "",
    `Page: ${payload.pageUrl || "non précisée"}`,
  ];

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

async function optionalGhlStep(
  label: string,
  run: () => Promise<unknown>
) {
  try {
    await run();
  } catch (error) {
    console.error(`Optional GHL step failed: ${label}`, error);
  }
}

export async function POST(request: Request) {
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
  if (getLeadMode() === "mock") return mockLeadResponse(payload, tags);

  const config = getGhlConfig();
  if (!config) {
    console.error("Missing required GHL environment variables.");
    return jsonError(500, "GHL_NOT_CONFIGURED");
  }

  try {
    const contactResponse = await ghlFetch<GhlContactResponse>(config, "/contacts/upsert", {
      body: {
        locationId: config.locationId,
        firstName: payload.firstName,
        name: payload.firstName,
        ...parsedContact,
        source: config.source,
        ...(config.assignedUserId ? { assignedTo: config.assignedUserId } : {}),
      },
    });

    const contactId = contactResponse.contact?.id ?? contactResponse.id;
    if (!contactId) throw new Error(`GHL upsert did not return a contact id: ${contactResponse.traceId ?? "no traceId"}`);

    const noteBody = makeNoteBody(payload);
    const taskBody = [
      `Contact souhaité: ${payload.selectedDayLabel} à ${payload.selectedTime}`,
      `Type: ${payload.type}`,
      `Contact: ${payload.contact}`,
    ].join("\n");

    await ghlFetch(config, `/contacts/${contactId}/tags`, {
      body: { tags },
    });

    await ghlFetch(config, `/contacts/${contactId}/notes`, {
      body: {
        title: "Demande privée - Méthode TMS®",
        body: noteBody,
        pinned: false,
      },
    });

    await ghlFetch(config, `/contacts/${contactId}/tasks`, {
      body: {
        title: "Rappeler - demande privée TMS",
        body: taskBody,
        dueDate: payload.selectedDateTime,
        completed: false,
        ...(config.assignedUserId ? { assignedTo: config.assignedUserId } : {}),
      },
    });

    if (config.pipelineId && config.pipelineStageId) {
      await optionalGhlStep("create opportunity", () =>
        ghlFetch(config, "/opportunities/", {
          body: {
            pipelineId: config.pipelineId,
            pipelineStageId: config.pipelineStageId,
            locationId: config.locationId,
            name: `Demande privée TMS - ${payload.firstName}`,
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
          body: { eventStartTime: payload.selectedDateTime },
        })
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("GHL lead submission failed", error);
    return jsonError(502, "GHL_SUBMISSION_FAILED");
  }
}
