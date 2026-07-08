import { CDMX_WHATSAPP_URL } from "@/data/campaign-landings";

export type StaticLandingStatus = "LIVE" | "DRAFT" | "PAUSED" | "ARCHIVED";

export type StaticLandingEntry = {
  id: string;
  title: string;
  route: string;
  locale: "fr" | "en" | "es";
  market: string;
  country: string;
  offer: string;
  status: StaticLandingStatus;
  priority: number;
  template: string;
  componentPath: string;
  configPath: string;
  canonical: string;
  indexable: boolean;
  sitemap: boolean;
  whatsappLabel: string;
  whatsappUrl: string;
  lastModified: string;
  owner: string;
  notes: string;
};

export const STATIC_LANDINGS_REGISTRY: StaticLandingEntry[] = [
  {
    id: "cdmx-reset-corporal-es",
    title: "Reset Corporal Francés en CDMX",
    route: "/es/reset-corporal-frances-cdmx",
    locale: "es",
    market: "CDMX",
    country: "Mexico",
    offer: "French Body Reset",
    status: "LIVE",
    priority: 0.85,
    template: "cdmx-premium-reset",
    componentPath: "src/app/reset-corporal-frances-page.tsx",
    configPath: "src/data/campaign-landings.ts",
    canonical: "/es/reset-corporal-frances-cdmx",
    indexable: true,
    sitemap: true,
    whatsappLabel: "Reservar sesión CDMX",
    whatsappUrl: CDMX_WHATSAPP_URL,
    lastModified: "2026-06-30",
    owner: "Gregory",
    notes: "Landing premium statique. Ne pas migrer vers Puck.",
  },
];

export function getLiveIndexableStaticLandings(): StaticLandingEntry[] {
  return STATIC_LANDINGS_REGISTRY.filter(
    (landing) => landing.status === "LIVE" && landing.indexable && landing.sitemap
  );
}

export function getStaticLandingById(id: string): StaticLandingEntry | undefined {
  return STATIC_LANDINGS_REGISTRY.find((landing) => landing.id === id);
}
