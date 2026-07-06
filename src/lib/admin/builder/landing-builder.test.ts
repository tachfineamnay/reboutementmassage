import { describe, expect, it } from "vitest";
import { createLandingBuilderDefaults } from "./landing-builder-defaults";
import { mapBuilderToLandingDraft } from "./landing-builder-mapper";
import { computeLandingBuilderReadiness } from "./landing-builder-readiness";
import { LandingBuilderSchema } from "./landing-builder-schema";

describe("landing builder", () => {
  it("flags missing essentials before a draft can be published", () => {
    const readiness = computeLandingBuilderReadiness(createLandingBuilderDefaults());

    expect(readiness.canPublish).toBe(false);
    expect(readiness.score).toBeLessThan(80);
    expect(readiness.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Destination requise.",
        "Slug local requis.",
        "Titre hero requis.",
        "Canal WhatsApp requis avant publication.",
        "Profil tracking requis avant publication.",
      ])
    );
  });

  it("maps validated builder input to a draft landing page", () => {
    const input = LandingBuilderSchema.parse({
      market: {
        destinationId: "dest_1",
        locale: "ES",
        slug: "reset-corporal-frances-cdmx",
        template: "MOBILE_WHATSAPP_FIRST",
      },
      offer: {
        offerId: "offer_1",
        whatsappChannelId: "wa_1",
        trackingProfileId: "tracking_1",
        crmRoutingRuleId: "crm_1",
      },
      hero: {
        heroTitle: "Reset corporal francés en CDMX",
        heroSubtitle:
          "Una sesión privada para liberar tensión corporal acumulada, con seguimiento por WhatsApp y enfoque local.",
        microNote: "Respuesta rápida por WhatsApp",
        primaryCta: "Escribir por WhatsApp",
        secondaryCta: "Reservar",
        heroImageId: "media_1",
        imageAlt: "Sesión privada de reset corporal en CDMX",
      },
      proof: {
        badges: [{ value: "10+", label: "años de experiencia" }],
        painChips: ["Espalda cargada", "Cuello rígido"],
        processSteps: ["Diagnóstico rápido", "Sesión ciblée"],
        testimonialIds: ["testimonial_1"],
      },
      conversion: {
        leadSegment: "b2c_premium",
        formHeadline: "Solicitud rápida",
        urgencyOptions: [{ value: "today", label: "Hoy" }],
        complianceText: "",
      },
      seo: {
        seoTitle: "Reset corporal francés en CDMX",
        metaDescription:
          "Sesión privada de reset corporal francés en Ciudad de México para liberar tensión, recuperar movilidad y coordinar por WhatsApp.",
        canonical: "",
        noindex: true,
        xDefault: false,
        hreflangGroupId: "",
      },
    });

    const draft = mapBuilderToLandingDraft(input);

    expect(draft.status).toBe("DRAFT");
    expect(draft.noindex).toBe(true);
    expect(draft.destinationId).toBe("dest_1");
    expect(draft.whatsappChannelId).toBe("wa_1");
    expect(draft.trackingProfileId).toBe("tracking_1");
    expect(draft.heroImageId).toBe("media_1");
    expect(draft.seoTitle).toBe("Reset corporal francés en CDMX");
  });
});
