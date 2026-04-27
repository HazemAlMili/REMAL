export const PAYMENT_STATUSES = {
  Pending: 'Pending',
  Paid: 'Paid',
  Failed: 'Failed',
  Cancelled: 'Cancelled',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  Pending: 'Pending',
  Paid: 'Paid',
  Failed: 'Failed',
  Cancelled: 'Cancelled',
}
