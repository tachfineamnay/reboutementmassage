"use client";

import { useEffect } from "react";

export default function CookieSetterClient({ name, value }: { name: string; value: string }) {
  useEffect(() => {
    document.cookie = `${name}=${value};path=/;max-age=2592000`; // 30 jours
  }, [name, value]);

  return null;
}
