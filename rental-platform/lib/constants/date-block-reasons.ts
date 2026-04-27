export const DATE_BLOCK_REASONS = {
  Maintenance: 'Maintenance',
  OwnerUse: 'OwnerUse',
  Other: 'Other',
} as const

export type DateBlockReason = (typeof DATE_BLOCK_REASONS)[keyof typeof DATE_BLOCK_REASONS]

export const DATE_BLOCK_REASON_LABELS: Record<DateBlockReason, string> = {
  Maintenance: 'Maintenance',
  OwnerUse: "Owner's Personal Use",
  Other: 'Other',
}
