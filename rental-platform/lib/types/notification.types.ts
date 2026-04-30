// ──────────────────────────────────────────────────────────────────────────────
// Notification Types
// From REMAL_API_Reference.md Sections 30-33
// Verified against P25, P26, P27
// ──────────────────────────────────────────────────────────────────────────────

// ── Enums ──
export type NotificationChannel = "Email" | "SMS" | "InApp"; // PascalCase — 'InApp' not 'in_app'

export type NotificationStatus =
  | "Pending"
  | "Queued"
  | "Sent"
  | "Delivered"
  | "Failed"
  | "Cancelled";

// ── Notification inbox item ──
// Per P27: subject (not title), readAt (not isRead), notificationStatus and createdAt present
export interface NotificationListItemResponse {
  notificationId: string; // Per P27 — not "id"
  channel: NotificationChannel;
  notificationStatus: NotificationStatus; // Per P27 — was missing in old tickets
  subject: string; // Per P27 — NOT "title"
  body: string;
  createdAt: string; // Per P27 — was missing in old tickets
  sentAt: string | null;
  readAt: string | null; // Per P27 — NOT "isRead: boolean". null = unread
}

// ── Inbox summary (for bell badge count) ──
export interface NotificationRecipientInboxSummaryResponse {
  unreadCount: number;
  totalCount: number;
}

// ── Notification preference ──
// Per P26: preferenceKey (not type)
export interface NotificationPreferenceResponse {
  channel: NotificationChannel;
  preferenceKey: string; // Per P26 — NOT "type"
  isEnabled: boolean;
}

export interface UpsertNotificationPreferenceRequest {
  channel: NotificationChannel;
  preferenceKey: string; // Per P26 — NOT "type"
  isEnabled: boolean;
}

// ── Admin dispatch requests ──
// Per P25: templateCode (not title/body), template-based NOT free-text
export interface CreateAdminNotificationRequest {
  templateCode: string; // Per P25 — NOT "title"
  channel: NotificationChannel;
  variables?: Record<string, string>; // Per P25 — template variables
  scheduledAt?: string; // Per P25 — optional scheduling
}

export interface CreateClientNotificationRequest {
  templateCode: string;
  channel: NotificationChannel;
  variables?: Record<string, string>;
  scheduledAt?: string;
}

export interface CreateOwnerNotificationRequest {
  templateCode: string;
  channel: NotificationChannel;
  variables?: Record<string, string>;
  scheduledAt?: string;
}
