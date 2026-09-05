import type { PageResponse } from "../lib/utils";
import type { AuditAction, AuditLog } from "../types/auditLog";
import { apiClient } from "../lib/apiClient";

export type AuditLogFilters = {
  page?: number;
  size?: number;
  action?: AuditAction;
  entityType?: string;
  username?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
};

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const { data } = await apiClient.get<PageResponse<AuditLog>>("/audit-logs", { params: filters });
  return data;
}

export async function getAuditLog(id: number) {
  const { data } = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
  return data;
}
