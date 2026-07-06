"use client";

import type { Field, Config, Viewports } from "@puckeditor/core";
import { puckCategories, puckComponentRegistry } from "@/lib/builder/block-registry";
import type {
  BadgeItem,
  FaqItem,
  LeadOptionItem,
  OfferCardItem,
  TmsLandingComponents,
  TmsPuckRootProps,
} from "@/lib/builder/puck-data-schema";

type CategoryName = keyof typeof puckCategories;

const idField: Field<string> = { type: "text", label: "ID interne" };

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function stringListField(label: string, placeholder: string): Field<string[]> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, readOnly, id }) => (
      <textarea
        id={id}
        className="puck-list-field"
        value={(Array.isArray(value) ? value : []).join("\n")}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={5}
        onChange={(event) => onChange(splitLines(event.target.value))}
        style={{
          width: "100%",
          border: "1px solid #d6d3d1",
          borderRadius: 6,
          padding: "10px 12px",
          font: "inherit",
          resize: "vertical",
        }}
      />
    ),
  };
}

const badgesField: Field<BadgeItem[]> = {
  type: "array",
  label: "Badges de preuve",
  min: 0,
  max: 6,
  arrayFields: {
    value: { type: "text", label: "Valeur" },
    label: { type: "text", label: "Label" },
  },
  defaultItemProps: { value: "10+", label: "ans d'expérience" },
  getItemSummary: (item) => item?.value || "Badge",
};

const faqItemsField: Field<FaqItem[]> = {
  type: "array",
  label: "Questions",
  min: 0,
  max: 8,
  arrayFields: {
    question: { type: "text", label: "Question" },
    answer: { type: "textarea", label: "Réponse" },
  },
  defaultItemProps: { question: "Question fréquente", answer: "Réponse courte et conforme." },
  getItemSummary: (item) => item?.question || "FAQ",
};

const leadOptionsField: Field<LeadOptionItem[]> = {
  type: "array",
  label: "Options tension",
  min: 1,
  max: 8,
  arrayFields: {
    value: { type: "text", label: "Valeur technique" },
    label: { type: "text", label: "Label visible" },
  },
  defaultItemProps: { value: "back", label: "Dos chargé" },
  getItemSummary: (item) => item?.label || "Option",
};

const offerCardsField: Field<OfferCardItem[]> = {
  type: "array",
  label: "Cartes offre",
  min: 0,
  max: 3,
  arrayFields: {
    title: { type: "text", label: "Titre" },
    subtitle: { type: "text", label: "Sous-titre" },
    description: { type: "textarea", label: "Description" },
    includes: stringListField("Inclus", "Une ligne par bénéfice"),
    ctaLabel: { type: "text", label: "CTA" },
    whatsappIntent: {
      type: "select",
      label: "Intent WhatsApp",
      options: [
        { label: "Réservation", value: "book_intent" },
        { label: "Information", value: "more_info_intent" },
        { label: "Défaut", value: "default" },
      ],
    },
  },
  defaultItemProps: {
    title: "Séance privée",
    subtitle: "",
    description: "",
    includes: ["Réponse WhatsApp", "Accompagnement personnalisé"],
    ctaLabel: "Réserver",
    whatsappIntent: "book_intent",
  },
  getItemSummary: (item) => item?.title || "Offre",
};

