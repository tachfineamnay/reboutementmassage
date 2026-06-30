"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { isGrowthLandingPath } from "@/lib/seo";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type MetaLanguage = "FR" | "EN" | "ES";
type MetaEventOptions = {
  eventID?: string;
};
type ViewContentParams = {
  content_name: string;
  content_category: string;
  lang: MetaLanguage;
  page_path: string;
};
type ContactParams = {
  content_name: "contact_click";
  contact_channel: "whatsapp" | "phone" | "email" | "form_cta";
  lang: MetaLanguage;
  page_path: string;
};
type LeadParams = {
  content_name: "lead_form_submission";
  content_category: "manual_therapy";
  lang: MetaLanguage;
  intent: string | null;
  preferred_channel: string | null;
  lead_segment: string | null;
  page_path: string;
};

declare global {
  interface Window {
    fbq?: (command: string, eventName: string, params?: object, options?: object) => void;
  }
}

function canTrackMeta() {
  return typeof window !== "undefined" && Boolean(window.fbq);
}

export function trackMetaPageView() {
  if (!canTrackMeta()) return;
  window.fbq?.("track", "PageView");
}

export function trackMetaViewContent(params: ViewContentParams) {
  if (!canTrackMeta()) return;
  window.fbq?.("track", "ViewContent", params);
}

export function trackMetaContact(params: ContactParams) {
  if (!canTrackMeta()) return;
  window.fbq?.("track", "Contact", params);
}

export function trackMetaLead(params: LeadParams, options?: MetaEventOptions) {
  if (!canTrackMeta()) return;
  window.fbq?.("track", "Lead", params, options?.eventID ? { eventID: options.eventID } : undefined);
}

export function MetaPixel({ pixelId, enabled = true }: { pixelId?: string | null; enabled?: boolean }) {
  const pathname = usePathname();

  if (!pixelId && isGrowthLandingPath(pathname)) {
    return null;
  }

  const activeId = pixelId || META_PIXEL_ID;
  if (!activeId || !enabled) return null;

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[]}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${activeId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <Script
        id="meta-pixel-sdk"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${activeId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
