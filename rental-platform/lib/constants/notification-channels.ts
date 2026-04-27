export const NOTIFICATION_CHANNELS = {
  Email: 'Email',
  SMS: 'SMS',
  InApp: 'InApp',
} as const

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS]

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  Email: 'Email',
  SMS: 'SMS',
  InApp: 'In App',
}
