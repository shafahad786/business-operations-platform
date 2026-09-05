import { apiClient } from "../lib/apiClient";
import type { PageResponse } from "../lib/utils";
import type { Product, ProductInput } from "../types/product";

export async function getProducts(params: {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  active?: boolean;
}): Promise<PageResponse<Product>> {
  const response = await apiClient.get<PageResponse<Product>>("/products", { params });
  return response.data;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const response = await apiClient.post<Product>("/products", data);
  return response.data;
}

export async function updateProduct(id: number, data: ProductInput): Promise<Product> {
  const response = await apiClient.put<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
