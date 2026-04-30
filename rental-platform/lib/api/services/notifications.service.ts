// ──────────────────────────────────────────────────────────────────────────────
// Notifications Service
// From REMAL_API_Reference.md Sections 30-33
// Verified against P25, P26, P27
// ──────────────────────────────────────────────────────────────────────────────

import api from "../axios";
import { endpoints } from "../endpoints";
import type {
  NotificationListItemResponse,
  NotificationRecipientInboxSummaryResponse,
  NotificationPreferenceResponse,
  UpsertNotificationPreferenceRequest,
  CreateAdminNotificationRequest,
  CreateClientNotificationRequest,
  CreateOwnerNotificationRequest,
} from "@/lib/types/notification.types";

export const notificationsService = {
  // ── Admin inbox ──
  getAdminInbox: (): Promise<NotificationListItemResponse[]> =>
    api.get(endpoints.notifications.admin.inbox),

  getAdminSummary: (): Promise<NotificationRecipientInboxSummaryResponse> =>
    api.get(endpoints.notifications.admin.summary),

  markAdminRead: (notificationId: string): Promise<void> =>
    api.post(endpoints.notifications.admin.read(notificationId)),

  // ── Admin preferences ──
  getAdminPreferences: (): Promise<NotificationPreferenceResponse[]> =>
    api.get(endpoints.notificationPreferences.adminGet),

  updateAdminPreferences: (
    data: UpsertNotificationPreferenceRequest
  ): Promise<NotificationPreferenceResponse> =>
    api.put(endpoints.notificationPreferences.adminUpdate, data),

  // ── Dispatch (admin sends to users) ──
  // Per P25: template-based, NOT free-text title/body
  sendToAdmin: (
    adminUserId: string,
    data: CreateAdminNotificationRequest
  ): Promise<void> =>
    api.post(endpoints.internalNotifications.toAdmin(adminUserId), data),

  sendToClient: (
    clientId: string,
    data: CreateClientNotificationRequest
  ): Promise<void> =>
    api.post(endpoints.internalNotifications.toClient(clientId), data),

  sendToOwner: (
    ownerId: string,
    data: CreateOwnerNotificationRequest
  ): Promise<void> =>
    api.post(endpoints.internalNotifications.toOwner(ownerId), data),

  // ── Owner inbox (for Wave 6 Owner Portal) ──
  getOwnerInbox: (): Promise<NotificationListItemResponse[]> =>
    api.get(endpoints.notifications.owner.inbox),

  getOwnerSummary: (): Promise<NotificationRecipientInboxSummaryResponse> =>
    api.get(endpoints.notifications.owner.summary),

  markOwnerRead: (notificationId: string): Promise<void> =>
    api.post(endpoints.notifications.owner.read(notificationId)),

  // ── Client inbox (for Wave 7 Guest App) ──
  getClientInbox: (): Promise<NotificationListItemResponse[]> =>
    api.get(endpoints.notifications.client.inbox),

  getClientSummary: (): Promise<NotificationRecipientInboxSummaryResponse> =>
    api.get(endpoints.notifications.client.summary),

  markClientRead: (notificationId: string): Promise<void> =>
    api.post(endpoints.notifications.client.read(notificationId)),

  // ── Owner preferences (for Wave 6 Owner Portal) ──
  getOwnerPreferences: (): Promise<NotificationPreferenceResponse[]> =>
    api.get(endpoints.notificationPreferences.ownerGet),

  updateOwnerPreferences: (
    data: UpsertNotificationPreferenceRequest
  ): Promise<NotificationPreferenceResponse> =>
    api.put(endpoints.notificationPreferences.ownerUpdate, data),

  // ── Client preferences (for Wave 7 Guest App) ──
  getClientPreferences: (): Promise<NotificationPreferenceResponse[]> =>
    api.get(endpoints.notificationPreferences.clientGet),

  updateClientPreferences: (
    data: UpsertNotificationPreferenceRequest
  ): Promise<NotificationPreferenceResponse> =>
    api.put(endpoints.notificationPreferences.clientUpdate, data),
};
