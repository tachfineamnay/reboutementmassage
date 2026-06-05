import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const DISALLOWED_PRIVATE_PATHS = ["/api/", "/admin/", "/admin"];

const SEARCH_CRAWLERS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "Applebot",
];

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

const ALLOWED_CRAWLERS = [...SEARCH_CRAWLERS, ...AI_CRAWLERS];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PRIVATE_PATHS,
      },
      ...ALLOWED_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED_PRIVATE_PATHS,
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
