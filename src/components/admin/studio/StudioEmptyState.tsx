"use client";

export function StudioEmptyState({
  onInitialize,
  initializing,
}: {
  onInitialize: () => void;
  initializing: boolean;
}) {
  return (
    <div className="landing-studio-empty admin-panel">
      <h2 className="admin-panel__title">Créer une version Studio</h2>
      <p className="admin-page__meta">
        Cette landing a été créée avant Puck. Le rendu public reste inchangé tant qu&apos;une version Studio n&apos;est
        pas initialisée et sauvegardée en brouillon.
      </p>
      <button type="button" className="admin-btn admin-btn--primary" onClick={onInitialize} disabled={initializing}>
        {initializing ? "Création…" : "Créer une version Studio"}
      </button>
    </div>
  );
}
