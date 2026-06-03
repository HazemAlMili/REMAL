import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { queryKeys } from "@/lib/utils/query-keys";
import type { ReviewFormData } from "@/lib/validations/review";

export function useCreateClientReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      bookingId: string;
      rating: number;
      title: string;
      comment?: string;
    }) => reviewsService.submitClientReview(payload),
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries to ensure instant UI updates
      queryClient.invalidateQueries({ queryKey: queryKeys.clientBookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientReviews.all });
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["client-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clientReviews.byBooking(variables.bookingId),
      });
    },
  });
}

export function useUpdateClientReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: {
        rating: number;
        title: string;
        comment?: string;
      };
    }) =>
      reviewsService.updateReview(reviewId, {
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      }),
    onSuccess: (response) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.clientBookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientReviews.all });
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["client-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clientReviews.byBooking(response.bookingId),
      });
    },
  });
}
