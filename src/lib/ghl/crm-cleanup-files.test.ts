import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getCdmxCampaignAlternates } from "@/data/campaign-landings";

describe("CRM cleanup static contracts", () => {
  it("uses exact documented CDMX routing tags in the growth seed", () => {
    const seed = readFileSync("prisma/seed-growth-cdmx.ts", "utf8");

    expect(seed).toContain("geo_country_mexique");
    expect(seed).toContain("geo_city_mexico_city");
    expect(seed).toContain("campaign_private_sessions");
    expect(seed).not.toContain("city_cdmx");
    expect(seed).not.toContain("offer_body_reset");
    expect(seed).not.toContain("landing_cdmx");
  });

  it("keeps reciprocal CDMX hreflang alternates with ES as x-default", () => {
    expect(getCdmxCampaignAlternates()).toEqual({
      "x-default": "/es/reset-corporal-frances-cdmx",
      fr: "/fr/french-body-reset-mexico-city",
      en: "/en/mexico-city-french-body-reset",
      es: "/es/reset-corporal-frances-cdmx",
    });

    const staticPage = readFileSync("src/app/[lang]/reset-corporal-frances-cdmx/page.tsx", "utf8");
    const dynamicPage = readFileSync("src/app/[lang]/[slug]/page.tsx", "utf8");
    const sitemap = readFileSync("src/app/sitemap.ts", "utf8");

    expect(staticPage).toContain("getCdmxCampaignAlternates");
    expect(dynamicPage).toContain("getCdmxCampaignAlternates");
    expect(sitemap).toContain("getCdmxCampaignAlternates");
  });
});
