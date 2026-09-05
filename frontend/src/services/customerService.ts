import { apiClient } from "../lib/apiClient";
import type { PageResponse } from "../lib/utils";
import type { Customer, CustomerInput } from "../types/customer";

export async function getCustomers(params: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<PageResponse<Customer>> {
  const response = await apiClient.get<PageResponse<Customer>>("/customers", { params });
  return response.data;
}

export async function getCustomer(id: number): Promise<Customer> {
  const response = await apiClient.get<Customer>(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(data: CustomerInput): Promise<Customer> {
  const response = await apiClient.post<Customer>("/customers", data);
  return response.data;
}

export async function updateCustomer(id: number, data: CustomerInput): Promise<Customer> {
  const response = await apiClient.put<Customer>(`/customers/${id}`, data);
  return response.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}
