export type Product = {
  id: number;
  name: string;
  sku: string;
  category?: string | null;
  description?: string | null;
  sellingPrice: number;
  costPrice: number;
  minimumStockLevel: number;
  active: boolean;
  stockQuantity: number;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  sku: string;
  category?: string;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  minimumStockLevel: number;
  active: boolean;
  initialStock?: number;
};
