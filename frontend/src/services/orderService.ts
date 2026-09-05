import { apiClient } from "../lib/apiClient";
import type { PageResponse } from "../lib/utils";
import type { SalesOrder, SalesOrderInput, SalesOrderStatus } from "../types/order";

export async function getOrders(params: {
  page?: number;
  size?: number;
  status?: SalesOrderStatus;
  customerId?: number;
  search?: string;
}): Promise<PageResponse<SalesOrder>> {
  const response = await apiClient.get<PageResponse<SalesOrder>>("/orders", { params });
  return response.data;
}

export async function getOrder(id: number): Promise<SalesOrder> {
  const response = await apiClient.get<SalesOrder>(`/orders/${id}`);
  return response.data;
}

export async function createOrder(data: SalesOrderInput): Promise<SalesOrder> {
  const response = await apiClient.post<SalesOrder>("/orders", data);
  return response.data;
}

export async function updateOrder(id: number, data: SalesOrderInput): Promise<SalesOrder> {
  const response = await apiClient.put<SalesOrder>(`/orders/${id}`, data);
  return response.data;
}

export async function confirmOrder(id: number): Promise<SalesOrder> {
  const response = await apiClient.post<SalesOrder>(`/orders/${id}/confirm`);
  return response.data;
}

export async function cancelOrder(id: number): Promise<SalesOrder> {
  const response = await apiClient.post<SalesOrder>(`/orders/${id}/cancel`);
  return response.data;
}
