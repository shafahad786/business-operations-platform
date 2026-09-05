import { apiClient } from "../lib/apiClient";
import type { BackendHealth } from "../types/api";

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await apiClient.get<BackendHealth>("/health");
  return response.data;
}
