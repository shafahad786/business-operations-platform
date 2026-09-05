import type {
  DashboardLowStock,
  DashboardRecentOrder,
  DashboardRecentPayment,
  DashboardSummary,
  MonthlySales,
} from "../types/dashboard";
import { apiClient } from "../lib/apiClient";

export async function getDashboardSummary() {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function getSalesSummary() {
  const { data } = await apiClient.get<MonthlySales[]>("/dashboard/sales-summary");
  return data;
}

export async function getRecentOrders() {
  const { data } = await apiClient.get<DashboardRecentOrder[]>("/dashboard/recent-orders");
  return data;
}

export async function getRecentPayments() {
  const { data } = await apiClient.get<DashboardRecentPayment[]>("/dashboard/recent-payments");
  return data;
}

export async function getLowStock() {
  const { data } = await apiClient.get<DashboardLowStock[]>("/dashboard/low-stock");
  return data;
}
