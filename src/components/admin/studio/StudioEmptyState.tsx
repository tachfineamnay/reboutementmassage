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
      <h2 className="admin-panel__title">Initialiser l&apos;éditeur visuel</h2>
      <p className="admin-page__meta">
        Cette landing a été créée avant Puck. Le rendu public reste inchangé tant qu&apos;une version builder
        n&apos;est pas initialisée et sauvegardée en brouillon. Ne pas utiliser pour les pages premium statiques.
      </p>
      <button type="button" className="admin-btn admin-btn--primary" onClick={onInitialize} disabled={initializing}>
        {initializing ? "Création…" : "Initialiser l'éditeur visuel"}
      </button>
    </div>
  );
}
