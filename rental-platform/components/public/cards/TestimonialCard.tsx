// ═══════════════════════════════════════════════════════════
// components/public/cards/TestimonialCard.tsx
// Individual review quote card for the testimonials carousel
// ═══════════════════════════════════════════════════════════

import { StarRating } from "./StarRating";
import { formatDate } from "@/lib/utils/format";
import { Quote } from "lucide-react";
import type { PublishedReviewListItem } from "@/lib/types/public.types";

interface TestimonialCardProps {
  review: PublishedReviewListItem;
}

export function TestimonialCard({ review }: TestimonialCardProps) {
  // Truncate comment to ~120 chars
  const truncatedComment = review.comment
    ? review.comment.length > 120
      ? `${review.comment.slice(0, 120).trimEnd()}...`
      : review.comment
    : null;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-card lg:p-8">
      {/* Quote Icon */}
      <Quote className="text-primary-500/20 mb-4 h-8 w-8 shrink-0" />

      {/* Star Rating */}
      <StarRating rating={review.rating} size={18} className="mb-3" />

      {/* Review Title */}
      <h4 className="mb-2 line-clamp-1 font-display text-base font-semibold text-neutral-900 lg:text-lg">
        {review.title}
      </h4>

      {/* Review Comment (truncated) */}
      {truncatedComment && (
        <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600">
          &quot;{truncatedComment}&quot;
        </p>
      )}

      {/* Attribution — P23: NO clientName, use "Verified Guest" */}
      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4">
        <span className="text-sm font-medium text-neutral-800">
          Verified Guest
        </span>
        <span className="text-xs text-neutral-400">
          {formatDate(review.publishedAt)}
        </span>
      </div>
    </div>
  );
}
