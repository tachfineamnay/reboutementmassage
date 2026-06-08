"use client";

import { useRef, useState } from "react";

type MediaAsset = {
  id: string;
  url: string;
  filename: string;
};

type ImageUploaderProps = {
  currentImage?: string | null;
  onUpload: (asset: MediaAsset) => void;
  label?: string;
};

export default function ImageUploader({
  currentImage,
  onUpload,
  label = "Image de couverture",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Fichier non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 5 Mo).");
      return;
    }

    setError(null);
    setLoading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l'upload");
      }

      const asset: MediaAsset = await res.json();
      onUpload(asset);
      setPreview(asset.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setPreview(currentImage ?? null);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="image-uploader">
      <label className="admin-label">{label}</label>

      <div
        className={`image-uploader__zone ${loading ? "image-uploader__zone--loading" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label={`Uploader ${label}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="image-uploader__preview" />
        ) : (
          <div className="image-uploader__placeholder">
            <span className="image-uploader__icon">🖼</span>
            <span className="image-uploader__hint">
              Glissez une image ou cliquez pour sélectionner
            </span>
            <span className="image-uploader__formats">
              JPG, PNG, WebP — max 5 Mo
            </span>
          </div>
        )}

        {loading && (
          <div className="image-uploader__overlay">
            <span className="image-uploader__spinner" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="image-uploader__input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="admin-error">{error}</p>}

      {preview && !loading && (
        <button
          type="button"
          className="image-uploader__remove"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            onUpload({ id: "", url: "", filename: "" });
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Supprimer l&apos;image
        </button>
      )}
    </div>
  );
}
