"use client";

import React, { useEffect } from "react";
import SharedHeader from "@/components/SharedHeader";
import SharedFooter from "@/components/SharedFooter";

type Lang = "fr" | "en" | "es";

interface StoriesPageShellProps {
  lang: Lang;
  children: React.ReactNode;
}

export default function StoriesPageShell({ lang, children }: StoriesPageShellProps) {
  const langUpper = lang.toUpperCase() as "FR" | "EN" | "ES";

  useEffect(() => {
    document.documentElement.setAttribute("data-density", "editorial");
    document.documentElement.setAttribute("data-palette", "forest");
    document.documentElement.setAttribute("data-layout", "cream");
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      <SharedHeader lang={langUpper} activePage="stories" heroStyle="light" />
      {children}
      <SharedFooter lang={langUpper} />
    </>
  );
}
