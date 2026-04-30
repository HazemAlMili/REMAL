import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  OwnerPayoutResponse,
  OwnerPayoutSummaryResponse,
  CreateOwnerPayoutRequest,
  SetOwnerPayoutScheduledRequest,
  MarkOwnerPayoutPaidRequest,
  CancelOwnerPayoutRequest,
} from "@/lib/types/finance.types";

export const payoutsService = {
  // Get payouts for a specific owner
  getByOwner: (ownerId: string): Promise<OwnerPayoutResponse[]> =>
    api.get(endpoints.ownerPayouts.byOwner(ownerId)),

  // Get payout related to a specific booking (returns single object, not array)
  getByBooking: (bookingId: string): Promise<OwnerPayoutResponse> =>
    api.get(endpoints.ownerPayouts.byBooking(bookingId)),

  // Get payout summary for an owner
  getSummary: (ownerId: string): Promise<OwnerPayoutSummaryResponse> =>
    api.get(endpoints.financeSummary.ownerPayoutSummary(ownerId)),

  // Create a new payout record
  create: (data: CreateOwnerPayoutRequest): Promise<OwnerPayoutResponse> =>
    api.post(endpoints.ownerPayouts.create, data),

  // Schedule a payout (Pending â†’ Scheduled)
  schedule: (
    id: string,
    data: SetOwnerPayoutScheduledRequest
  ): Promise<OwnerPayoutResponse> =>
    api.post(endpoints.ownerPayouts.schedule(id), data),

  // Mark payout as paid (Pending | Scheduled â†’ Paid)
  markPaid: (
    id: string,
    data: MarkOwnerPayoutPaidRequest
  ): Promise<OwnerPayoutResponse> =>
    api.post(endpoints.ownerPayouts.markPaid(id), data),

  // Cancel a payout
  cancel: (
    id: string,
    data: CancelOwnerPayoutRequest
  ): Promise<OwnerPayoutResponse> =>
    api.post(endpoints.ownerPayouts.cancel(id), data),
};
