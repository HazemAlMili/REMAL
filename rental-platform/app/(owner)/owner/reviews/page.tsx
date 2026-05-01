"use client";

import { useState } from "react";
import { useOwnerUnits } from "@/lib/hooks/useOwnerPortal";
import {
  usePublicReviews,
  usePublicReviewSummary,
} from "@/lib/hooks/useReviews";
import { OwnerReviewSummary } from "@/components/owner/reviews/OwnerReviewSummary";
import { OwnerReviewCard } from "@/components/owner/reviews/OwnerReviewCard";
import { OwnerReviewReplyPanel } from "@/components/owner/reviews/OwnerReviewReplyPanel";
import type { PublishedReviewListItemResponse } from "@/lib/types";

export default function OwnerReviewsPage() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [activeReview, setActiveReview] =
    useState<PublishedReviewListItemResponse | null>(null);

  // Fetch owner's units for selector
  const { data: units, isLoading: unitsLoading } = useOwnerUnits();

  // Fetch reviews + summary for selected unit
  const { data: reviews, isLoading: reviewsLoading } =
    usePublicReviews(selectedUnitId);
  const { data: summary, isLoading: summaryLoading } =
    usePublicReviewSummary(selectedUnitId);

  const handleReplyClick = (reviewId: string) => {
    const review = reviews?.find((r) => r.reviewId === reviewId);
    if (review) {
      setActiveReview(review);
    }
  };

  const handleCloseReply = () => {
    setActiveReview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Reviews</h1>
          <p className="mt-1 text-sm text-neutral-500">
            View and respond to reviews for your units
          </p>
        </div>
      </div>

      {/* Unit Selector */}
      <div className="max-w-md">
        {unitsLoading ? (
          <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-200" />
        ) : (
          <div>
            <label
              htmlFor="unit-select"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Select Unit
            </label>
            <select
              id="unit-select"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="block w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a unit to view reviews...</option>
              {units?.items.map((unit) => (
                <option key={unit.unitId} value={unit.unitId}>
                  {unit.unitName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Reviews Content */}
      {!selectedUnitId ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-neutral-900">
              Select a unit
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose one of your units to view its published reviews.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          {summaryLoading ? (
            <div className="h-24 w-full animate-pulse rounded-lg bg-neutral-200" />
          ) : summary ? (
            <OwnerReviewSummary summary={summary} />
          ) : null}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 w-full animate-pulse rounded-lg bg-neutral-200"
                />
              ))}
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-neutral-200 bg-white">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                  No reviews yet
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  This unit hasn&apos;t received any published reviews yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <OwnerReviewCard
                  key={review.reviewId}
                  review={review}
                  onReplyClick={handleReplyClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reply Panel */}
      {activeReview && (
        <OwnerReviewReplyPanel
          reviewId={activeReview.reviewId}
          unitId={selectedUnitId}
          review={activeReview}
          existingReply={
            activeReview.ownerReplyText
              ? {
                  id: "", // Not available in PublishedReviewListItemResponse
                  reviewId: activeReview.reviewId,
                  ownerId: "", // Not available
                  replyText: activeReview.ownerReplyText,
                  isVisible: true, // Assume visible if present
                  createdAt: "", // Not available
                  updatedAt: activeReview.ownerReplyUpdatedAt || "",
                }
              : null
          }
          onClose={handleCloseReply}
        />
      )}
    </div>
  );
}
