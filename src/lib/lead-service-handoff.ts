import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import {
  handleLeadRequest as handleLegacyLeadRequest,
  retryLeadSubmissionGhl as retryLegacyLeadSubmissionGhl,
} from "@/lib/lead-service";
import { prisma } from "@/lib/prisma";

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];
type BufferedKind = "tags" | "notes" | "tasks";

type BufferedRequest = {
  input: FetchInput;
  init: FetchInit;
  kind: BufferedKind;
};

export type GhlHandoffContext = {
  buffered: BufferedRequest[];
  workflowAttempted: boolean;
  workflowSucceeded: boolean;
  workflowError: string | null;
  contactId: string | null;
  eventId: string | null;
  leadId: string | null;
};

type LeadApiBody = {
  ok?: boolean;
  duplicate?: boolean;
  ghlStatus?: "sent" | "partial" | "failed" | "mocked" | "captured";
  warnings?: string[];
  notification?: string;
  [key: string]: unknown;
};

type PreparedRequest = {
  request: Request;
  eventId: string | null;
};

type HandoffGlobal = typeof globalThis & {
  __reboutementGhlHandoffStorage?: AsyncLocalStorage<GhlHandoffContext>;
  __reboutementGhlOriginalFetch?: typeof fetch;
  __reboutementGhlFetchInstalled?: boolean;
};

const globalState = globalThis as HandoffGlobal;
const handoffStorage =
  globalState.__reboutementGhlHandoffStorage ?? new AsyncLocalStorage<GhlHandoffContext>();
const originalFetch = globalState.__reboutementGhlOriginalFetch ?? globalThis.fetch.bind(globalThis);

globalState.__reboutementGhlHandoffStorage = handoffStorage;
globalState.__reboutementGhlOriginalFetch = originalFetch;

export function createGhlHandoffContext(input: {
  eventId?: string | null;
  leadId?: string | null;
} = {}): GhlHandoffContext {
  return {
    buffered: [],
    workflowAttempted: false,
    workflowSucceeded: false,
    workflowError: null,
    contactId: null,
    eventId: input.eventId ?? null,
    leadId: input.leadId ?? null,
  };
}

function requestUrl(input: FetchInput) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function bufferedKind(url: string): BufferedKind | null {
  if (/\/contacts\/[^/]+\/tags(?:\?|$)/.test(url)) return "tags";
  if (/\/contacts\/[^/]+\/notes(?:\?|$)/.test(url)) return "notes";
  if (/\/contacts\/[^/]+\/tasks(?:\?|$)/.test(url)) return "tasks";
  return null;
}

function isWorkflowRequest(url: string) {
  return /\/contacts\/[^/]+\/workflow\/[^/?]+/.test(url);
}

function isContactUpsert(url: string) {
  return /\/contacts\/upsert(?:\?|$)/.test(url);
}

async function responseText(response: Response) {
  try {
    return (await response.clone().text()).slice(0, 1200);
  } catch {
    return "response body unavailable";
  }
}

async function captureContactId(response: Response, context: GhlHandoffContext) {
  try {
    const body = (await response.clone().json()) as {
      id?: string;
      contact?: { id?: string };
    };
    context.contactId = body.contact?.id ?? body.id ?? context.contactId;
  } catch {
    // The legacy service will handle an invalid upsert response.
  }
}

const BUFFER_ORDER: Record<BufferedKind, number> = {
  tags: 0,
  notes: 1,
  tasks: 2,
};

export function createGhlHandoffFetch(
  nativeFetch: typeof fetch,
  storage: AsyncLocalStorage<GhlHandoffContext>
): typeof fetch {
  return async (input: FetchInput, init?: FetchInit) => {
    const context = storage.getStore();
    if (!context) return nativeFetch(input, init);

    const url = requestUrl(input);
    const kind = bufferedKind(url);
    if (kind) {
      context.buffered.push({ input, init, kind });
      return Response.json({ buffered: true });
    }

    if (isContactUpsert(url)) {
      const response = await nativeFetch(input, init);
      await captureContactId(response, context);
      return response;
    }

    if (!isWorkflowRequest(url)) {
      return nativeFetch(input, init);
    }

    context.workflowAttempted = true;

    try {
      const pending = context.buffered
        .splice(0)
        .sort((left, right) => BUFFER_ORDER[left.kind] - BUFFER_ORDER[right.kind]);

      for (const buffered of pending) {
        const response = await nativeFetch(buffered.input, buffered.init);
        if (!response.ok) {
          const detail = await responseText(response);
          context.workflowError = `GHL_BUFFERED_${buffered.kind.toUpperCase()}_FAILED: ${detail}`;
          return new Response(context.workflowError, { status: 502 });
        }
      }

      const workflowResponse = await nativeFetch(input, init);
      context.workflowSucceeded = workflowResponse.ok;
      if (!workflowResponse.ok) {
        context.workflowError = `GHL_WORKFLOW_ENROLLMENT_FAILED: ${await responseText(workflowResponse)}`;
      }
      return workflowResponse;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown error";
      context.workflowSucceeded = false;
      context.workflowError = `GHL_WORKFLOW_ENROLLMENT_FAILED: ${detail}`;
      throw error;
    }
  };
}

