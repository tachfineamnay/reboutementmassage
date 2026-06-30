"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaViewContent } from "@/components/MetaPixel";

type MetaLanguage = "FR" | "EN" | "ES";

export default function MetaViewContent({
  contentName,
  contentCategory,
  lang,
}: {
  contentName: string;
  contentCategory: string;
  lang: MetaLanguage;
}) {
  const pathname = usePathname();
  const trackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const pagePath = pathname || window.location.pathname;
    const key = `${contentName}:${contentCategory}:${lang}:${pagePath}`;

    if (trackedKeyRef.current === key) return;
    trackedKeyRef.current = key;

    trackMetaViewContent({
      content_name: contentName,
      content_category: contentCategory,
      lang,
      page_path: pagePath,
    });
  }, [contentCategory, contentName, lang, pathname]);

  return null;
}
