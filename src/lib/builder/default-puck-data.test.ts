import { describe, expect, it } from "vitest";
import { createDefaultPuckDataFromLanding, initializePuckDataForLanding, isPuckLanding } from "./default-puck-data";

describe("default Puck data", () => {
  it("creates a Studio data tree from a landing", () => {
    const data = createDefaultPuckDataFromLanding({
      locale: "ES",
      heroTitle: "Reset corporal francés en CDMX",
      heroSubtitle: "Una sesión privada para soltar tensión acumulada.",
      primaryCta: "Consultar por WhatsApp",
      secondaryCta: "Formulario",
      painChips: ["Espalda cargada", "Cuello rígido"],
      proofBadges: [{ value: "Desde 2014", label: "Método TMS" }],
      processSteps: ["Envía un WhatsApp", "Recibe orientación"],
      faq: [{ question: "¿Reemplaza una consulta médica?", answer: "No." }],
      destination: { cityName: "Ciudad de México" },
      heroImage: { url: "/hero.webp", altEs: "Body Reset CDMX" },
    });

    expect(data.root.props?.locale).toBe("ES");
    expect(data.content.map((block) => block.type)).toContain("HeroSection");
    expect(data.content.find((block) => block.type === "HeroSection")?.props.title).toBe(
      "Reset corporal francés en CDMX"
    );
  });

  it("wraps generated data in the LandingPage.content Studio envelope", () => {
    const content = initializePuckDataForLanding({
      locale: "FR",
      heroTitle: "French Body Reset",
      heroSubtitle: "Une séance privée.",
      primaryCta: "WhatsApp",
    });

    expect(isPuckLanding(content)).toBe(true);
  });
});
