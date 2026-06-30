import Link from "next/link";
import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  message: string;
  action?: { href: string; label: string };
  children?: ReactNode;
};

export default function AdminEmptyState({ message, action, children }: AdminEmptyStateProps) {
  return (
    <div className="admin-empty">
      <p>{message}</p>
      {children}
      {action ? (
        <Link href={action.href} className="admin-btn admin-btn--primary">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
