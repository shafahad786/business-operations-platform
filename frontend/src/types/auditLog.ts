export type AuditAction =
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_DELETED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DEACTIVATED"
  | "STOCK_ADDED"
  | "STOCK_REMOVED"
  | "STOCK_ADJUSTED"
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "ORDER_CONFIRMED"
  | "ORDER_CANCELLED"
  | "INVOICE_CREATED"
  | "INVOICE_CANCELLED"
  | "PAYMENT_RECORDED"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "SYSTEM";

export type AuditLog = {
  id: number;
  username: string;
  action: AuditAction;
  entityType: string;
  entityId?: number;
  description: string;
  metadata?: string;
  timestamp: string;
};
