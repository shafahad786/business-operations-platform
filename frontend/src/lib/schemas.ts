import { z } from "zod";

const optionalText = z.string().trim().optional();

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email",
    }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[+]?[0-9\s()-]{7,20}$/.test(value), {
      message: "Enter a valid phone number",
    }),
  company: optionalText,
  address: optionalText,
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  category: optionalText,
  description: optionalText,
  sellingPrice: z.number().positive("Selling price must be positive"),
  costPrice: z.number().min(0, "Cost price must be zero or greater"),
  minimumStockLevel: z.number().int().min(0, "Minimum stock must be zero or greater"),
  active: z.boolean(),
  initialStock: z.number().int().min(0, "Initial stock must be zero or greater").optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const stockChangeSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: optionalText,
});

export const stockAdjustSchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be zero or greater"),
  reason: z.string().trim().min(1, "Reason is required"),
});

export type StockChangeFormValues = z.infer<typeof stockChangeSchema>;
export type StockAdjustFormValues = z.infer<typeof stockAdjustSchema>;

export const orderSchema = z.object({
  customerId: z.number().int().positive("Customer is required"),
  taxAmount: z.number().min(0, "Tax cannot be negative"),
  notes: z.string().trim().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export const paymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than zero"),
  paymentDate: z.string().min(1, "Payment date is required"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "UPI", "OTHER"]),
  referenceNumber: optionalText,
  notes: optionalText,
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
