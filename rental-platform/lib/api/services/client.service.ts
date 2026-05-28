// ═══════════════════════════════════════════════════════════
// lib/api/services/client.service.ts
// Client-scoped API calls (authenticated client endpoints)
// ═══════════════════════════════════════════════════════════

import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { BookingListFilters, PaginatedBookings } from "@/lib/types/booking.types";
import type {
  ClientAccountProfileResponse,
  ClientReviewByBookingResponse,
  UpdateClientProfileRequest,
} from "@/lib/types/client.types";

export const clientService = {
  getProfile: async (): Promise<ClientAccountProfileResponse> =>
    api.get(endpoints.clientProfile.get),

  updateProfile: async (
    data: UpdateClientProfileRequest
  ): Promise<ClientAccountProfileResponse> => api.put(endpoints.clientProfile.update, data),

  getClientBookings: async (
    params?: BookingListFilters
  ): Promise<PaginatedBookings> => api.get(endpoints.clientBookings.list, { params }),

  /**
   * Check if a review exists for a booking.
   * GET /api/reviews/by-booking/{bookingId}
   * Returns the review object or null (404 = no review yet).
   */
  getReviewByBooking: async (
    bookingId: string
  ): Promise<ClientReviewByBookingResponse | null> => {
    try {
      const response = await api.get(
        endpoints.clientReviews.byBooking(bookingId)
      );
      return response.data as ClientReviewByBookingResponse;
    } catch (error: unknown) {
      // 404 means no review exists — return null
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 404
      ) {
        return null;
      }
      throw error; // Re-throw other errors
    }
  },
};
