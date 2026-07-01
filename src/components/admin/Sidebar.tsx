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

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ href: "/admin/growth", label: "Overview", icon: "◎", primary: true }],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/landings", label: "Pages", icon: "◆" },
      { href: "/admin/media", label: "Media Library", icon: "▣" },
      { href: "/admin/testimonials", label: "Testimonials", icon: "❝" },
      { href: "/admin/seo-health", label: "SEO", icon: "⌕" },
      { href: "/admin/redirects", label: "Redirects", icon: "↪" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/offers", label: "Offers", icon: "◇" },
      { href: "/admin/experiments", label: "Experiments", icon: "⚗" },
      { href: "/admin/tracking", label: "Analytics", icon: "◉" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/destinations", label: "Destinations", icon: "⌖" },
      { href: "/admin/whatsapp", label: "WhatsApp", icon: "☏" },
      { href: "/admin/crm-routing", label: "Lead Routing", icon: "⇄" },
    ],
  },
  {
    label: "CRM",
    items: [{ href: "/admin/demandes", label: "Leads", icon: "☎" }],
  },
  {
    label: "System",
    items: [
      { href: "/admin/health", label: "Diagnostics", icon: "♥" },
      { href: "/admin/settings", label: "Settings", icon: "⚙", exact: true },
    ],
  },
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
        <Link href="/admin/growth" className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-icon">PA</span>
          <span className="admin-sidebar__logo-text">Platform Admin</span>
        </Link>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Platform Admin navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label ?? "overview"} className="admin-sidebar__group">
            {group.label && (
              <p className="admin-sidebar__group-label">{group.label}</p>
            )}
            <ul className="admin-sidebar__list">
              {group.items.map((item) => (
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
        ))}
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
