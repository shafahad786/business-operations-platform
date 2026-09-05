import { apiClient } from "../lib/apiClient";
import type {
  InventoryItem,
  InventoryMovement,
  StockAdjustInput,
  StockChangeInput,
} from "../types/inventory";

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await apiClient.get<InventoryItem[]>("/inventory");
  return response.data;
}

export async function getLowStockInventory(): Promise<InventoryItem[]> {
  const response = await apiClient.get<InventoryItem[]>("/inventory/low-stock");
  return response.data;
}

export async function getInventoryByProduct(productId: number): Promise<InventoryItem> {
  const response = await apiClient.get<InventoryItem>(`/inventory/${productId}`);
  return response.data;
}

export async function addStock(productId: number, data: StockChangeInput): Promise<InventoryItem> {
  const response = await apiClient.post<InventoryItem>(`/inventory/${productId}/add`, data);
  return response.data;
}

export async function removeStock(
  productId: number,
  data: StockChangeInput
): Promise<InventoryItem> {
  const response = await apiClient.post<InventoryItem>(`/inventory/${productId}/remove`, data);
  return response.data;
}

export async function adjustStock(
  productId: number,
  data: StockAdjustInput
): Promise<InventoryItem> {
  const response = await apiClient.post<InventoryItem>(`/inventory/${productId}/adjust`, data);
  return response.data;
}

export async function getInventoryMovements(productId: number): Promise<InventoryMovement[]> {
  const response = await apiClient.get<InventoryMovement[]>(`/inventory/${productId}/movements`);
  return response.data;
}
