import { NextRequest, NextResponse } from "next/server";
import { submitIndexNowUrls } from "@/lib/indexnow";

export const runtime = "nodejs";

type IndexNowPayload = {
  urls?: unknown;
  token?: unknown;
};

function isAuthorized(request: NextRequest, payload: IndexNowPayload) {
  const secret = process.env.INDEXNOW_API_SECRET;
  if (!secret) return true;

  const headerToken = request.headers.get("x-indexnow-secret");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const bodyToken = typeof payload.token === "string" ? payload.token : null;

  return [headerToken, bearer, bodyToken].includes(secret);
}

function normalizeUrls(input: unknown) {
  if (typeof input === "string") return [input];
  if (Array.isArray(input)) return input.filter((url): url is string => typeof url === "string");
  return [];
}

export async function POST(request: NextRequest) {
  let payload: IndexNowPayload;

  try {
    payload = (await request.json()) as IndexNowPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!isAuthorized(request, payload)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const urls = normalizeUrls(payload.urls);
  if (urls.length === 0) {
    return NextResponse.json({ ok: false, error: "Provide one or more URLs in the `urls` field." }, { status: 400 });
  }

  const result = await submitIndexNowUrls(urls);
  const status = result.ok || result.skipped ? 200 : 502;

  return NextResponse.json(result, { status });
}
