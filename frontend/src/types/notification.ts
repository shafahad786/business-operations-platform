export type NotificationType =
  | "LOW_STOCK"
  | "INVOICE_DUE"
  | "PAYMENT_RECEIVED"
  | "ORDER_CONFIRMED"
  | "SYSTEM";

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  referenceEntityType?: string;
  referenceEntityId?: number;
  createdAt: string;
};

export type UnreadCount = {
  count: number;
};
