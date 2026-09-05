import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getNotifications,
  getUnreadCount,
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

export default function NotificationBell() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getNotifications(0, 8);
      setNotifications(response.content);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUnreadCount();

    const interval = window.setInterval(
      () => void refreshUnreadCount(),
      60000
    );

    return () => window.clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadNotifications();
  }, [open, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleMarkRead = async (
    notification: Notification
  ) => {
    try {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        await refreshUnreadCount();

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, read: true }
              : item
          )
        );
      }

      const link = notificationLink(notification);

      if (link) {
        setOpen(false);
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

      setUnreadCount(0);

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read: true,
        }))
      );

      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to mark notifications read"
        )
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Notification button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
          open
            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-400"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white"
        }`}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        title="Notifications"
      >
        <Bell
          className={`h-4.5 w-4.5 transition-transform ${
            open ? "scale-105" : ""
          }`}
        />

        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {/* Dropdown */}
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>

          {/* Notification list */}
          <div className="max-h-[24rem] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Bell className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                  No notifications yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Business alerts and updates will appear
                  here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const referenceLabel =
                  getReferenceLabel(notification);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      void handleMarkRead(notification)
                    }
                    className={`relative w-full border-b px-4 py-3.5 text-left transition-colors last:border-b-0 ${
                      notification.read
                        ? "border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                        : "border-blue-100 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
                    }`}
                  >
                    {!notification.read ? (
                      <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-600 dark:bg-blue-500" />
                    ) : null}

                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          notification.read
                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              notification.read
                                ? "text-slate-800 dark:text-slate-200"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {notification.title}
                          </p>

                          {!notification.read ? (
                            <span
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                              aria-label="Unread"
                            />
                          ) : null}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
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
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50">
            <Link
              to="/app/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              View all notifications
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}