export const puckConfig: Config<TmsLandingComponents, TmsPuckRootProps, CategoryName> = {
  categories: puckCategories,
  root: {
    fields: {
      pageStyle: {
        type: "select",
        label: "Style page",
        options: [
          { label: "Premium reset", value: "premium-reset" },
          { label: "Wellness editorial", value: "wellness-editorial" },
          { label: "Clinical clean", value: "clinical-clean" },
        ],
      },
      density: {
        type: "select",
        label: "Densité",
        options: [
          { label: "Conversion", value: "conversion" },
          { label: "Éditorial", value: "editorial" },
          { label: "Premium", value: "premium" },
        ],
      },
      locale: {
        type: "select",
        label: "Langue",
        options: [
          { label: "FR", value: "FR" },
          { label: "EN", value: "EN" },
          { label: "ES", value: "ES" },
        ],
      },
    },
    render: ({ children }) => <>{children}</>,
  },
  components: {
    HeroSection: {
      label: "Hero",
      render: (props) => <puckComponentRegistry.HeroSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Immersive", value: "immersive" },
            { label: "Split", value: "split" },
            { label: "Compact", value: "compact" },
          ],
        },
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "textarea", label: "Titre" },
        subtitle: { type: "textarea", label: "Sous-titre" },
        body: { type: "textarea", label: "Corps optionnel" },
        microNote: { type: "text", label: "Micro-note" },
        primaryCta: { type: "text", label: "CTA principal" },
        secondaryCta: { type: "text", label: "CTA secondaire" },
        secondaryHref: { type: "text", label: "Lien CTA secondaire" },
        proofLine: { type: "text", label: "Ligne de preuve" },
        imageSrc: { type: "text", label: "Image" },
        imageAlt: { type: "text", label: "Alt image" },
      },
      defaultProps: {
        id: "hero",
        variant: "immersive",
        eyebrow: "",
        title: "Nouvelle landing TMS",
        subtitle: "",
        body: "",
        microNote: "",
        primaryCta: "WhatsApp",
        secondaryCta: "Réserver",
        secondaryHref: "#solicitud",
        proofLine: "",
        imageSrc: "",
        imageAlt: "",
      },
    },
    PainChipsSection: {
      label: "Pour qui",
      render: (props) => <puckComponentRegistry.PainChipsSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Chips", value: "chips" },
            { label: "Checklist", value: "checklist" },
          ],
        },
        title: { type: "text", label: "Titre" },
        body: { type: "textarea", label: "Corps" },
        items: stringListField("Items", "Une ligne par item"),
      },
      defaultProps: {
        id: "for-you",
        variant: "chips",
        title: "Pour vous si votre corps se sent chargé.",
        body: "",
        items: ["Dos chargé", "Nuque raide", "Stress accumulé"],
      },
    },
    ProofBadgesSection: {
      label: "Badges preuve",
      render: (props) => <puckComponentRegistry.ProofBadgesSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Stat grid", value: "stat-grid" },
            { label: "Compact", value: "compact" },
          ],
        },
        badges: badgesField,
      },
      defaultProps: {
        id: "proof",
        variant: "stat-grid",
        badges: [{ value: "Depuis 2014", label: "Méthode TMS" }],
      },
    },
    OfferSection: {
      label: "Offre",
      render: (props) => <puckComponentRegistry.OfferSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Cartes", value: "cards" },
            { label: "Simple", value: "single" },
          ],
        },
        title: { type: "text", label: "Titre" },
        bullets: stringListField("Bénéfices", "Une ligne par bénéfice"),
        launchRateLine: { type: "text", label: "Ligne tarif / lancement" },
        showPrice: { type: "radio", label: "Afficher prix", options: [{ label: "Oui", value: true }, { label: "Non", value: false }] },
        priceLabel: { type: "text", label: "Label prix" },
        priceValue: { type: "text", label: "Prix" },
        ctaLabel: { type: "text", label: "CTA" },
        whatsappIntent: {
          type: "select",
          label: "Intent WhatsApp",
          options: [
            { label: "Réservation", value: "book_intent" },
            { label: "Information", value: "more_info_intent" },
            { label: "Défaut", value: "default" },
          ],
        },
        cards: offerCardsField,
      },
      defaultProps: {
        id: "offer",
        variant: "cards",
        title: "Séance privée",
        bullets: ["Séance sur rendez-vous", "Réponse WhatsApp"],
        launchRateLine: "",
        showPrice: false,
        priceLabel: "",
        priceValue: "",
        ctaLabel: "Réserver",
        whatsappIntent: "book_intent",
        cards: [],
      },
    },
    DifferenceSection: {
      label: "Différence",
      render: (props) => <puckComponentRegistry.DifferenceSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Image + copy", value: "image-copy" },
            { label: "Copy first", value: "copy-first" },
          ],
        },
        title: { type: "text", label: "Titre" },
        body: { type: "textarea", label: "Texte" },
        points: stringListField("Points", "Une ligne par point"),
        imageSrc: { type: "text", label: "Image" },
        imageAlt: { type: "text", label: "Alt image" },
      },
      defaultProps: {
        id: "difference",
        variant: "image-copy",
        title: "Ce n'est pas un massage classique.",
        body: "",
        points: ["Lecture du corps", "Travail manuel calibré"],
        imageSrc: "",
        imageAlt: "",
      },
    },
    TestimonialSection: {
      label: "Témoignage",
      render: (props) => <puckComponentRegistry.TestimonialSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Vidéo", value: "video" },
            { label: "Citation", value: "quote" },
          ],
        },
        quote: { type: "textarea", label: "Citation" },
        attribution: { type: "text", label: "Attribution" },
        posterSrc: { type: "text", label: "Poster" },
        videoSrc: { type: "text", label: "Vidéo" },
        cta: { type: "text", label: "CTA" },
      },
      defaultProps: {
        id: "testimonial",
        variant: "quote",
        quote: "",
        attribution: "",
        posterSrc: "/practice-01.webp",
        videoSrc: "",
        cta: "Demander si la séance est adaptée",
      },
    },
    ProcessSection: {
      label: "Process",
      render: (props) => <puckComponentRegistry.ProcessSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Numéroté", value: "numbered" },
            { label: "Compact", value: "compact" },
          ],
        },
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "text", label: "Titre" },
        steps: stringListField("Étapes", "Une ligne par étape"),
      },
      defaultProps: {
        id: "process",
        variant: "numbered",
        eyebrow: "Process",
        title: "Comment ça se passe",
        steps: ["Envoyez un WhatsApp", "Indiquez votre besoin", "Recevez une réponse"],
      },
    },
    LeadFormSection: {
      label: "Formulaire",
      render: (props) => <puckComponentRegistry.LeadFormSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Court", value: "short" },
            { label: "Étendu", value: "extended" },
          ],
        },
        label: { type: "text", label: "Label" },
        headline: { type: "text", label: "Titre" },
        sub: { type: "textarea", label: "Texte" },
        tensionLabel: { type: "text", label: "Label tension" },
        tensionPlaceholder: { type: "text", label: "Placeholder tension" },
        whatsappLabel: { type: "text", label: "Label WhatsApp" },
        whatsappPlaceholder: { type: "text", label: "Placeholder WhatsApp" },
        submit: { type: "text", label: "CTA submit" },
        needOptions: leadOptionsField,
        complianceText: { type: "textarea", label: "Texte conformité" },
      },
      defaultProps: {
        id: "lead-form",
        variant: "short",
        label: "Demande rapide",
        headline: "Vous préférez écrire avant WhatsApp",
        sub: "",
        tensionLabel: "Tension principale",
        tensionPlaceholder: "Sélectionnez une option",
        whatsappLabel: "WhatsApp",
        whatsappPlaceholder: "+52...",
        submit: "Envoyer la demande",
        needOptions: [{ value: "back", label: "Dos chargé" }],
        complianceText: "",
      },
    },
    FAQSection: {
      label: "FAQ",
      render: (props) => <puckComponentRegistry.FAQSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Accordéon", value: "accordion" },
            { label: "Compact", value: "compact" },
          ],
        },
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "text", label: "Titre" },
        items: faqItemsField,
      },
      defaultProps: {
        id: "faq",
        variant: "accordion",
        eyebrow: "FAQ",
        title: "Questions fréquentes",
        items: [],
      },
    },
    FinalCtaSection: {
      label: "CTA final",
      render: (props) => <puckComponentRegistry.FinalCtaSection {...props} />,
      fields: {
        id: idField,
        variant: {
          type: "select",
          label: "Variante",
          options: [
            { label: "Centré", value: "centered" },
            { label: "Bannière", value: "banner" },
          ],
        },
        title: { type: "text", label: "Titre" },
        body: { type: "textarea", label: "Texte" },
        primary: { type: "text", label: "CTA principal" },
        secondary: { type: "text", label: "CTA secondaire" },
      },
      defaultProps: {
        id: "final-cta",
        variant: "centered",
        title: "Vérifier une disponibilité",
        body: "",
        primary: "WhatsApp",
        secondary: "Formulaire",
      },
    },
  },
};

export const tmsStudioViewports: Viewports = [
  { label: "Mobile", width: 390, height: "auto", icon: "Smartphone" },
  { label: "Tablet", width: 768, height: "auto", icon: "Tablet" },
  { label: "Desktop", width: 1280, height: "auto", icon: "Monitor" },
];
