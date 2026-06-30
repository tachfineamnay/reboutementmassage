"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { isGrowthLandingPath } from "@/lib/seo";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics({
  measurementId,
  enabled = true,
}: {
  measurementId?: string | null;
  enabled?: boolean;
}) {
  const pathname = usePathname();

  if (!measurementId && isGrowthLandingPath(pathname)) {
    return null;
  }

  const activeId = measurementId || GA_MEASUREMENT_ID;
  if (!activeId || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${activeId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${activeId}');
          `,
        }}
      />
    </>
  );
}
