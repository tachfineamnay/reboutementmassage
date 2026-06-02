"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminRouteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <main id="admin-content" className="admin-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
