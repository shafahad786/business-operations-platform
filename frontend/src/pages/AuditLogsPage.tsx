import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PageCard from "../components/ui/PageCard";
import Pagination from "../components/ui/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import { getAuditLogs } from "../services/auditLogService";
import type { AuditAction, AuditLog } from "../types/auditLog";
import { formatDateTime, getErrorMessage } from "../lib/utils";

const AUDIT_ACTIONS: AuditAction[] = [
  "CUSTOMER_CREATED",
  "CUSTOMER_UPDATED",
  "CUSTOMER_DELETED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "PRODUCT_DEACTIVATED",
  "STOCK_ADDED",
  "STOCK_REMOVED",
  "STOCK_ADJUSTED",
  "ORDER_CREATED",
  "ORDER_UPDATED",
  "ORDER_CONFIRMED",
  "ORDER_CANCELLED",
  "INVOICE_CREATED",
  "INVOICE_CANCELLED",
  "PAYMENT_RECORDED",
  "LOGIN_SUCCESS",
  "LOGIN_FAILURE",
  "SYSTEM",
];

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

  if (
    action.includes("UPDATED") ||
    action.includes("ADJUSTED")
  ) {
    return "warning";
  }

  return "neutral";
}

function formatAction(action: string) {
  return action.replaceAll("_", " ");
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [username, setUsername] = useState("");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAuditLogs({
        page,
        size: 15,
        action: (action as AuditAction) || undefined,
        entityType: entityType || undefined,
        username: username || undefined,
        search: query || undefined,
      });

      setLogs(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to load audit logs")
      );
    } finally {
      setLoading(false);
    }
  }, [action, entityType, page, query, username]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <section>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-900/60">
            <Search className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Audit logs
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Track who changed what across the business system.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <PageCard
        title="Filter audit activity"
        description="Narrow the audit trail by action, user, entity, or keyword."
      >
        <form
          className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();

            setPage(0);
            setQuery(search.trim());
          }}
        >
          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="">All actions</option>

            {AUDIT_ACTIONS.map((item) => (
              <option key={item} value={item}>
                {formatAction(item)}
              </option>
            ))}
          </select>

          <input
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setPage(0);
            }}
            placeholder="Entity type"
            className={inputClass}
          />

          <input
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setPage(0);
            }}
            placeholder="User"
            className={inputClass}
          />

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search description or entity"
              className={`${inputClass} pl-9`}
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Apply
          </button>
        </form>
      </PageCard>

      {/* Audit trail */}
      <PageCard
        title="Audit trail"
        description={
          !loading && !error
            ? `${logs.length} ${logs.length === 1 ? "activity" : "activities"} shown`
            : undefined
        }
      >
        {loading ? (
          <LoadingState message="Loading audit logs..." />
        ) : null}

        {!loading && error ? (
          <ErrorState
            message={error}
            onRetry={() => void loadLogs()}
          />
        ) : null}

        {!loading && !error && logs.length === 0 ? (
          <EmptyState
            title="No audit logs found"
            description="Try adjusting your filters to find more activity."
          />
        ) : null}

        {!loading && !error && logs.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-[1000px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      Timestamp
                    </th>

                    <th className="px-4 py-3 font-medium">
                      User
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Action
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Entity
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Description
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                        {formatDateTime(log.timestamp)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {log.username}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          label={formatAction(log.action)}
                          tone={actionTone(log.action)}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {log.entityType}
                          </span>

                          {log.entityId ? (
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-500">
                              #{log.entityId}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="max-w-xl px-4 py-3 text-slate-700 dark:text-slate-300">
                        <p className="leading-6">
                          {log.description}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="mt-5">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </PageCard>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500";

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500";