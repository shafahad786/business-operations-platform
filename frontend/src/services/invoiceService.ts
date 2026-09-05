import { apiClient } from "../lib/apiClient";
import type { PageResponse } from "../lib/utils";
import type { Invoice, InvoiceStatus, Payment, PaymentInput } from "../types/invoice";

export type InvoiceListParams = {
  page?: number;
  size?: number;
  status?: InvoiceStatus;
  customerId?: number;
  search?: string;
};

export async function getInvoices(params: InvoiceListParams = {}): Promise<PageResponse<Invoice>> {
  const response = await apiClient.get<PageResponse<Invoice>>("/invoices", { params });
  return response.data;
}

export async function getInvoice(id: number): Promise<Invoice> {
  const response = await apiClient.get<Invoice>(`/invoices/${id}`);
  return response.data;
}

export async function getInvoiceByOrderId(orderId: number): Promise<Invoice> {
  const response = await apiClient.get<Invoice>(`/invoices/by-order/${orderId}`);
  return response.data;
}

export async function generateInvoiceFromOrder(orderId: number): Promise<Invoice> {
  const response = await apiClient.post<Invoice>(`/invoices/from-order/${orderId}`);
  return response.data;
}

export async function cancelInvoice(id: number): Promise<Invoice> {
  const response = await apiClient.post<Invoice>(`/invoices/${id}/cancel`);
  return response.data;
}

export async function recordPayment(invoiceId: number, data: PaymentInput): Promise<Payment> {
  const response = await apiClient.post<Payment>(`/invoices/${invoiceId}/payments`, data);
  return response.data;
}

export async function getPayments(invoiceId: number): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>(`/invoices/${invoiceId}/payments`);
  return response.data;
}
