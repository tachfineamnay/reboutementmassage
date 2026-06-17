type Status = "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";

type ArticleStatusBadgeProps = {
  status: Status;
};

const CONFIG: Record<Status, { label: string; className: string }> = {
  DRAFT:     { label: "À écrire",  className: "badge badge--draft" },
  READY:     { label: "À valider", className: "badge badge--ready" },
  PUBLISHED: { label: "Publié",    className: "badge badge--published" },
  ARCHIVED:  { label: "Archivé",   className: "badge badge--archived" },
};

export default function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
  const { label, className } = CONFIG[status] ?? CONFIG.DRAFT;
  return <span className={className}>{label}</span>;
}
