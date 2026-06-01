"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GoogleImportButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/google/search-console/import", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'importation.");
      }
      if (data.status === "non_configure") {
        setStatus({
          type: "error",
          message: "API Google non configurée. Veuillez renseigner les variables d'environnement.",
        });
      } else {
        setStatus({
          type: "success",
          message: data.message || "Importation réussie !",
        });
        router.refresh();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur de connexion avec le serveur.";
      setStatus({
        type: "error",
        message: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--full"
        onClick={handleImport}
        disabled={loading}
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "⌛ Importation en cours..." : "📥 Importer données Google"}
      </button>
      {status && (
        <span
          style={{
            fontSize: "11px",
            color: status.type === "success" ? "var(--admin-green)" : "#f87171",
            textAlign: "center",
            marginTop: "2px",
            display: "block",
            whiteSpace: "pre-wrap",
            padding: "4px",
            background: status.type === "success" ? "rgba(34,197,94,0.05)" : "rgba(248,113,113,0.05)",
            borderRadius: "4px",
            border: status.type === "success" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(248,113,113,0.2)",
          }}
        >
          {status.message}
        </span>
      )}
    </div>
  );
}
