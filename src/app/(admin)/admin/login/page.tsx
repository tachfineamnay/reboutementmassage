"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand__icon">GT Dash</span>
          <span className="login-brand__sub">Cockpit business</span>
        </div>

        <h1 className="login-title">Connexion</h1>

        <form action={action} className="login-form" noValidate>
          {/* Erreur serveur */}
          {state?.error && (
            <div
              className="admin-alert admin-alert--error"
              role="alert"
              aria-live="polite"
            >
              {state.error}
            </div>
          )}

          {/* Email */}
          <div className="admin-field">
            <label className="admin-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              className="admin-input"
              placeholder="admin@votre-domaine.fr"
              aria-invalid={!!state?.error}
              disabled={isPending}
            />
          </div>

          {/* Mot de passe */}
          <div className="admin-field">
            <label className="admin-label" htmlFor="login-password">
              Mot de passe
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="admin-input"
              placeholder="••••••••"
              aria-invalid={!!state?.error}
              disabled={isPending}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--full"
            disabled={isPending}
          >
            {isPending ? (
              <span className="login-btn-inner">
                <span className="login-spinner" aria-hidden="true" />
                Connexion en cours…
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
