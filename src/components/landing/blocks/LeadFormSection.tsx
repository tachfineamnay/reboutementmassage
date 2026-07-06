"use client";

import ShortLeadForm from "@/components/campaign/ShortLeadForm";
import { useLandingRenderContext } from "@/components/landing/LandingRenderContext";
import type { LeadFormSectionProps } from "@/lib/builder/puck-data-schema";

export default function LeadFormSection(props: LeadFormSectionProps) {
  const { config } = useLandingRenderContext();

  return (
    <>
      <ShortLeadForm
        config={{
          ...config,
          shortForm: {
            ...config.shortForm,
            label: props.label || config.shortForm.label,
            headline: props.headline || config.shortForm.headline,
            sub: props.sub || config.shortForm.sub,
            tensionLabel: props.tensionLabel || config.shortForm.tensionLabel,
            tensionPlaceholder: props.tensionPlaceholder || config.shortForm.tensionPlaceholder,
            whatsappLabel: props.whatsappLabel || config.shortForm.whatsappLabel,
            whatsappPlaceholder: props.whatsappPlaceholder || config.shortForm.whatsappPlaceholder,
            submit: props.submit || config.shortForm.submit,
            needOptions: props.needOptions.length ? props.needOptions : config.shortForm.needOptions,
          },
        }}
        id="solicitud"
      />
      {props.complianceText ? (
        <p className="campaign-form__compliance container container--form">{props.complianceText}</p>
      ) : null}
    </>
  );
}
