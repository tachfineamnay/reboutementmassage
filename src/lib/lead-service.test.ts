import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  leadSubmission: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  landingPage: {
    findFirst: vi.fn(),
  },
  crmRoutingRule: {
    findMany: vi.fn(),
  },
  offer: {
    findUnique: vi.fn(),
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/growth/landing-metrics", () => ({
  incrementLandingLeadMetric: vi.fn(),
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: vi.fn().mockResolvedValue({ data: { id: "email_1" }, error: null }),
    };
  },
}));

import { handleLeadRequest } from "@/lib/lead-service";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    body: JSON.stringify({
      firstName: "Ana",
      contact: "+52 56 3300 3042",
      type: "Training",
      lang: "FR",
      intent: "training",
      preferredChannel: "ghl",
      context: "Je veux me former.",
      eventId: "evt_1",
      ...body,
    }),
  });
}

function liveGhlEnv() {
  process.env.GHL_LEAD_MODE = "live";
  process.env.GHL_PRIVATE_INTEGRATION_TOKEN = "token";
  process.env.GHL_LOCATION_ID = "loc_1";
  process.env.GHL_BASE_URL = "https://services.leadconnectorhq.com";
  process.env.GHL_WORKFLOW_ID = "workflow_1";
  process.env.GHL_PIPELINE_ID = "pipeline_1";
  process.env.GHL_PIPELINE_STAGE_ID = "stage_1";
  process.env.GHL_DEFAULT_TAGS = "source-site-premium,channel-ghl,intent_training";
}

function mockSuccessfulFetch() {
  return vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    void init;
    const href = String(url);
    if (href.includes("/contacts/upsert")) {
      return Response.json({ contact: { id: "contact_1" } });
    }
    if (href.includes("/customFields")) {
      return Response.json({
        customFields: [
          { id: "field_intention", name: "Intention", model: "contact" },
          { id: "field_language", name: "Form Language", model: "contact" },
        ],
      });
    }
    return Response.json({});
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.useRealTimers();
  liveGhlEnv();
  prismaMock.leadSubmission.findFirst.mockResolvedValue(null);
  prismaMock.leadSubmission.create.mockResolvedValue({
    id: "lead_1",
    status: "CAPTURED",
    ghlContactId: null,
  });
  prismaMock.leadSubmission.update.mockResolvedValue({});
  prismaMock.crmRoutingRule.findMany.mockResolvedValue([]);
  prismaMock.offer.findUnique.mockResolvedValue(null);
  prismaMock.landingPage.findFirst.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GHL_LEAD_MODE;
  delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.GHL_BASE_URL;
  delete process.env.GHL_WORKFLOW_ID;
  delete process.env.GHL_PIPELINE_ID;
  delete process.env.GHL_PIPELINE_STAGE_ID;
  delete process.env.GHL_DEFAULT_TAGS;
  delete process.env.GHL_TIMEOUT_MS;
});

describe("handleLeadRequest GHL contract", () => {
  it("keeps canonical tags and never produces dashed intent tags", async () => {
    const fetchMock = mockSuccessfulFetch();
    vi.stubGlobal("fetch", fetchMock);

    await handleLeadRequest(makeRequest({}));

    const tagCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/tags"));
    expect(tagCall).toBeDefined();
    const body = JSON.parse((tagCall?.[1] as RequestInit).body as string);
    expect(body.tags).toContain("source-site-premium");
    expect(body.tags).toContain("intent_training");
    expect(body.tags).not.toContain("intent-training");
  });

  it("does not create direct opportunities for source-site-premium leads", async () => {
    const fetchMock = mockSuccessfulFetch();
    vi.stubGlobal("fetch", fetchMock);

    await handleLeadRequest(makeRequest({}));

    expect(fetchMock.mock.calls.map(([url]) => String(url)).join("\n")).not.toContain("/opportunities/");
  });

  it("preserves legacy direct opportunity behavior for non-site tags", async () => {
    process.env.GHL_DEFAULT_TAGS = "legacy-import";
    const fetchMock = mockSuccessfulFetch();
    vi.stubGlobal("fetch", fetchMock);

    await handleLeadRequest(makeRequest({ eventId: "evt_legacy" }));

    expect(fetchMock.mock.calls.map(([url]) => String(url)).join("\n")).toContain("/opportunities/");
  });

  it("reuses duplicate eventId submissions", async () => {
    const fetchMock = mockSuccessfulFetch();
    vi.stubGlobal("fetch", fetchMock);
    prismaMock.leadSubmission.findFirst.mockResolvedValue({
      id: "lead_existing",
      status: "SENT_TO_GHL",
      ghlContactId: "contact_existing",
    });

    const response = await handleLeadRequest(makeRequest({}));
    const body = await response.json();

    expect(body.duplicate).toBe(true);
    expect(prismaMock.leadSubmission.create).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("warns when a GHL field is missing", async () => {
    process.env.GHL_BASE_URL = "https://missing-fields.example";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url).includes("/contacts/upsert")) {
        return Response.json({ contact: { id: "contact_1" } });
      }
      return Response.json({ customFields: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleLeadRequest(makeRequest({ eventId: "evt_missing_field" }));

    expect(warn).toHaveBeenCalledWith(
      "GHL custom fields not found",
      expect.objectContaining({ fields: expect.arrayContaining(["Intention"]) })
    );
  });

  it("records timeout failures without marking GHL as sent", async () => {
    process.env.GHL_BASE_URL = "https://timeout.example";
    process.env.GHL_TIMEOUT_MS = "1";
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        })
      )
    );

    const response = await handleLeadRequest(makeRequest({ eventId: "evt_timeout" }));
    const body = await response.json();

    expect(body.ghlStatus).toBe("failed");
    expect(prismaMock.leadSubmission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "FAILED",
          errorMessage: expect.stringContaining("GHL_TIMEOUT"),
        }),
      })
    );
  });
});
