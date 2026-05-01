// ═══════════════════════════════════════════════════════════
// lib/validations/review.ts
// Zod schemas for review forms
// ═══════════════════════════════════════════════════════════

import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({ required_error: "Please select a rating" })
    .int("Rating must be a whole number")
    .min(1, "Please select at least 1 star")
    .max(5, "Maximum rating is 5 stars"),
  title: z
    .string()
    .min(1, "Title is required") // REQUIRED — not optional
    .max(200, "Title must be 200 characters or less"),
  comment: z
    .string()
    .max(2000, "Comment must be 2000 characters or less")
    .optional()
    .or(z.literal("")), // Allow empty string
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
