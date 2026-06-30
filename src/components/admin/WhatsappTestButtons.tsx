"use client";

export default function WhatsappTestButtons({
  waLink,
  waMeShort,
}: {
  waLink: string;
  waMeShort: string;
}) {
  function handleCopy() {
    navigator.clipboard.writeText(waMeShort);
    alert("Lien wa.me copié dans le presse-papiers !");
  }

  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="admin-btn admin-btn--ghost"
        style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
      >
        📲 Tester le lien WhatsApp
      </a>
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        onClick={handleCopy}
      >
        📋 Copier wa.me
      </button>
    </div>
  );
}
