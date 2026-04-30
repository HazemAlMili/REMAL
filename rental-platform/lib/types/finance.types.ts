import type { PaymentResponse, PaymentStatus } from "@/lib/types/booking.types";
import type { PaginationMeta } from "@/lib/api/types";

export type PayoutStatus = "Pending" | "Scheduled" | "Paid" | "Cancelled";

// Owner Payout
export interface OwnerPayoutResponse {
  id: string;
  bookingId: string;
  ownerId: string;
  payoutStatus: PayoutStatus;
  grossBookingAmount: number;
  commissionRate: number;
  commissionAmount: number;
  payoutAmount: number;
  scheduledAt: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOwnerPayoutRequest {
  bookingId: string;
  commissionRate: number; // 0..100 percentage
  notes?: string;
}

export interface SetOwnerPayoutScheduledRequest {
  notes?: string;
}

export interface MarkOwnerPayoutPaidRequest {
  notes?: string;
}

export interface CancelOwnerPayoutRequest {
  notes?: string;
}

// â”€â”€ Owner Payout Summary â”€â”€
export interface OwnerPayoutSummaryResponse {
  ownerId: string;
  totalPending: number;
  totalScheduled: number;
  totalPaid: number;
}

// â”€â”€ Finance Analytics â€” Summary â”€â”€
export interface FinanceAnalyticsSummaryResponse {
  dateFrom: string;
  dateTo: string;
  totalBookingsWithInvoiceCount: number;
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalPendingPayoutAmount: number;
  totalScheduledPayoutAmount: number;
  totalPaidPayoutAmount: number;
}

// â”€â”€ Finance Analytics â€” Daily â”€â”€
export interface FinanceAnalyticsDailySummaryResponse {
  metricDate: string;
  bookingsWithInvoiceCount: number;
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalPendingPayoutAmount: number;
  totalScheduledPayoutAmount: number;
  totalPaidPayoutAmount: number;
}

// â”€â”€ Booking Analytics â€” Daily â”€â”€
export interface BookingAnalyticsDailySummaryResponse {
  metricDate: string;
  bookingSource: string;
  bookingsCreatedCount: number;
  pendingBookingsCount: number;
  confirmedBookingsCount: number;
  cancelledBookingsCount: number;
  completedBookingsCount: number;
  totalFinalAmount: number;
}

// â”€â”€ Booking Analytics â€” Summary â”€â”€
export interface BookingAnalyticsSummaryResponse {
  dateFrom: string;
  dateTo: string;
  bookingSource: string;
  totalBookingsCreatedCount: number;
  totalPendingBookingsCount: number;
  totalConfirmedBookingsCount: number;
  totalCancelledBookingsCount: number;
  totalCompletedBookingsCount: number;
  totalFinalAmount: number;
}

// â”€â”€ Payments List â”€â”€
export interface PaymentListFilters {
  bookingId?: string;
  invoiceId?: string;
  paymentStatus?: PaymentStatus;
  page?: number;
  pageSize?: number;
}

export interface PaginatedPayments {
  items: PaymentResponse[];
  pagination: PaginationMeta;
}
