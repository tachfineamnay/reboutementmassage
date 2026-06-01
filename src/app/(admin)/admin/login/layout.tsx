import "@/app/globals.css";

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
