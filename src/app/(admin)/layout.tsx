import AdminRouteShell from "@/components/admin/AdminRouteShell";
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="admin-body">
        <AdminRouteShell>{children}</AdminRouteShell>
      </body>
    </html>
  );
}
