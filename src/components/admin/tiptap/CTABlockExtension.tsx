import { Node, mergeAttributes } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";

// ─── Node View ────────────────────────────────────────────────────────────────

function CTANodeView({ node, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const attrs = node.attrs as { title: string; description: string; buttonLabel: string; buttonUrl: string };
  const { title, description, buttonLabel, buttonUrl } = attrs;

  return (
    <NodeViewWrapper as="div" className="cta-block">
      {editing ? (
        /* Formulaire d'édition */
        <div className="cta-block__editor" contentEditable={false}>
          <div className="admin-field">
            <label className="admin-label">Titre</label>
            <input
              className="admin-input"
              value={title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              placeholder="Titre du CTA"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Description (optionnel)</label>
            <input
              className="admin-input"
              value={description}
              onChange={(e) => updateAttributes({ description: e.target.value })}
              placeholder="Sous-titre ou accroche…"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Texte du bouton</label>
            <input
              className="admin-input"
              value={buttonLabel}
              onChange={(e) => updateAttributes({ buttonLabel: e.target.value })}
              placeholder="En savoir plus"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">URL du bouton</label>
            <input
              className="admin-input"
              type="url"
              value={buttonUrl}
              onChange={(e) => updateAttributes({ buttonUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="cta-block__editor-actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary admin-btn--sm"
              onClick={() => setEditing(false)}
            >
              ✓ Valider
            </button>
          </div>
        </div>
      ) : (
        /* Aperçu du CTA */
        <div className="cta-block__preview" contentEditable={false}>
          <div className="cta-block__text">
            <p className="cta-block__title">{title || "Titre du CTA"}</p>
            {description && <p className="cta-block__description">{description}</p>}
          </div>
          <div className="cta-block__btn-row">
            <span className="cta-block__btn">{buttonLabel || "En savoir plus"}</span>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setEditing(true)}
            >
              ✏ Modifier
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// ─── Extension ────────────────────────────────────────────────────────────────

export const CTABlockExtension = Node.create({
  name: "ctaBlock",
  group: "block",
  atom: true, // pas de contenu éditable inline

  addAttributes() {
    return {
      title: { default: "Découvrez nos services" },
      description: { default: "" },
      buttonLabel: { default: "En savoir plus" },
      buttonUrl: { default: "/" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-cta-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-cta-block": "true",
        class: "cta-block",
      }),
      [
        "p",
        { class: "cta-block__title" },
        HTMLAttributes.title ?? "",
      ],
      HTMLAttributes.description
        ? ["p", { class: "cta-block__description" }, HTMLAttributes.description]
        : ["span", {}],
      [
        "a",
        {
          href: HTMLAttributes.buttonUrl ?? "/",
          class: "cta-block__btn",
        },
        HTMLAttributes.buttonLabel ?? "En savoir plus",
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CTANodeView);
  },
});
