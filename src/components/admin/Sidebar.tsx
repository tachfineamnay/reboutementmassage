"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  primary?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: "◎", primary: true },
  { href: "/admin/demandes", label: "Demandes", icon: "☎" },
  { href: "/admin/pages", label: "Builder legacy", icon: "▦" },
  { href: "/admin/static-landings", label: "Landings statiques", icon: "◈" },
  { href: "/admin/landings", label: "Pages expert", icon: "◆" },
  { href: "/admin/offers", label: "Offres", icon: "◇" },
  { href: "/admin/destinations", label: "Destinations", icon: "⌖" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: "☏" },
  { href: "/admin/crm-routing", label: "Routage GHL", icon: "⇄" },
  { href: "/admin/tracking", label: "Tracking", icon: "◉" },
  { href: "/admin/testimonials", label: "Témoignages", icon: "❝" },
  { href: "/admin/media", label: "Médias", icon: "▣" },
  { href: "/admin/overview", label: "SEO", icon: "⌕", exact: true },
  { href: "/admin/health", label: "Santé technique", icon: "♥" },
  { href: "/admin/settings", label: "Réglages", icon: "⚙", exact: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
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
      <div className="admin-sidebar__brand">
        <Link href="/admin/dashboard" className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-icon">TMS</span>
          <span className="admin-sidebar__logo-text">TMS Admin</span>
        </Link>
      </div>

      <nav className="admin-sidebar__nav" aria-label="TMS Admin navigation">
        <div className="admin-sidebar__group">
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
        </div>
      </nav>

      <div className="admin-sidebar__footer">
        <Link href="/admin/articles" className="admin-sidebar__footer-link">
          <span>✦</span>
          <span>Studio Articles</span>
        </Link>
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
