"use client";

import { useEffect } from "react";

function isDbSchemaError(error: Error) {
  const message = error.message ?? "";
  const digest = (error as Error & { digest?: string }).digest ?? "";
  const combined = `${message} ${digest}`.toLowerCase();

  return (
    combined.includes("p2021") ||
    combined.includes("p2022") ||
    combined.includes("does not exist") ||
    combined.includes("landing_pages") ||
    combined.includes("destinations") ||
    combined.includes("relation") ||
    combined.includes("table")
  );
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const schemaError = isDbSchemaError(error);

  return (
    <div className="admin-page">
      <div className="admin-panel" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: 8 }}>
          {schemaError ? "Base de données non à jour" : "Erreur serveur"}
        </h1>

        <div className="admin-alert admin-alert--error" style={{ marginBottom: 16 }}>
          {schemaError ? (
            <>
              Les tables TMS Admin (Growth CMS) sont absentes ou incomplètes en
              production. Appliquez les migrations Prisma puis redéployez.
            </>
          ) : (
            <>Une erreur inattendue s&apos;est produite lors du chargement de cette page.</>
          )}
        </div>

        {schemaError && (
          <p style={{ fontSize: 13, color: "var(--admin-muted)", marginBottom: 16 }}>
            Commande sur le serveur :{" "}
            <code style={{ fontSize: 12 }}>pnpm exec prisma migrate deploy</code>
          </p>
        )}

        <button type="button" className="admin-btn admin-btn--primary" onClick={() => reset()}>
          Réessayer
        </button>
      </div>
    </div>
  );
}
