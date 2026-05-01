// ═══════════════════════════════════════════════════════════
// lib/hooks/useClient.ts
// Client-scoped hooks for authenticated client features
// ═══════════════════════════════════════════════════════════

"use client";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/lib/api/services/client.service";
import { queryKeys } from "@/lib/utils/query-keys";

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
