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
  sessionLocationPreference: "Cabinet",
  availability: "Martes por la tarde, contacto por WhatsApp.",
  marketingConsent: true,
};

describe("BodyResetFixLeadForm", () => {
  it("renders the secondary Body Reset Fix form", () => {
    const html = renderToString(<BodyResetFixLeadForm />);

    expect(html).toContain("Solicitud Body Reset Fix");
    expect(html).toContain("WhatsApp/teléfono");
    expect(html).toContain("Description de la douleur");
  });

  it("validates required fields", () => {
    const errors = validateBodyResetFixForm({
      name: "",
      phone: "12",
      city: "",
      painDescription: "",
      sessionLocationPreference: "",
      availability: "",
      marketingConsent: false,
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
    expect(payload.branchData.marketingConsent).toBe("true");
  });

  it("normalizes phone values and blocks duplicate submissions while in flight", () => {
    expect(normalizeBodyResetFixPhone("+52 56 3300 3042")).toBe("+525633003042");
    expect(normalizeBodyResetFixPhone("56 3300 3042")).toBe("5633003042");
    expect(isBodyResetFixSubmitBlocked(true)).toBe(true);
    expect(isBodyResetFixSubmitBlocked(false)).toBe(false);
  });
});
