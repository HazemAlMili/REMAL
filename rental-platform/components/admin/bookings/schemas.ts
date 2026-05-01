import { z } from "zod";

export const recordPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  amount: z
    .number({ invalid_type_error: "Amount required" })
    .min(0.01, "Amount must be positive"),
  paymentMethod: z.enum(["InstaPay", "VodafoneCash", "Cash", "BankTransfer"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const adjustmentSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitAmount: z.number({ invalid_type_error: "Unit amount required" }),
});
