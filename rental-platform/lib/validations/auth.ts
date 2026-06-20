// ═══════════════════════════════════════════════════════════
// lib/validations/auth.ts
// Zod schemas for authentication forms
// ═══════════════════════════════════════════════════════════

import { z } from "zod";

// Accept 10–15 digits with an optional leading '+'. A leading 0 is allowed so local
// formats (e.g. Egyptian "01062327721") work alongside E.164 ("+201062327721").
const phonePattern = /^\+?\d{10,15}$/;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phonePattern, "Enter 10 to 15 digits, optionally starting with +"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")) // Allow empty string from input
    .transform((val) => (val === "" ? undefined : val)), // Convert "" to undefined for API
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phonePattern, "Enter 10 to 15 digits, optionally starting with +"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
