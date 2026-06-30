import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  meta?: string;
  description?: string;
  action?: { href: string; label: string };
  children?: ReactNode;
};

export default function AdminPageHeader({
  title,
  meta,
  description,
  action,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="admin-page__header">
      <div>
        <h1 className="admin-page__title">{title}</h1>
        {meta ? <p className="admin-page__meta">{meta}</p> : null}
        {description ? <p className="admin-page__desc">{description}</p> : null}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {children}
        {action ? (
          <Link href={action.href} className="admin-btn admin-btn--primary">
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
