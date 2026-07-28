import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BodyResetFixLeadForm, {
  BODY_RESET_FIX_FORM_KIND,
  buildBodyResetFixPayload,
  isBodyResetFixSubmitBlocked,
  normalizeBodyResetFixPhone,
  validateBodyResetFixForm,
  type BodyResetFixFormState,
} from "@/components/campaign/BodyResetFixLeadForm";

const validForm: BodyResetFixFormState = {
  name: "Ana",
  phone: "+52 56 3300 3042",
  city: "Condesa, CDMX",
  painDescription: "Dolor lumbar desde hace dos semanas, intensidad 7/10.",
  sessionLocationPreference: "Consultorio",
  availability: "Martes por la tarde, contacto por WhatsApp.",
};

describe("BodyResetFixLeadForm", () => {
  it("renders the secondary Body Reset Fix form", () => {
    const html = renderToString(<BodyResetFixLeadForm />);

    expect(html).toContain("Solicitud Body Reset Fix");
    expect(html).toContain("WhatsApp con indicativo internacional");
    expect(html).toContain("Nombre");
    expect(html).toContain("Ciudad / ubicación");
    expect(html).toContain("Consultorio o domicilio");
    expect(html).toContain("Describe la molestia: zona, desde cuándo e intensidad");
    expect(html).toContain("Disponibilidad: día, horario y medio de contacto");
    expect(html).not.toContain("Description de la douleur");
    expect(html).not.toContain("Ville/localisation");
  });

  it("validates required fields", () => {
    const errors = validateBodyResetFixForm({
      name: "",
      phone: "12",
      city: "",
      painDescription: "",
      sessionLocationPreference: "",
      availability: "",
    });

    expect(errors.name).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.city).toBeDefined();
    expect(errors.painDescription).toBeDefined();
    expect(errors.sessionLocationPreference).toBeDefined();
    expect(errors.availability).toBeDefined();
  });

  it("builds the explicit body_reset_fix payload and field mapping values", () => {
    const payload = buildBodyResetFixPayload(
      validForm,
      "evt_body_reset_fix",
      "https://example.com/es/reset-corporal-frances-cdmx",
      "America/Mexico_City",
      { utm_source: "meta" }
    );

    expect(payload.formKind).toBe(BODY_RESET_FIX_FORM_KIND);
    expect(payload.lang).toBe("ES");
    expect(payload.intent).toBe("private_session");
    expect(payload.contact).toBe("+525633003042");
    expect(payload.context).toBe(validForm.painDescription);
    expect(payload.currentLocation).toBe(validForm.city);
    expect(payload.branchData.sessionLocationPreference).toBe(validForm.sessionLocationPreference);
    expect(payload.branchData.preSessionNotes).toBe(validForm.availability);
    expect("marketingConsent" in payload.branchData).toBe(false);
  });

  it("requires an E.164 phone value and blocks duplicate submissions while in flight", () => {
    expect(normalizeBodyResetFixPhone("+52 56 3300 3042")).toBe("+525633003042");
    expect(normalizeBodyResetFixPhone("56 3300 3042")).toBe("");
    expect(validateBodyResetFixForm({ ...validForm, phone: "56 3300 3042" }).phone).toBeDefined();
    expect(isBodyResetFixSubmitBlocked(true)).toBe(true);
    expect(isBodyResetFixSubmitBlocked(false)).toBe(false);
  });

  it("keeps the CRM failure state fully Spanish with a WhatsApp CTA", () => {
    const source = renderToString(<BodyResetFixLeadForm />);
    expect(source).toContain("Enviar solicitud Body Reset Fix");

    const moduleSource = readFileSync("src/components/campaign/BodyResetFixLeadForm.tsx", "utf8");
    expect(moduleSource).toContain("Tu solicitud quedó registrada.");
    expect(moduleSource).toContain("sincronización");
    expect(moduleSource).toContain("también");
    expect(moduleSource).toContain("orientación");
    expect(moduleSource).toContain("Escribir por WhatsApp");
  });
});
