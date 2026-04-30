// ──────────────────────────────────────────────────────────────────────────────
// Reviews Service
// From REMAL_API_Reference.md Sections 22-24
// ──────────────────────────────────────────────────────────────────────────────

import api from "../axios";
import { endpoints } from "../endpoints";
import type {
  PublishedReviewListItemResponse,
  UnitPublishedReviewSummaryResponse,
  ReviewResponse,
  ReviewStatusHistoryResponse,
  PublishReviewRequest,
  RejectReviewRequest,
  HideReviewRequest,
  CreateReviewRequest,
  UpdatePendingReviewRequest,
} from "@/lib/types/review.types";

export const reviewsService = {
  // ── Public ──
  getPublicByUnit: (
    unitId: string
  ): Promise<PublishedReviewListItemResponse[]> =>
    api.get(endpoints.publicReviews.byUnitList(unitId)),

  getPublicSummary: (
    unitId: string
  ): Promise<UnitPublishedReviewSummaryResponse> =>
    api.get(endpoints.publicReviews.byUnitSummary(unitId)),

  getPublicById: (
    unitId: string,
    reviewId: string
  ): Promise<PublishedReviewListItemResponse> =>
    api.get(endpoints.publicReviews.byUnitDetail(unitId, reviewId)),

  // ── Moderation ──
  publish: (
    reviewId: string,
    data?: PublishReviewRequest
  ): Promise<ReviewResponse> =>
    api.post(endpoints.reviewModeration.publish(reviewId), data ?? {}),

  reject: (
    reviewId: string,
    data?: RejectReviewRequest
  ): Promise<ReviewResponse> =>
    api.post(endpoints.reviewModeration.reject(reviewId), data),

  hide: (reviewId: string, data?: HideReviewRequest): Promise<ReviewResponse> =>
    api.post(endpoints.reviewModeration.hide(reviewId), data),

  getStatusHistory: (
    reviewId: string
  ): Promise<ReviewStatusHistoryResponse[]> =>
    api.get(endpoints.reviewModeration.statusHistory(reviewId)),

  // ── Client review submission (used in Wave 7) ──
  createReview: (data: CreateReviewRequest): Promise<ReviewResponse> =>
    api.post(endpoints.clientReviews.create, data),

  updateReview: (
    reviewId: string,
    data: UpdatePendingReviewRequest
  ): Promise<ReviewResponse> =>
    api.put(endpoints.clientReviews.update(reviewId), data),

  getByBooking: (bookingId: string): Promise<ReviewResponse> =>
    api.get(endpoints.clientReviews.byBooking(bookingId)),
};
