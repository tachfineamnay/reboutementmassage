"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { CalloutExtension } from "./tiptap/CalloutExtension";
import { CTABlockExtension } from "./tiptap/CTABlockExtension";
import TiptapToolbar from "./TiptapToolbar";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TiptapContent = Record<string, unknown> | null;

export type ContentStats = {
  wordCount: number;
  readingTime: number;
  characters: number;
};

export type TiptapContentCommand = {
  id: string;
  html: string;
  mode: "insert" | "replace";
};

type TiptapEditorProps = {
  /**
   * Contenu initial au format JSON Tiptap (editorJson) ou null.
   */
  initialContent: TiptapContent;
  /**
   * Appelé dès qu'un changement se produit.
   * Reçoit le JSON Tiptap, le HTML exporté, le texte brut et les stats.
   */
  onChange: (data: {
    editorJson: TiptapContent;
    html: string;
    plainText: string;
    stats: ContentStats;
  }) => void;
  /**
   * Si true, l'éditeur est en lecture seule.
   */
  readOnly?: boolean;
  /**
   * Texte affiché quand l'éditeur est vide.
   */
  placeholder?: string;
  locale?: "FR" | "EN" | "ES";
  contentCommand?: TiptapContentCommand | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extrait le texte brut du JSON Tiptap de façon récursive. */
function extractText(node: Record<string, unknown>): string {
  if (node.type === "text") return (node.text as string) ?? "";
  if (!Array.isArray(node.content)) return "";
  return (node.content as Record<string, unknown>[])
    .map(extractText)
    .join(node.type === "paragraph" || node.type === "heading" ? "\n" : "");
}

function jsonToPlainText(json: TiptapContent): string {
  if (!json) return "";
  return extractText(json as Record<string, unknown>)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function computeStats(plainText: string, characters: number): ContentStats {
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(words / 200));
  return { wordCount: words, readingTime, characters };
}

function emitEditorChange(
  editor: NonNullable<ReturnType<typeof useEditor>>,
  onChange: TiptapEditorProps["onChange"]
) {
  const json = editor.getJSON() as TiptapContent;
  const html = editor.getHTML();
  const plainText = jsonToPlainText(json);
  const characters = editor.storage.characterCount?.characters() ?? 0;
  const stats = computeStats(plainText, characters);
  onChange({ editorJson: json, html, plainText, stats });
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function TiptapEditor({
  initialContent,
  onChange,
  readOnly = false,
  placeholder = "Commencez à rédiger votre article…",
  locale = "FR",
  contentCommand = null,
}: TiptapEditorProps) {
  // Ref pour éviter les calls onChange pendant le chargement initial
  const isInitialized = useRef(false);
  const lastCommandId = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactive ceux qu'on va overrider
        heading: { levels: [2, 3] },
        codeBlock: {},
        blockquote: {},
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tiptap-link",
          rel: "noopener noreferrer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "tiptap-image" },
      }),
      PlaceholderExtension.configure({
        placeholder,
        emptyEditorClass: "tiptap-is-empty",
      }),
      CharacterCount,
      CalloutExtension,
      CTABlockExtension,
    ],
    content: initialContent ?? undefined,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "tiptap-content",
        spellcheck: "true",
        "data-gramm": "false",
      },
    },
    onUpdate: ({ editor }) => {
      if (!isInitialized.current) return;
      emitEditorChange(editor, onChange);
    },
  });

  // Marquer comme initialisé après le premier rendu
  useEffect(() => {
    if (editor && !isInitialized.current) {
      const timer = setTimeout(() => {
        isInitialized.current = true;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [editor]);

  // Mettre à jour le contenu si l'initialContent change (ex: rechargement de page)
  // On utilise setContent sans options — l'isInitialized guard évite le onChange parasite
  useEffect(() => {
    if (!editor || isInitialized.current) return;
    if (initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (!editor || !contentCommand || !isInitialized.current) return;
    if (lastCommandId.current === contentCommand.id) return;

    lastCommandId.current = contentCommand.id;
    if (contentCommand.mode === "replace") {
      editor.commands.setContent(contentCommand.html);
    } else {
      editor.commands.insertContent(contentCommand.html);
    }
    emitEditorChange(editor, onChange);
  }, [contentCommand, editor, onChange]);

  // Destroy proprement
  useEffect(() => {
    return () => {
      // L'éditeur se détruit automatiquement via useEditor
    };
  }, []);

  const wordCount = editor?.storage.characterCount?.words() ?? 0;
  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className={`tiptap-wrapper ${readOnly ? "tiptap-wrapper--readonly" : ""}`}>
      {!readOnly && <TiptapToolbar editor={editor} locale={locale} />}
      <EditorContent
        editor={editor}
        className="tiptap-editor-content"
      />
      {!readOnly && (
        <div className="tiptap-footer">
          <span className="tiptap-footer__stat">
            {wordCount} mot{wordCount !== 1 ? "s" : ""}
          </span>
          <span className="tiptap-footer__stat">
            {charCount} caractère{charCount !== 1 ? "s" : ""}
          </span>
          {wordCount > 0 && (
            <span className="tiptap-footer__stat">
              ~{Math.max(1, Math.round(wordCount / 200))} min de lecture
            </span>
          )}
        </div>
      )}
    </div>
  );
}
