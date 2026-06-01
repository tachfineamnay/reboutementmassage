"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";

type ToolbarProps = {
  editor: Editor | null;
};

type LinkModalState = { open: boolean; url: string };
type ImageModalState = { open: boolean; url: string; alt: string };

// ─── Composant bouton de la toolbar ──────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tiptap-btn ${active ? "tiptap-btn--active" : ""} ${disabled ? "tiptap-btn--disabled" : ""}`}
      disabled={disabled}
      title={title}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="tiptap-sep" aria-hidden="true" />;
}

// ─── Toolbar principale ───────────────────────────────────────────────────────

export default function TiptapToolbar({ editor }: ToolbarProps) {
  const [linkModal, setLinkModal] = useState<LinkModalState>({ open: false, url: "" });
  const [imageModal, setImageModal] = useState<ImageModalState>({ open: false, url: "", alt: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    setLinkModal({ open: true, url: prev });
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const { url } = linkModal;
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
    }
    setLinkModal({ open: false, url: "" });
  }, [editor, linkModal]);

  const applyImage = useCallback(() => {
    if (!editor || !imageModal.url) return;
    editor.chain().focus().setImage({ src: imageModal.url, alt: imageModal.alt }).run();
    setImageModal({ open: false, url: "", alt: "" });
    setUploadError(null);
  }, [editor, imageModal]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "stories/inline");

      const res = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de l'upload.");
      }

      const asset = await res.json();
      setImageModal((s) => ({ ...s, url: asset.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  }, []);

  if (!editor) return null;

  return (
    <>
      <div className="tiptap-toolbar" role="toolbar" aria-label="Barre d'outils éditeur">
        {/* Paragraphe / Titres */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Paragraphe"
        >
          ¶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Titre H2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Titre H3"
        >
          H3
        </ToolbarButton>

        <Separator />

        {/* Mise en forme */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Gras (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italique (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Code inline"
        >
          {"</>"}
        </ToolbarButton>

        <Separator />

        {/* Listes */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          • —
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          1.
        </ToolbarButton>

        <Separator />

        {/* Citation */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citation"
        >
          ❝
        </ToolbarButton>

        {/* Code block */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Bloc de code"
        >
          {"{}"}
        </ToolbarButton>

        <Separator />

        {/* Lien */}
        <ToolbarButton
          onClick={openLinkModal}
          active={editor.isActive("link")}
          title="Insérer un lien"
        >
          🔗
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Supprimer le lien"
          >
            ✕🔗
          </ToolbarButton>
        )}

        {/* Image via URL */}
        <ToolbarButton
          onClick={() => setImageModal({ open: true, url: "", alt: "" })}
          title="Insérer une image"
        >
          🖼
        </ToolbarButton>

        <Separator />

        {/* Blocs custom */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().insertContent({
              type: "callout",
              attrs: { type: "info" },
              content: [{ type: "paragraph", content: [{ type: "text", text: "À retenir…" }] }],
            }).run()
          }
          active={editor.isActive("callout")}
          title="Bloc Callout"
        >
          💡
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().insertContent({
              type: "ctaBlock",
              attrs: {
                title: "Découvrez nos services",
                description: "",
                buttonLabel: "En savoir plus",
                buttonUrl: "/",
              },
            }).run()
          }
          active={editor.isActive("ctaBlock")}
          title="Bloc CTA"
        >
          ⬛ CTA
        </ToolbarButton>

        <Separator />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Annuler (Ctrl+Z)"
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Refaire (Ctrl+Y)"
        >
          ↪
        </ToolbarButton>
      </div>

      {/* Modal Lien */}
      {linkModal.open && (
        <div className="tiptap-modal-overlay" onClick={() => setLinkModal({ open: false, url: "" })}>
          <div className="tiptap-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label="Insérer un lien">
            <h3 className="tiptap-modal__title">Insérer un lien</h3>
            <input
              type="url"
              className="admin-input"
              placeholder="https://…"
              value={linkModal.url}
              autoFocus
              onChange={(e) => setLinkModal((s) => ({ ...s, url: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLink();
                if (e.key === "Escape") setLinkModal({ open: false, url: "" });
              }}
            />
            <div className="tiptap-modal__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setLinkModal({ open: false, url: "" })}>
                Annuler
              </button>
              <button className="admin-btn admin-btn--primary" onClick={applyLink}>
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Image URL & Upload */}
      {imageModal.open && (
        <div className="tiptap-modal-overlay" onClick={() => {
          setImageModal({ open: false, url: "", alt: "" });
          setUploadError(null);
        }}>
          <div className="tiptap-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label="Insérer une image">
            <h3 className="tiptap-modal__title">Insérer une image</h3>
            
            <div className="admin-field">
              <label className="admin-label">Téléverser une image locale</label>
              {uploading ? (
                <div style={{ padding: "8px 0", fontSize: "13px", color: "var(--admin-muted)" }}>
                  Téléversement en cours...
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="admin-input"
                  onChange={handleImageUpload}
                />
              )}
              {uploadError && <p className="admin-field-error" style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>{uploadError}</p>}
            </div>

            <div className="admin-field">
              <label className="admin-label">Ou URL de l&apos;image</label>
              <input
                type="url"
                className="admin-input"
                placeholder="https://…"
                value={imageModal.url}
                autoFocus
                onChange={(e) => setImageModal((s) => ({ ...s, url: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Texte alternatif</label>
              <input
                type="text"
                className="admin-input"
                placeholder="Description de l'image"
                value={imageModal.alt}
                onChange={(e) => setImageModal((s) => ({ ...s, alt: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyImage();
                  if (e.key === "Escape") setImageModal({ open: false, url: "", alt: "" });
                }}
              />
            </div>
            <div className="tiptap-modal__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setImageModal({ open: false, url: "", alt: "" })}>
                Annuler
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={applyImage}
                disabled={!imageModal.url}
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
