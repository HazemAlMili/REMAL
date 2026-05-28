export const PAYMENT_STATUSES = {
  Pending: "pending",
  Paid: "paid",
  Failed: "failed",
  Cancelled: "cancelled",
} as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  cancelled: "neutral",
}
