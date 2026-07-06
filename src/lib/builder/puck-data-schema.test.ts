import { describe, expect, it } from "vitest";
import { parsePuckData, puckDataSchema } from "./puck-data-schema";

const validPuckData = {
  root: {
    props: {
      pageStyle: "premium-reset",
      density: "conversion",
      locale: "FR",
    },
  },
  content: [
    {
      type: "HeroSection",
      props: {
        id: "hero",
        variant: "immersive",
        eyebrow: "CDMX",
        title: "Reset corporel",
        subtitle: "Séance privée de bien-être.",
        body: "",
        microNote: "Réponse WhatsApp",
        primaryCta: "WhatsApp",
        secondaryCta: "Formulaire",
        secondaryHref: "#solicitud",
        proofLine: "",
        imageSrc: "",
        imageAlt: "Séance TMS",
      },
    },
  ],
};

describe("puck data schema", () => {
  it("accepts valid Puck landing data", () => {
    expect(parsePuckData(validPuckData).content[0]?.type).toBe("HeroSection");
  });

  it("rejects unknown blocks", () => {
    const result = puckDataSchema.safeParse({
      ...validPuckData,
      content: [{ type: "ScriptBlock", props: { id: "x", html: "<script />" } }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects freeform styling props", () => {
    const result = puckDataSchema.safeParse({
      ...validPuckData,
      content: [
        {
          ...validPuckData.content[0],
          props: {
            ...validPuckData.content[0].props,
            css: "margin: 100px",
          },
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
