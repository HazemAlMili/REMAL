// ═══════════════════════════════════════════════════════════
// lib/hooks/useClient.ts
// Client-scoped hooks for authenticated client features
// ═══════════════════════════════════════════════════════════

"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientService } from "@/lib/api/services/client.service";
import { queryKeys } from "@/lib/utils/query-keys";
import type { BookingListFilters } from "@/lib/types/booking.types";
import type { UpdateClientProfileRequest } from "@/lib/types/client.types";
import { toastSuccess } from "@/lib/utils/toast";

export function useClientProfile() {
  return useQuery({
    queryKey: queryKeys.clientProfile.detail(),
    queryFn: () => clientService.getProfile(),
    staleTime: 1000 * 60,
    retry: false,
  });
}

export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientProfileRequest) =>
      clientService.updateProfile(data),
    onSuccess: () => {
      toastSuccess("Profile updated successfully.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.clientProfile.detail(),
      });
    },
  });
}

export function useClientBookings(filters?: BookingListFilters) {
  return useQuery({
    queryKey: queryKeys.clientBookings.list(filters),
    queryFn: () => clientService.getClientBookings(filters),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30,
    retry: false,
  });
}

/**
 * Check if a review exists for a specific booking.
 * Returns the review if it exists, or null if not.
 * Used to determine whether to show "Write Review" or "Edit Review" button.
 *
 * API: GET /api/reviews/by-booking/{bookingId}
 * Access: Authenticated Client only
 */
export function useBookingReview(bookingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.clientReviews.byBooking(bookingId),
    queryFn: () => clientService.getReviewByBooking(bookingId),
    enabled: enabled, // Only check for Completed bookings
    staleTime: 1000 * 60 * 5, // 5 minutes — review status rarely changes
    retry: false, // Don't retry on 404 (no review exists)
  });
}
