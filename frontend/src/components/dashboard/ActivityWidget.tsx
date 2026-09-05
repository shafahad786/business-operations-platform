import type { AuditLog } from "../../types/auditLog";
import StatusBadge from "../ui/StatusBadge";
import { formatDateTime } from "../../lib/utils";

type ActivityWidgetProps = {
  logs: AuditLog[];
  loading?: boolean;
};

function actionTone(
  action: string
): "success" | "warning" | "danger" | "neutral" {
  if (
    action.includes("CREATED") ||
    action.includes("CONFIRMED") ||
    action.includes("SUCCESS")
  ) {
    return "success";
  }

  if (
    action.includes("DELETED") ||
    action.includes("CANCELLED") ||
    action.includes("FAILURE")
  ) {
    return "danger";
  }

  if (action.includes("UPDATED") || action.includes("ADJUSTED")) {
    return "warning";
  }

  return "neutral";
}

export default function ActivityWidget({
  logs,
  loading,
}: ActivityWidgetProps) {
  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No recent activity.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="rounded-lg border border-slate-200 px-3 py-3 transition-colors dark:border-slate-700"
        >
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={log.action.replaceAll("_", " ")}
              tone={actionTone(log.action)}
            />

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDateTime(log.timestamp)}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
            {log.description}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {log.username} · {log.entityType}
            {log.entityId ? ` #${log.entityId}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}