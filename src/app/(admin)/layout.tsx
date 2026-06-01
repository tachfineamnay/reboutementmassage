import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/Sidebar";
import "../globals.css";

/**
 * Layout des routes admin protégées (hors /admin/login).
 * La page /admin/login gère son propre <html><body>.
 *
 * Le middleware est la première barrière. Ce layout est une
 * deuxième vérification côté serveur (defense in depth).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <html lang="fr">
      <body className="admin-body">
        <div className="admin-shell">
          {/* Sidebar navigation */}
          <AdminSidebar />

          {/* Contenu principal */}
          <div className="admin-main">
            <main id="admin-content" className="admin-content" tabIndex={-1}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
