"use client";

import { useMemo, useState, useTransition } from "react";

type ArticleJsonLdEditorProps = {
  articleId: string;
  initialValue: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidJsonLdRoot(value: unknown) {
  return Array.isArray(value) || isPlainObject(value);
}

function stringifyInitialValue(value: unknown) {
  if (!isValidJsonLdRoot(value)) return "";
  if (Array.isArray(value) && value.length === 0) return "";
  return JSON.stringify(value, null, 2);
}

function parseCustomJsonLd(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const parsed = JSON.parse(trimmed) as unknown;
  if (!isValidJsonLdRoot(parsed)) {
    throw new Error("Le JSON-LD doit être un objet ou un tableau d'objets.");
  }

  return parsed;
}

const EXAMPLE_JSON_LD = `{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Thérapie manuelle et reboutement français à Sayulita",
  "provider": {
    "@type": "Person",
    "name": "Grégory Tordjman"
  },
  "areaServed": {
    "@type": "Place",
    "name": "Sayulita, Nayarit, Mexique"
  }
}`;

export default function ArticleJsonLdEditor({
  articleId,
  initialValue,
}: ArticleJsonLdEditorProps) {
  const [isPending, startTransition] = useTransition();
  const initialText = useMemo(() => stringifyInitialValue(initialValue), [initialValue]);
  const [rawJsonLd, setRawJsonLd] = useState(initialText);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const parsedPreview = useMemo(() => {
    try {
      parseCustomJsonLd(rawJsonLd);
      return rawJsonLd.trim() ? "JSON-LD valide" : "Aucun JSON-LD personnalisé";
    } catch (parseError) {
      return parseError instanceof Error ? parseError.message : "JSON invalide";
    }
  }, [rawJsonLd]);

  function formatJson() {
    try {
      const parsed = parseCustomJsonLd(rawJsonLd || EXAMPLE_JSON_LD);
      setRawJsonLd(JSON.stringify(parsed, null, 2));
      setError("");
      setMessage("JSON formaté.");
    } catch (parseError) {
      setMessage("");
      setError(parseError instanceof Error ? parseError.message : "JSON invalide");
    }
  }

  function saveJsonLd() {
    setMessage("");
    setError("");

    let customJsonLd: unknown;
    try {
      customJsonLd = parseCustomJsonLd(rawJsonLd);
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "JSON invalide");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/admin/articles/${articleId}/schema`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customJsonLd }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error || "Erreur lors de la sauvegarde du JSON-LD.");
        return;
      }

      setMessage("Schema JSON-LD sauvegardé. Il sera injecté sur la page publiée.");
    });
  }

  return (
    <section className="admin-panel" style={{ marginTop: "24px" }}>
      <div className="seo-panel__heading">
        <div>
          <p className="seo-panel__eyebrow">Schema personnalisé</p>
          <h3 className="seo-panel__title">JSON-LD additionnel</h3>
        </div>
        <p className="seo-panel__note">
          Ajoutez un objet ou un tableau JSON-LD. Le code est validé avant sauvegarde.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="article-custom-jsonld">
          Schema JSON-LD
          <span className="admin-label__optional">Article, Service, Event, Course, FAQPage…</span>
        </label>
        <textarea
          id="article-custom-jsonld"
          className="admin-input"
          rows={16}
          value={rawJsonLd}
          onChange={(event) => {
            setRawJsonLd(event.target.value);
            setMessage("");
            setError("");
          }}
          placeholder={EXAMPLE_JSON_LD}
          spellCheck={false}
          style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px", lineHeight: 1.6 }}
        />
        <span className={`admin-hint ${parsedPreview.includes("invalide") || parsedPreview.includes("doit") ? "admin-hint--warn" : ""}`}>
          {parsedPreview}
        </span>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={formatJson}
          disabled={isPending}
        >
          Formater / tester
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => {
            setRawJsonLd("");
            setMessage("JSON-LD vidé. Sauvegardez pour le retirer de la page.");
            setError("");
          }}
          disabled={isPending}
        >
          Vider
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={saveJsonLd}
          disabled={isPending}
        >
          {isPending ? "Sauvegarde…" : "Sauvegarder le JSON-LD"}
        </button>
      </div>

      {message && <p className="admin-hint" style={{ marginTop: "12px" }}>✓ {message}</p>}
      {error && <p className="admin-hint admin-hint--warn" style={{ marginTop: "12px" }}>⚠ {error}</p>}
    </section>
  );
}
