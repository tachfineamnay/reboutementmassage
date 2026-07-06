import type { ReactNode } from "react";

export function AdminPage({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return <div className={`admin-page${wide ? " admin-page--wide" : ""}`}>{children}</div>;
}

export function AdminSection({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-section">
      {(title || action) && (
        <div className="admin-section__header">
          {title ? <h2 className="admin-section__title">{title}</h2> : <span />}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function AdminStatCard({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: string | number;
  href?: string;
  tone?: "green" | "amber" | "red";
}) {
  const className = [
    "kpi-card",
    href ? "kpi-card--link" : "",
    tone === "green" ? "kpi-card--green" : "",
    tone === "amber" ? "kpi-card--amber" : "",
    tone === "red" ? "kpi-card--red" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      <span className="kpi-card__value">{value}</span>
      <span className="kpi-card__label">{label}</span>
    </>
  );

  if (!href) return <div className={className}>{content}</div>;

  return (
    <a href={href} className={className}>
      {content}
    </a>
  );
}

export function AdminAlert({
  title,
  children,
  tone = "warn",
}: {
  title: string;
  children: ReactNode;
  tone?: "warn" | "danger";
}) {
  const color = tone === "danger" ? "#ef4444" : "#f59e0b";
  return (
    <div
      role="alert"
      style={{
        padding: "14px 16px",
        borderRadius: "8px",
        border: `1px solid ${color}`,
        background: tone === "danger" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.07)",
      }}
    >
      <h2 style={{ color, fontSize: "14px", margin: "0 0 8px", fontWeight: 700 }}>{title}</h2>
      {children}
    </div>
  );
}

export function AdminQuickActions({
  actions,
}: {
  actions: Array<{ href: string; label: string; primary?: boolean }>;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className={`admin-btn ${action.primary ? "admin-btn--primary" : "admin-btn--ghost"}`}
        >
          {action.label}
        </a>
      ))}
    </div>
  );
}

export function AdminStatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const className =
    tone === "success"
      ? "badge badge--published"
      : tone === "warning"
        ? "badge badge--draft"
        : tone === "danger"
          ? "badge badge--archived"
          : "badge";

  return <span className={className}>{label}</span>;
}

export function AdminDataTable({ children }: { children: ReactNode }) {
  return <div className="admin-table-wrapper">{children}</div>;
}

export function AdminEmptyState({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <p>{message}</p>
      {children}
    </div>
  );
}
