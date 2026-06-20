// ═══════════════════════════════════════════════════════════
// lib/api/services/client.service.ts
// Client-scoped API calls (authenticated client endpoints)
// ═══════════════════════════════════════════════════════════

import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/api-error";
import type {
  BookingListFilters,
  PaginatedBookings,
  BookingDetailsResponse,
  CreateClientBookingRequest,
} from "@/lib/types/booking.types";
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

  // Creates a booking directly at "Prospecting" for the authenticated client
  // (no CRM lead). The backend derives the client from the auth token.
  createBooking: async (
    data: CreateClientBookingRequest
  ): Promise<BookingDetailsResponse> =>
    api.post(endpoints.clientBookings.create, data),

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
      return response as unknown as ClientReviewByBookingResponse;
    } catch (error: unknown) {
      // 404 means no review exists — return null
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error; // Re-throw other errors
    }
  },
};
