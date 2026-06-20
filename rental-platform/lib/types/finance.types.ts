import type { PaymentResponse, PaymentStatus } from "@/lib/types/booking.types";
import type { PaginationMeta } from "@/lib/api/types";

export type PayoutStatus = "pending" | "scheduled" | "paid" | "cancelled";

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
  proofOfPaymentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOwnerPayoutRequest {
  bookingId: string;
  commissionRate: number; // 0..100 percentage
  proofOfPaymentUrl?: string;
  notes?: string;
}

export interface SetOwnerPayoutScheduledRequest {
  notes?: string;
}

export interface MarkOwnerPayoutPaidRequest {
  proofOfPaymentUrl?: string;
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
  prospectingBookingsCount: number;
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
  totalProspectingBookingsCount: number;
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
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedPayments {
  items: PaymentResponse[];
  pagination: PaginationMeta;
}
