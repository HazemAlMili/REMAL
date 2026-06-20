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
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateClientStatusRequest {
  isActive: boolean;
}

export interface CreateClientResponse extends ClientDetailsResponse {
  temporaryPassword: string;
}

export interface ResetClientPasswordRequest {
  newPassword: string;
}

export interface CreateClientRequest {
  name: string;
  phone: string;
  email?: string;
}

export interface ClientAccountProfileResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClientProfileRequest {
  name: string;
  phone: string;
  email?: string | null;
}

// ── Paginated Clients ──
export interface PaginatedClients {
  items: ClientListItemResponse[];
  pagination: PaginationMeta;
}

// ═══════════════════════════════════════════════════════════
// CLIENT BOOKINGS
// ═══════════════════════════════════════════════════════════

export interface ClientBooking {
  id: string; // P10: NOT 'bookingId'
  clientId: string; // P10: FLAT — not nested object
  unitId: string; // P10: FLAT — not nested object
  unitName: string | null;
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
  ownerReplyText?: string | null;
  ownerReplyUpdatedAt?: string | null;
}

// ═══════════════════════════════════════════════════════════
// CLIENT NOTIFICATIONS
// ═══════════════════════════════════════════════════════════

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
