"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackMetaPageView } from "@/components/MetaPixel";

export default function MetaPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didSkipInitialPageView = useRef(false);

  useEffect(() => {
    const routeKey = `${pathname}?${searchParams.toString()}`;

    if (!didSkipInitialPageView.current) {
      didSkipInitialPageView.current = true;
      return;
    }

    if (!routeKey) return;
    trackMetaPageView();
  }, [pathname, searchParams]);

  return null;
}
