import { z } from "zod";

/**
 * Phone: 10–15 digits, optional leading '+'. Same rule as the platform so the
 * storefront and back office agree on what a valid number is.
 */
export const PHONE_PATTERN = /^\+?\d{10,15}$/;

export function sanitizePhoneInput(value: string): string {
  const plus = value.trimStart().startsWith("+") ? "+" : "";
  return plus + value.replace(/\D/g, "");
}

// Home "recommend me a unit" lead form.
export const leadSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(100, "الاسم طويل جدًا"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, "أدخل رقمًا صحيحًا من 10 إلى 15 رقمًا"),
  checkIn: z.string().min(1, "تاريخ الوصول مطلوب"),
  checkOut: z.string().min(1, "تاريخ المغادرة مطلوب"),
  guests: z.string(),
  tripType: z.string(),
  budget: z.string(),
  project: z.string(),
  notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
