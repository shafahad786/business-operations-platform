import {
  Bell,
  CheckCheck,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageCard from "../components/ui/PageCard";
import Pagination from "../components/ui/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import type { Notification } from "../types/notification";
import {
  formatDateTime,
  getErrorMessage,
} from "../lib/utils";

function notificationLink(
  notification: Notification
): string | null {
  if (
    !notification.referenceEntityType ||
    !notification.referenceEntityId
  ) {
    return null;
  }

  switch (notification.referenceEntityType) {
    case "SalesOrder":
      return `/app/orders/${notification.referenceEntityId}`;

    case "Invoice":
      return `/app/invoices/${notification.referenceEntityId}`;

    case "Product":
      return "/app/products";

    default:
      return null;
  }
}

function getReferenceLabel(
  notification: Notification
): string | null {
  if (
    !notification.referenceEntityType ||
    !notification.referenceEntityId
  ) {
    return null;
  }

  switch (notification.referenceEntityType) {
    case "SalesOrder":
      return `Order #${notification.referenceEntityId}`;

    case "Invoice":
      return `Invoice #${notification.referenceEntityId}`;

    case "Product":
      return `Product #${notification.referenceEntityId}`;

    default:
      return null;
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getNotifications(page, 15);

      setNotifications(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load notifications"
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (
    notification: Notification
  ) => {
    try {
      if (!notification.read) {
        await markNotificationRead(notification.id);

        toast.success("Notification marked as read");

        await loadNotifications();
      }

      const link = notificationLink(notification);

      if (link) {
        navigate(link);
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to update notification"
        )
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();

      toast.success(
        "All notifications marked as read"
      );

      await loadNotifications();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to mark all as read"
        )
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);

      toast.success("Notification deleted");

      await loadNotifications();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to delete notification"
        )
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-900/60">
            <Bell className="h-5 w-5" />

            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Notifications
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your in-app alerts and business updates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleMarkAllRead()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </section>

      {/* Notifications */}
      <PageCard
        title="All notifications"
        description={
          !loading && !error
            ? unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }`
              : "You're all caught up"
            : undefined
        }
      >
        {loading ? (
          <LoadingState message="Loading notifications..." />
        ) : null}

        {!loading && error ? (
          <ErrorState
            message={error}
            onRetry={() => void loadNotifications()}
          />
        ) : null}

        {!loading &&
        !error &&
        notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up. New business alerts will appear here."
          />
        ) : null}

        {!loading &&
        !error &&
        notifications.length > 0 ? (
          <>
            <div className="space-y-3">
              {notifications.map((notification) => {
                const referenceLabel =
                  getReferenceLabel(notification);

                return (
                  <div
                    key={notification.id}
                    className={`group relative overflow-hidden rounded-2xl border p-4 transition-all ${
                      notification.read
                        ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                        : "border-blue-200 bg-blue-50/50 shadow-sm hover:border-blue-300 dark:border-blue-900/60 dark:bg-blue-950/30 dark:hover:border-blue-800"
                    }`}
                  >
                    {!notification.read ? (
                      <span className="absolute bottom-0 left-0 top-0 w-1 bg-blue-600 dark:bg-blue-500" />
                    ) : null}

                    <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              notification.read
                                ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                            }`}
                          >
                            <Bell className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className={`font-semibold ${
                                  notification.read
                                    ? "text-slate-800 dark:text-slate-200"
                                    : "text-slate-900 dark:text-white"
                                }`}
                              >
                                {notification.title}
                              </p>

                              {!notification.read ? (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                  New
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {notification.message}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                              <span>
                                {formatDateTime(
                                  notification.createdAt
                                )}
                              </span>

                              {referenceLabel ? (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />

                                  <span className="font-medium text-slate-500 dark:text-slate-400">
                                    {referenceLabel}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                        <button
                          type="button"
                          onClick={() =>
                            void handleMarkRead(
                              notification
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          {notification.read ? (
                            <>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open
                            </>
                          ) : (
                            <>
                              <CheckCheck className="h-3.5 w-3.5" />
                              Mark read
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(
                              notification.id
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                          aria-label="Delete notification"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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