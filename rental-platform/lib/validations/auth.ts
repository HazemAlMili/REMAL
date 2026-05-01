// ═══════════════════════════════════════════════════════════
// lib/validations/auth.ts
// Zod schemas for authentication forms
// ═══════════════════════════════════════════════════════════

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^01[0-9]{9}$/,
      "Enter a valid Egyptian phone number (e.g., 01012345678)"
    ),
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
    .regex(/^01[0-9]{9}$/, "Enter a valid Egyptian phone number"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
