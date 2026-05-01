import type { PaginationMeta } from "@/lib/api/types";

// ── Client list item (from GET /api/clients) ──
// Per API Reference Section 12 / P33: totalBookings does NOT exist in list response
export interface ClientListItemResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
}

// ── Client detail (from GET /api/clients/{id}) ──
export interface ClientDetailsResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Client filters (from API Reference Section 12) ──
// API documents: includeInactive, page, pageSize (NOT search, NOT isActive)
export interface ClientListFilters {
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

// ── Paginated Clients ──
export interface PaginatedClients {
  items: ClientListItemResponse[];
  pagination: PaginationMeta;
}

// ═══════════════════════════════════════════════════════════
// CLIENT BOOKINGS — P10 corrected field names
// ⚠️ BACKEND GAP: No GET /api/client/bookings endpoint documented
// This is the EXPECTED shape when the endpoint is added
// ═══════════════════════════════════════════════════════════

/**
 * Client Booking — P10 corrected field names
 * This is the EXPECTED shape when GET /api/client/bookings is added.
 * Currently BLOCKED — no documented client endpoint exists.
 */
export interface ClientBooking {
  id: string; // P10: NOT 'bookingId'
  clientId: string; // P10: FLAT — not nested object
  unitId: string; // P10: FLAT — not nested object
  ownerId: string;
  assignedAdminUserId: string | null; // P10: NOT 'assignedToUserId' or 'assignedToName'
  bookingStatus: string; // P10: NOT 'status' — Pending|Confirmed|CheckIn|Completed|Cancelled|LeftEarly
  checkInDate: string;
  checkOutDate: string;
  guestCount: number; // P10: NOT 'numberOfGuests'
  baseAmount: number;
  finalAmount: number; // P10: NOT 'totalAmount'
  source: string;
  createdAt: string;
}

export interface PaginatedClientBookings {
  bookings: ClientBooking[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ═══════════════════════════════════════════════════════════
// CLIENT REVIEWS — Review check per booking
// GET /api/client/reviews/by-booking/{bookingId}
// ═══════════════════════════════════════════════════════════

export interface ClientReviewByBookingResponse {
  id: string;
  bookingId: string;
  unitId: string;
  clientId: string;
  ownerId: string;
  rating: number; // 1-5
  title: string;
  comment: string | null;
  reviewStatus: string; // Pending | Published | Rejected | Hidden
  submittedAt: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════
// CLIENT NOTIFICATIONS — P27 corrected field names
// ⚠️ BACKEND GAP: No GET /api/client/me/notifications/... endpoints documented
// This is the EXPECTED shape when the endpoints are added
// ═══════════════════════════════════════════════════════════

/**
 * Client Notification Item — P27 corrected
 * Per API Reference Section 32 (admin version — client version will likely mirror)
 *
 * P27 corrections:
 * - subject (NOT 'title')
 * - readAt: string | null (NOT 'isRead: boolean')
 * - notificationStatus (was missing)
 * - createdAt (was missing)
 */
export interface ClientNotification {
  id: string;
  subject: string; // P27: NOT 'title'
  body: string; // notification body text
  channel: string; // Email | SMS | InApp
  notificationStatus: string; // P27: was missing — e.g., "Sent" | "Read"
  readAt: string | null; // P27: NOT 'isRead: boolean' — null = unread
  createdAt: string; // P27: was missing
  // Context fields (may vary by notification type):
  bookingId?: string;
  unitId?: string;
  leadId?: string;
}

export interface ClientNotificationSummary {
  totalCount: number;
  unreadCount: number;
}

export interface PaginatedClientNotifications {
  notifications: ClientNotification[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
