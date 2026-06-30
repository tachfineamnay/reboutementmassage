type StatusTone = "draft" | "ready" | "live" | "paused" | "archived" | "running" | "completed" | "neutral";

type AdminStatusBadgeProps = {
  status: string;
  label?: string;
};

const STATUS_MAP: Record<string, { label: string; tone: StatusTone }> = {
  DRAFT: { label: "Brouillon", tone: "draft" },
  READY: { label: "Prêt", tone: "ready" },
  LIVE: { label: "Live", tone: "live" },
  PUBLISHED: { label: "Publié", tone: "live" },
  PAUSED: { label: "En pause", tone: "paused" },
  ARCHIVED: { label: "Archivé", tone: "archived" },
  RUNNING: { label: "En cours", tone: "running" },
  COMPLETED: { label: "Terminé", tone: "completed" },
  ACTIVE: { label: "Actif", tone: "live" },
  NOT_CONFIGURED: { label: "Non configuré", tone: "neutral" },
  APP_ONLY: { label: "App seule", tone: "neutral" },
  CONNECTED_GHL: { label: "GHL connecté", tone: "ready" },
  BLOCKED: { label: "Bloqué", tone: "archived" },
};

const TONE_CLASS: Record<StatusTone, string> = {
  draft: "badge badge--draft",
  ready: "badge badge--ready",
  live: "badge badge--published",
  paused: "badge badge--draft",
  archived: "badge badge--archived",
  running: "badge badge--published",
  completed: "badge badge--ready",
  neutral: "badge",
};

export default function AdminStatusBadge({ status, label }: AdminStatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: status, tone: "neutral" as const };
  return (
    <span className={TONE_CLASS[config.tone]}>
      {label ?? config.label}
    </span>
  );
}
