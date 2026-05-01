import { z } from "zod";

// Create payout schema
export const createPayoutSchema = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  commissionRate: z
    .number({ invalid_type_error: "Commission rate is required" })
    .min(0, "Rate must be at least 0")
    .max(100, "Rate cannot exceed 100"),
  notes: z.string().optional(),
});

export type CreatePayoutFormValues = z.infer<typeof createPayoutSchema>;

// Mark paid schema
export const markPaidSchema = z.object({
  notes: z.string().optional(),
});

export type MarkPaidFormValues = z.infer<typeof markPaidSchema>;

// Schedule schema
export const scheduleSchema = z.object({
  notes: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// Cancel schema
export const cancelPayoutSchema = z.object({
  notes: z.string().optional(),
});

export type CancelPayoutFormValues = z.infer<typeof cancelPayoutSchema>;
