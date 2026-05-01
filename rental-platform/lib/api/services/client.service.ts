// ═══════════════════════════════════════════════════════════
// lib/api/services/client.service.ts
// Client-scoped API calls (authenticated client endpoints)
// ═══════════════════════════════════════════════════════════

import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { ClientReviewByBookingResponse } from "@/lib/types/client.types";

export const clientService = {
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

  // ⚠️ BACKEND GAP: getClientBookings not implemented
  // No documented GET /api/client/bookings endpoint exists.
  // This method will be added when the backend provides the endpoint.
  // getClientBookings: async (params) => { ... }
};
