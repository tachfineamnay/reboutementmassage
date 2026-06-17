"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const NAV_ITEMS = [
  {
    href: "/admin/overview",
    label: "Overview",
    icon: "◈",
    exact: false,
    primary: false,
  },
  {
    href: "/admin/articles",
    label: "Studio Articles",
    icon: "✦",
    exact: false,
    primary: true,
  },
  {
    href: "/admin/demandes",
    label: "Demandes",
    icon: "☎",
    exact: false,
    primary: false,
  },
  {
    href: "/admin/sections",
    label: "Landing Sections",
    icon: "⊞",
    exact: false,
    primary: false,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: "⚙",
    exact: true,
    primary: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    // Pour /admin/articles, ne pas activer si on est sur /admin/articles/new
    if (item.href === "/admin/articles") {
      return pathname.startsWith("/admin/articles");
    }
    return pathname.startsWith(item.href);
  }

  async function handleLogout() {
    startTransition(async () => {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    });
  }

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="admin-sidebar__brand">
        <Link href="/admin/overview" className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-icon">GT</span>
          <span className="admin-sidebar__logo-text">Dash</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav" aria-label="Navigation admin">
        <ul className="admin-sidebar__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="admin-sidebar__item">
              <Link
                href={item.href}
                className={`admin-sidebar__link ${
                  isActive(item) ? "admin-sidebar__link--active" : ""
                } ${item.primary ? "admin-sidebar__link--primary" : "admin-sidebar__link--secondary"}`}
              >
                <span className="admin-sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="admin-sidebar__footer">
        <a
          href="/fr"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-sidebar__footer-link"
        >
          <span>↗</span>
          <span>Voir le site</span>
        </a>

        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={handleLogout}
          disabled={isPending}
          aria-label="Se déconnecter"
        >
          <span aria-hidden="true">{isPending ? "…" : "⏻"}</span>
          <span>{isPending ? "Déconnexion…" : "Déconnexion"}</span>
        </button>
      </div>
    </aside>
  );
}
