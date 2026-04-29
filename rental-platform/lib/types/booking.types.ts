import type { PaginationMeta } from "@/lib/api/types";

// All from REMAL_API_Reference.md

// -- Booking Statuses (DIFFERENT from CRM Lead statuses) --
// Booking has only 6 statuses (post-conversion formal status)
export type FormalBookingStatus =
  | "Pending"
  | "Confirmed"
  | "CheckIn"
  | "Completed"
  | "Cancelled"
  | "LeftEarly";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Cancelled";
export type PaymentMethod =
  | "InstaPay"
  | "VodafoneCash"
  | "Cash"
  | "BankTransfer";

// -- Invoice status (PascalCase) --
export type InvoiceStatus = "Draft" | "Issued" | "Cancelled";

// -- Booking list item (from GET /api/internal/bookings) --
export interface BookingListItemResponse {
  id: string;
  clientId: string;
  unitId: string;
  ownerId: string;
  assignedAdminUserId: string | null;
  bookingStatus: FormalBookingStatus;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  baseAmount: number;
  finalAmount: number;
  source: string;
  createdAt: string;
}

// -- Booking full details (from GET /api/internal/bookings/{id}) --
export interface BookingDetailsResponse {
  id: string;
  clientId: string;
  unitId: string;
  ownerId: string;
  assignedAdminUserId: string | null;
  bookingStatus: FormalBookingStatus;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  baseAmount: number;
  finalAmount: number;
  source: string;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// -- Booking Filters --
export interface BookingListFilters {
  bookingStatus?: FormalBookingStatus;
  assignedAdminUserId?: string;
  checkInFrom?: string;
  checkInTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// -- Lifecycle Requests --
export interface ConfirmBookingRequest {
  notes?: string;
}

export interface CancelBookingRequest {
  notes?: string;
}

export interface CompleteBookingRequest {
  notes?: string;
}

export interface CheckInBookingRequest {
  notes?: string;
}

export interface LeftEarlyBookingRequest {
  notes?: string;
}

// -- Payment --
export interface PaymentResponse {
  id: string;
  bookingId: string;
  invoiceId: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  referenceNumber: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  invoiceId?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  referenceNumber?: string;
  notes?: string;
}

export type MarkPaymentPaidRequest = Record<string, never>;

export interface MarkPaymentFailedRequest {
  notes?: string;
}

export interface CancelPaymentRequest {
  notes?: string;
}

// -- Invoice --
export interface InvoiceItemResponse {
  id: string;
  invoiceId: string;
  lineType: "Accommodation" | "ManualAdjustment";
  description: string;
  quantity: number;
  unitAmount: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceResponse {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  subtotalAmount: number;
  totalAmount: number;
  invoiceStatus: InvoiceStatus;
  issuedAt: string | null;
  dueDate: string | null;
  notes: string | null;
  items: InvoiceItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceBalanceResponse {
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
}

export interface AddInvoiceManualAdjustmentRequest {
  description: string;
  quantity: number;
  unitAmount: number; // negative = discount (e.g., -200.00)
}

// -- Finance Snapshot --
export interface BookingFinanceSnapshotResponse {
  bookingId: string;
  invoiceId: string | null;
  invoiceStatus: InvoiceStatus | null;
  invoicedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  ownerPayoutStatus: "Pending" | "Scheduled" | "Paid" | "Cancelled" | null;
}

// -- Booking Notes --
export interface BookingNoteResponse {
  id: string;
  bookingId: string | null;
  crmLeadId: string | null;
  createdByAdminUserId: string;
  noteText: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddBookingNoteRequest {
  noteText: string;
}

export interface UpdateBookingNoteRequest {
  noteText: string;
}

// -- Status History --
export interface BookingStatusHistoryResponse {
  id: string;
  bookingId: string;
  oldStatus: FormalBookingStatus | null;
  newStatus: FormalBookingStatus;
  changedByAdminUserId: string;
  notes: string | null;
  changedAt: string;
}

// -- Assignment --
export interface AssignBookingRequest {
  assignedAdminUserId: string;
}

// -- Paginated Bookings --
export interface PaginatedBookings {
  items: BookingListItemResponse[];
  pagination: PaginationMeta;
}
