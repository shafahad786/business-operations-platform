export type InventoryItem = {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  minimumStockLevel: number;
  lowStock: boolean;
  productActive: boolean;
  updatedAt: string;
};

export type InventoryMovement = {
  id: number;
  productId: number;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string | null;
  createdAt: string;
};

export type StockChangeInput = {
  quantity: number;
  reason?: string;
};

export type StockAdjustInput = {
  quantity: number;
  reason: string;
};
