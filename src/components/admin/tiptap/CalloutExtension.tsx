import { Node, mergeAttributes } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CalloutType = "info" | "warning" | "success" | "danger";

const CALLOUT_ICONS: Record<CalloutType, string> = {
  info: "💡",
  warning: "⚠️",
  success: "✅",
  danger: "🚨",
};

const CALLOUT_LABELS: Record<CalloutType, string> = {
  info: "Info",
  warning: "Attention",
  success: "Astuce",
  danger: "Prudence",
};

// ─── Node View React ─────────────────────────────────────────────────────────

function CalloutNodeView({ node, updateAttributes }: NodeViewProps) {
  const typedAttrs = node.attrs as { type: CalloutType };
  const [showPicker, setShowPicker] = useState(false);
  const calloutType = typedAttrs.type as CalloutType;

  return (
    <NodeViewWrapper as="div" className={`callout-block callout-block--${calloutType}`}>
      <div className="callout-block__header" contentEditable={false}>
        <button
          type="button"
          className="callout-block__icon-btn"
          title="Changer le type"
          onClick={() => setShowPicker((v) => !v)}
        >
          {CALLOUT_ICONS[calloutType]}
        </button>
        <span className="callout-block__label">{CALLOUT_LABELS[calloutType]}</span>

        {showPicker && (
          <div className="callout-block__picker">
            {(Object.keys(CALLOUT_ICONS) as CalloutType[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`callout-block__picker-btn ${t === calloutType ? "callout-block__picker-btn--active" : ""}`}
                onClick={() => {
                  updateAttributes({ type: t });
                  setShowPicker(false);
                }}
              >
                {CALLOUT_ICONS[t]} {CALLOUT_LABELS[t]}
              </button>
            ))}
          </div>
        )}
      </div>
      <NodeViewContent className="callout-block__content" />
    </NodeViewWrapper>
  );
}

// ─── Extension Tiptap ────────────────────────────────────────────────────────

export const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info" as CalloutType,
        parseHTML: (el) => el.getAttribute("data-callout-type") ?? "info",
        renderHTML: (attrs) => ({ "data-callout-type": attrs.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout-type]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes["data-callout-type"] ?? "info";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: `callout-block callout-block--${type}`,
      }),
      ["div", { class: "callout-block__label" }, `${CALLOUT_ICONS[type as CalloutType]} ${CALLOUT_LABELS[type as CalloutType]}`],
      ["div", { class: "callout-block__content" }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
