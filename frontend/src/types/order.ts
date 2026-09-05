export type SalesOrderStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export type OrderCustomerSummary = {
  id: number;
  name: string;
};

export type SalesOrderItem = {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type SalesOrder = {
  id: number;
  orderNumber: string;
  customer: OrderCustomerSummary;
  status: SalesOrderStatus;
  orderDate: string;
  items?: SalesOrderItem[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SalesOrderItemInput = {
  productId: number;
  quantity: number;
};

export type SalesOrderInput = {
  customerId: number;
  items: SalesOrderItemInput[];
  taxAmount: number;
  notes?: string;
};

export type OrderLineDraft = {
  productId: number;
  productName: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  quantity: number;
};
