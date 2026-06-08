import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — GT Dash",
  robots: { index: false, follow: false },
};

// Layout minimal pour la page de login (pas de sidebar, pas d'auth check)
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="admin-login-body">{children}</body>
    </html>
  );
}
