import type { PageResponse } from "../lib/utils";
import type { Notification, UnreadCount } from "../types/notification";
import { apiClient } from "../lib/apiClient";

export async function getNotifications(page = 0, size = 20) {
  const { data } = await apiClient.get<PageResponse<Notification>>("/notifications", {
    params: { page, size },
  });
  return data;
}

export async function getUnreadCount() {
  const { data } = await apiClient.get<UnreadCount>("/notifications/unread-count");
  return data;
}

export async function markNotificationRead(id: number) {
  const { data } = await apiClient.put<Notification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  await apiClient.put("/notifications/read-all");
}

export async function deleteNotification(id: number) {
  await apiClient.delete(`/notifications/${id}`);
}
