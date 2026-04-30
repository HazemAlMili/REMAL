import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  PaymentResponse,
  MarkPaymentFailedRequest,
  CancelPaymentRequest,
} from "@/lib/types/booking.types";
import type { PaymentListFilters, PaginatedPayments } from "@/lib/types/finance.types";

export const paymentsService = {
  // Get all payments with filters
  getAll: (filters?: PaymentListFilters): Promise<PaginatedPayments> =>
    api.get(endpoints.payments.list, { params: filters }),

  // Get payment by ID
  getById: (id: string): Promise<PaymentResponse> =>
    api.get(endpoints.payments.byId(id)),

  // Mark payment as paid (POST with NO body)
  markPaid: (id: string): Promise<PaymentResponse> =>
    api.post(endpoints.payments.markPaid(id)),

  // Mark payment as failed
  markFailed: (
    id: string,
    data: MarkPaymentFailedRequest
  ): Promise<PaymentResponse> =>
    api.post(endpoints.payments.markFailed(id), data),

  // Cancel a payment
  cancel: (
    id: string,
    data: CancelPaymentRequest
  ): Promise<PaymentResponse> =>
    api.post(endpoints.payments.cancel(id), data),
};
