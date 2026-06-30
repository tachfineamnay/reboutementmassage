"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackMetaContact } from "@/components/MetaPixel";

type MetaLanguage = "FR" | "EN" | "ES";
type ContactChannel = "whatsapp" | "phone" | "email" | "form_cta";

const CONTACT_HASHES = new Set(["#contact", "#demande", "#inscription"]);
const PATH_LANG_MAP: Record<string, MetaLanguage> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

function inferLangFromPathname(pathname: string | null): MetaLanguage {
  const segment = pathname?.split("/").filter(Boolean)[0]?.toLowerCase();
  return (segment && PATH_LANG_MAP[segment]) || "FR";
}

function detectContactChannel(anchor: HTMLAnchorElement): ContactChannel | null {
  const href = anchor.getAttribute("href") ?? "";
  const hrefLower = href.toLowerCase();

  if (hrefLower.startsWith("tel:")) return "phone";
  if (hrefLower.startsWith("mailto:")) return "email";
  if (
    hrefLower.startsWith("whatsapp:") ||
    hrefLower.includes("wa.me/") ||
    hrefLower.includes("api.whatsapp.com") ||
    hrefLower.includes("web.whatsapp.com")
  ) {
    return "whatsapp";
  }

  try {
    const url = new URL(href, window.location.href);
    if (CONTACT_HASHES.has(url.hash.toLowerCase())) return "form_cta";
  } catch {
    if (CONTACT_HASHES.has(hrefLower)) return "form_cta";
  }

  return null;
}

export default function MetaContactTracker({ lang }: { lang?: MetaLanguage }) {
  const pathname = usePathname();
  const eventLang = lang ?? inferLangFromPathname(pathname);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const contactChannel = detectContactChannel(anchor);
      if (!contactChannel) return;

      trackMetaContact({
        content_name: "contact_click",
        contact_channel: contactChannel,
        lang: eventLang,
        page_path: pathname || window.location.pathname,
      });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [eventLang, pathname]);

  return null;
}
