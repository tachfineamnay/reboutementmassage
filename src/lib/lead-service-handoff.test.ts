import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  destination: {
    findUnique: vi.fn(),
  },
  leadSubmission: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

const legacyMock = vi.hoisted(() => ({
  handleLeadRequest: vi.fn(),
  retryLeadSubmissionGhl: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/lead-service", () => ({
  handleLeadRequest: legacyMock.handleLeadRequest,
  retryLeadSubmissionGhl: legacyMock.retryLeadSubmissionGhl,
}));

import {
  createGhlHandoffContext,
  createGhlHandoffFetch,
  handleLeadRequestHardened,
  prepareSiteLeadRequest,
  retryLeadSubmissionGhlHardened,
  type GhlHandoffContext,
} from "@/lib/lead-service-handoff";

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.destination.findUnique.mockResolvedValue(null);
  prismaMock.leadSubmission.findUnique.mockResolvedValue({
    id: "lead_1",
    eventId: "evt_1",
    ghlContactId: "contact_1",
  });
  prismaMock.leadSubmission.update.mockResolvedValue({});
  legacyMock.handleLeadRequest.mockResolvedValue(
    Response.json({ ok: true, ghlStatus: "sent", warnings: [] })
  );
  legacyMock.retryLeadSubmissionGhl.mockResolvedValue({ ok: true });
});

describe("GHL mandatory handoff guard", () => {
  it("resolves the static CDMX destination without a dynamic ES landing", async () => {
    prismaMock.destination.findUnique.mockResolvedValue({
      id: "destination_cdmx",
      defaultOfferId: "offer_cdmx",
    });

    const prepared = await prepareSiteLeadRequest(
      new Request("https://example.com/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          formKind: "body_reset_fix",
          firstName: "Ana",
          eventId: "evt_cdmx",
        }),
      })
    );
    const body = await prepared.request.json();

    expect(prismaMock.destination.findUnique).toHaveBeenCalledWith({
      where: { slug: "cdmx" },
      select: { id: true, defaultOfferId: true },
    });
    expect(body).toEqual(
      expect.objectContaining({
        eventId: "evt_cdmx",
        destinationId: "destination_cdmx",
        offerId: "offer_cdmx",
      })
    );
  });

  it("buffers CRM side effects and flushes tags, note, task, then workflow", async () => {
    const calls: string[] = [];
    const nativeFetch = vi.fn(async (input: Parameters<typeof fetch>[0]) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      calls.push(url);
      return Response.json({ ok: true });
    }) as unknown as typeof fetch;
    const storage = new AsyncLocalStorage<GhlHandoffContext>();
    const guardedFetch = createGhlHandoffFetch(nativeFetch, storage);
    const context = createGhlHandoffContext({ eventId: "evt_order" });

    await storage.run(context, async () => {
      await guardedFetch("https://services.leadconnectorhq.com/contacts/contact_1/tasks", {
        method: "POST",
      });
      await guardedFetch("https://services.leadconnectorhq.com/contacts/contact_1/notes", {
        method: "POST",
      });
      await guardedFetch("https://services.leadconnectorhq.com/contacts/contact_1/tags", {
        method: "POST",
      });

      expect(nativeFetch).not.toHaveBeenCalled();

      const response = await guardedFetch(
        "https://services.leadconnectorhq.com/contacts/contact_1/workflow/workflow_1",
        { method: "POST" }
      );
      expect(response.ok).toBe(true);
    });

    expect(calls).toEqual([
      "https://services.leadconnectorhq.com/contacts/contact_1/tags",
      "https://services.leadconnectorhq.com/contacts/contact_1/notes",
      "https://services.leadconnectorhq.com/contacts/contact_1/tasks",
      "https://services.leadconnectorhq.com/contacts/contact_1/workflow/workflow_1",
    ]);
    expect(context.workflowAttempted).toBe(true);
    expect(context.workflowSucceeded).toBe(true);
    expect(context.buffered).toHaveLength(0);
  });

  it("records a failed mandatory workflow response", async () => {
    const nativeFetch = vi.fn(async (input: Parameters<typeof fetch>[0]) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/workflow/")) {
        return new Response("workflow unavailable", { status: 503 });
      }
      return Response.json({ ok: true });
    }) as unknown as typeof fetch;
    const storage = new AsyncLocalStorage<GhlHandoffContext>();
    const guardedFetch = createGhlHandoffFetch(nativeFetch, storage);
    const context = createGhlHandoffContext({ eventId: "evt_failure" });

    await storage.run(context, async () => {
      await guardedFetch("https://services.leadconnectorhq.com/contacts/contact_1/tags", {
        method: "POST",
      });
      const response = await guardedFetch(
        "https://services.leadconnectorhq.com/contacts/contact_1/workflow/workflow_1",
        { method: "POST" }
      );
      expect(response.status).toBe(503);
    });

    expect(context.workflowAttempted).toBe(true);
    expect(context.workflowSucceeded).toBe(false);
    expect(context.workflowError).toContain("GHL_WORKFLOW_ENROLLMENT_FAILED");
  });

  it("changes a false sent result into partial when no workflow was attempted", async () => {
    const response = await handleLeadRequestHardened(
      new Request("https://example.com/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Ana",
          contact: "ana@example.com",
          type: "Training",
          intent: "training",
          eventId: "evt_no_workflow",
        }),
      })
    );
    const body = await response.json();

    expect(body.ghlStatus).toBe("partial");
    expect(body.warnings).toContain("GHL_WORKFLOW_NOT_CONFIGURED");
    expect(prismaMock.leadSubmission.update).toHaveBeenCalledWith({
      where: { id: "lead_1" },
      data: {
        status: "FAILED",
        ghlContactId: "contact_1",
        errorMessage: "GHL_WORKFLOW_NOT_CONFIGURED",
      },
    });
  });

  it("applies the same mandatory workflow contract to admin retries", async () => {
    const result = await retryLeadSubmissionGhlHardened("lead_1");

    expect(result).toEqual({ ok: false, error: "GHL_WORKFLOW_NOT_CONFIGURED" });
    expect(prismaMock.leadSubmission.update).toHaveBeenCalledWith({
      where: { id: "lead_1" },
      data: {
        status: "FAILED",
        ghlContactId: "contact_1",
        errorMessage: "GHL_WORKFLOW_NOT_CONFIGURED",
      },
    });
  });

  it("keeps the hardened boundary active for public submissions and admin retries", () => {
    const route = readFileSync("src/app/api/lead/route.ts", "utf8");
    const actions = readFileSync("src/app/(admin)/admin/demandes/actions.ts", "utf8");

    expect(route).toContain("handleLeadRequestHardened");
    expect(route).not.toContain("handleLeadRequest(request)");
    expect(actions).toContain("retryLeadSubmissionGhlHardened");
  });
});
