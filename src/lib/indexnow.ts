import { absoluteUrl } from "@/lib/seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;

function getHost() {
  const rawHost = process.env.INDEXNOW_HOST;
  if (rawHost) return rawHost.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  try {
    return new URL(absoluteUrl()).host;
  } catch {
    return null;
  }
}

function uniqueAbsoluteUrls(urls: string[]) {
  return Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => (url.startsWith("http") ? url : absoluteUrl(url)))
    )
  ).slice(0, MAX_URLS_PER_REQUEST);
}

export async function submitIndexNowUrls(urls: string[]) {
  const key = process.env.INDEXNOW_KEY;
  const host = getHost();
  const urlList = uniqueAbsoluteUrls(urls);

  if (!key || !host || urlList.length === 0) {
    return {
      ok: false,
      skipped: true,
      status: null,
      message: !key ? "INDEXNOW_KEY is missing." : !host ? "INDEXNOW_HOST could not be resolved." : "No URL to submit.",
    };
  }

  const keyLocation = absoluteUrl(`/${key}.txt`);

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });

  return {
    ok: response.ok,
    skipped: false,
    status: response.status,
    submitted: urlList.length,
  };
}