if (!globalState.__reboutementGhlFetchInstalled) {
  globalThis.fetch = createGhlHandoffFetch(originalFetch, handoffStorage);
  globalState.__reboutementGhlFetchInstalled = true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function prepareSiteLeadRequest(request: Request): Promise<PreparedRequest> {
  let body: unknown;
  try {
    body = await request.clone().json();
  } catch {
    return { request, eventId: null };
  }

  if (!isRecord(body)) return { request, eventId: null };

  const nextBody: Record<string, unknown> = { ...body };
  const eventId = textValue(nextBody.eventId) ?? randomUUID();
  nextBody.eventId = eventId;

  if (nextBody.formKind === "body_reset_fix" && !textValue(nextBody.destinationId)) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { slug: "cdmx" },
        select: { id: true, defaultOfferId: true },
      });
      if (destination) {
        nextBody.destinationId = destination.id;
        if (!textValue(nextBody.offerId) && destination.defaultOfferId) {
          nextBody.offerId = destination.defaultOfferId;
        }
      }
    } catch (error) {
      console.error("CDMX static routing resolution failed", error);
    }
  }

  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");

  return {
    eventId,
    request: new Request(request.url, {
      method: request.method,
      headers,
      body: JSON.stringify(nextBody),
    }),
  };
}

async function parseLeadResponse(response: Response): Promise<LeadApiBody | null> {
  try {
    const body = await response.clone().json();
    return isRecord(body) ? (body as LeadApiBody) : null;
  } catch {
    return null;
  }
}

async function markWorkflowPartial(
  context: GhlHandoffContext,
  errorMessage: string
): Promise<void> {
  let leadId = context.leadId;
  let contactId = context.contactId;

  if (!leadId && context.eventId) {
    const lead = await prisma.leadSubmission.findUnique({
      where: { eventId: context.eventId },
      select: { id: true, ghlContactId: true },
    });
    leadId = lead?.id ?? null;
    contactId = contactId ?? lead?.ghlContactId ?? null;
  }

  if (!leadId) {
    console.error("Unable to mark workflow handoff partial: lead not found", {
      eventId: context.eventId,
      errorMessage,
    });
    return;
  }

  await prisma.leadSubmission.update({
    where: { id: leadId },
    data: {
      status: "FAILED",
      ghlContactId: contactId,
      errorMessage,
    },
  });
}

function partialResponse(response: Response, body: LeadApiBody, warning: string) {
  return Response.json(
    {
      ...body,
      ok: true,
      ghlStatus: "partial",
      warnings: Array.from(new Set([...(body.warnings ?? []), warning])),
    },
    { status: response.status }
  );
}

async function enforceWorkflowOutcome(
  response: Response,
  context: GhlHandoffContext
): Promise<Response> {
  const body = await parseLeadResponse(response);
  if (!body || body.duplicate || body.ghlStatus !== "sent") {
    context.buffered.length = 0;
    return response;
  }

  if (!context.workflowAttempted) {
    const warning = "GHL_WORKFLOW_NOT_CONFIGURED";
    context.buffered.length = 0;
    await markWorkflowPartial(context, warning);
    return partialResponse(response, body, warning);
  }

  if (!context.workflowSucceeded) {
    const warning = context.workflowError ?? "GHL_WORKFLOW_ENROLLMENT_FAILED";
    context.buffered.length = 0;
    await markWorkflowPartial(context, warning);
    return partialResponse(response, body, warning);
  }

  return response;
}

export async function handleLeadRequestHardened(request: Request) {
  const prepared = await prepareSiteLeadRequest(request);
  const context = createGhlHandoffContext({ eventId: prepared.eventId });

  return handoffStorage.run(context, async () => {
    const response = await handleLegacyLeadRequest(prepared.request);
    return enforceWorkflowOutcome(response, context);
  });
}

export async function retryLeadSubmissionGhlHardened(
  leadId: string
): Promise<{ ok: boolean; error?: string }> {
  const lead = await prisma.leadSubmission.findUnique({
    where: { id: leadId },
    select: { eventId: true, ghlContactId: true },
  });
  const context = createGhlHandoffContext({
    eventId: lead?.eventId ?? null,
    leadId,
  });
  context.contactId = lead?.ghlContactId ?? null;

  return handoffStorage.run(context, async () => {
    const result = await retryLegacyLeadSubmissionGhl(leadId);
    if (!result.ok) {
      context.buffered.length = 0;
      return result;
    }

    if (!context.workflowAttempted) {
      const error = "GHL_WORKFLOW_NOT_CONFIGURED";
      context.buffered.length = 0;
      await markWorkflowPartial(context, error);
      return { ok: false, error };
    }

    if (!context.workflowSucceeded) {
      const error = context.workflowError ?? "GHL_WORKFLOW_ENROLLMENT_FAILED";
      context.buffered.length = 0;
      await markWorkflowPartial(context, error);
      return { ok: false, error };
    }

    return result;
  });
}
