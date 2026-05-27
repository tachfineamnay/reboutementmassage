import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates, LOCALES, localePath } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const alternates = {
    languages: languageAlternates(),
  };

  return LOCALES.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified,
    changeFrequency: "monthly",
    priority: locale === "fr" ? 1 : 0.9,
    alternates,
  }));
}
