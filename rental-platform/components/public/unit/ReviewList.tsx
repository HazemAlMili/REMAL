"use client";

import { PublicReviewCard } from "./PublicReviewCard";
import type { PublishedReviewListItem } from "@/lib/types/public.types";

interface ReviewListProps {
  reviews: PublishedReviewListItem[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <PublicReviewCard key={review.reviewId} review={review} />
      ))}
    </div>
  );
}
