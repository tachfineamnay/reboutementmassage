"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const NAV_ITEMS = [
  { href: "/admin/overview", label: "Overview", icon: "◈", exact: false, primary: false },
  { href: "/admin/growth", label: "Growth Dashboard", icon: "◎", exact: false, primary: true },
  { href: "/admin/destinations", label: "Destinations", icon: "⌖", exact: false, primary: false },
  { href: "/admin/offers", label: "Offres", icon: "◇", exact: false, primary: false },
  { href: "/admin/landings", label: "Landings", icon: "◆", exact: false, primary: false },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: "☏", exact: false, primary: false },
  { href: "/admin/tracking", label: "Tracking", icon: "◉", exact: false, primary: false },
  { href: "/admin/crm-routing", label: "CRM Routing", icon: "⇄", exact: false, primary: false },
  { href: "/admin/testimonials", label: "Témoignages", icon: "❝", exact: false, primary: false },
  { href: "/admin/media", label: "Médias", icon: "▣", exact: false, primary: false },
  { href: "/admin/experiments", label: "Expériences", icon: "⚗", exact: false, primary: false },
  { href: "/admin/redirects", label: "Redirects", icon: "↪", exact: false, primary: false },
  { href: "/admin/seo-health", label: "SEO Health", icon: "⌕", exact: false, primary: false },
  { href: "/admin/health", label: "Health Check", icon: "♥", exact: false, primary: false },
  { href: "/admin/demandes", label: "Demandes", icon: "☎", exact: false, primary: false },
  { href: "/admin/settings", label: "Settings", icon: "⚙", exact: true, primary: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function isActive(item: (typeof NAV_ITEMS)[number]) {
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
        <Link href="/admin/growth" className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-icon">GT</span>
          <span className="admin-sidebar__logo-text">Growth</span>
        </Link>
      </div>

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
