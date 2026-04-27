export const BOOKING_SOURCES = {
  Website: 'Website',
  App: 'App',
  WhatsApp: 'WhatsApp',
  PhoneCall: 'PhoneCall',
  Referral: 'Referral',
} as const

export type BookingSource = (typeof BOOKING_SOURCES)[keyof typeof BOOKING_SOURCES]

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  Website: 'Website',
  App: 'App',
  WhatsApp: 'WhatsApp',
  PhoneCall: 'Phone Call',
  Referral: 'Referral',
}
