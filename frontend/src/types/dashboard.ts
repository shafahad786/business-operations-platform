export type DashboardSummary = {
  totalCustomers: number;
  activeProducts: number;
  lowStockCount: number;
  inventoryValue: number;
  totalOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  totalSales: number;
  totalPaid: number;
  outstandingAmount: number;
  unpaidInvoices: number;
  partiallyPaidInvoices: number;
  financialMetricsIncluded: boolean;
};

export type MonthlySales = {
  month: string;
  total: number;
};

export type DashboardRecentOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
};

export type DashboardRecentPayment = {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  method: string;
  paymentDate: string;
};

export type DashboardLowStock = {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  minimumStockLevel: number;
  lowStock: boolean;
};
