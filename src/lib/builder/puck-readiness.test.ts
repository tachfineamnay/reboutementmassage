import { describe, expect, it } from "vitest";
import { initializePuckDataForLanding, type PuckLandingSource } from "./default-puck-data";
import { computePuckReadiness } from "./puck-readiness";

type TestLanding = PuckLandingSource & {
  content: unknown;
  noindex: boolean;
  whatsappChannelId: string | null;
  trackingProfileId: string | null;
  whatsappChannel: {
    id: string;
    status: "ACTIVE" | "PAUSED";
    phoneE164: string;
  } | null;
  trackingProfile: {
    id: string;
    status: "ACTIVE" | "PAUSED";
    enableGA4: boolean;
    enableMeta: boolean;
    enableTikTok: boolean;
    enableGTM: boolean;
    enableGoogleAds: boolean;
  } | null;
};

function completeLanding() {
  const landing: TestLanding = {
    id: "landing_1",
    locale: "FR",
    slug: "french-body-reset",
    heroTitle: "French Body Reset à Mexico City",
    heroSubtitle:
      "Une séance privée de bien-être pour accompagner les tensions corporelles et retrouver plus de confort.",
    primaryCta: "Vérifier sur WhatsApp",
    secondaryCta: "Formulaire",
    microNote: "Réponse selon disponibilité",
    painChips: ["Dos chargé", "Nuque raide"],
    proofBadges: [{ value: "Depuis 2014", label: "Méthode TMS" }],
    processSteps: ["Envoyez un WhatsApp", "Indiquez votre besoin", "Recevez une réponse"],
    faq: [
      { question: "La séance remplace-t-elle une consultation médicale ?", answer: "Non." },
      { question: "Comment réserver ?", answer: "Par WhatsApp ou formulaire." },
    ],
    complianceText: "Approche manuelle de bien-être, sans remplacer un avis médical.",
    seoTitle: "French Body Reset à Mexico City",
    metaDescription:
      "Séance privée French Body Reset à Mexico City pour accompagner les tensions corporelles, avec réponse personnalisée par WhatsApp selon disponibilité.",
    noindex: true,
    whatsappChannelId: "wa_1",
    trackingProfileId: "tracking_1",
    whatsappChannel: {
      id: "wa_1",
      status: "ACTIVE",
      phoneE164: "+5215512345678",
    },
    trackingProfile: {
      id: "tracking_1",
      status: "ACTIVE",
      enableGA4: true,
      enableMeta: false,
      enableTikTok: false,
      enableGTM: false,
      enableGoogleAds: false,
    },
    destination: { cityName: "Mexico City" },
    offer: null,
    heroImage: null,
    content: {},
  };

  landing.content = initializePuckDataForLanding(landing);
  return landing;
}

describe("puck readiness", () => {
  it("allows publication when Studio essentials are complete", () => {
    const readiness = computePuckReadiness(completeLanding());

    expect(readiness.canPublish).toBe(true);
    expect(readiness.score).toBeGreaterThanOrEqual(80);
    expect(readiness.criticalCount).toBe(0);
  });

  it("blocks publication when WhatsApp and tracking are missing", () => {
    const landing = completeLanding();
    landing.whatsappChannelId = null;
    landing.whatsappChannel = null;
    landing.trackingProfileId = null;
    landing.trackingProfile = null;

    const readiness = computePuckReadiness(landing);

    expect(readiness.canPublish).toBe(false);
    expect(readiness.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["whatsapp_missing", "tracking_missing"])
    );
  });
});
