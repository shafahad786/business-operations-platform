export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "UPI" | "OTHER";

export type PaymentStatus = "COMPLETED" | "CANCELLED";

export type InvoiceCustomerSummary = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
};

export type InvoiceItem = {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Payment = {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
  status: PaymentStatus;
  createdAt: string;
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  salesOrderId: number;
  salesOrderNumber: string;
  customer: InvoiceCustomerSummary;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string | null;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
};

export type PaymentInput = {
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
};
