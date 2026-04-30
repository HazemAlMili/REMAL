// ──────────────────────────────────────────────────────────────────────────────
// Reviews Hooks
// From REMAL_API_Reference.md Sections 22-24
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "../api/services/reviews.service";
import { queryKeys } from "./query-keys";
import type {
  PublishReviewRequest,
  RejectReviewRequest,
  HideReviewRequest,
  CreateReviewRequest,
  UpdatePendingReviewRequest,
} from "../types/review.types";

// ── Public Reviews ──

export function usePublicReviews(unitId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.publicByUnit(unitId),
    queryFn: () => reviewsService.getPublicByUnit(unitId),
    enabled: !!unitId,
  });
}

export function usePublicReviewSummary(unitId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.publicSummary(unitId),
    queryFn: () => reviewsService.getPublicSummary(unitId),
    enabled: !!unitId,
  });
}

export function usePublicReviewById(unitId: string, reviewId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.publicDetail(unitId, reviewId),
    queryFn: () => reviewsService.getPublicById(unitId, reviewId),
    enabled: !!unitId && !!reviewId,
  });
}

// ── Review Status History ──

export function useReviewStatusHistory(reviewId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.statusHistory(reviewId),
    queryFn: () => reviewsService.getStatusHistory(reviewId),
    enabled: !!reviewId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ── Moderation Mutations ──

export function usePublishReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data?: PublishReviewRequest;
    }) => reviewsService.publish(reviewId, data),
    onSuccess: (_, variables) => {
      // Invalidate status history for this review
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(variables.reviewId),
      });
      // Invalidate all public reviews queries (we don't know which unit)
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.all,
      });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data?: RejectReviewRequest;
    }) => reviewsService.reject(reviewId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(variables.reviewId),
      });
    },
  });
}

export function useHideReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data?: HideReviewRequest;
    }) => reviewsService.hide(reviewId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.statusHistory(variables.reviewId),
      });
      // Invalidate all public reviews queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.all,
      });
    },
  });
}

// ── Client Review Submission (Wave 7) ──

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) =>
      reviewsService.createReview(data),
    onSuccess: (_, variables) => {
      // Invalidate review by booking query
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byBooking(variables.bookingId),
      });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: UpdatePendingReviewRequest;
    }) => reviewsService.updateReview(reviewId, data),
    onSuccess: (response) => {
      // Invalidate review by booking query
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byBooking(response.bookingId),
      });
    },
  });
}

export function useReviewByBooking(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byBooking(bookingId),
    queryFn: () => reviewsService.getByBooking(bookingId),
    enabled: !!bookingId,
  });
}
