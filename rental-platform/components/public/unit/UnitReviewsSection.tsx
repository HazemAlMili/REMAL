// ═══════════════════════════════════════════════════════════
// components/public/unit/UnitReviewsSection.tsx
// Review summary + list (P22/P23 corrected)
// ═══════════════════════════════════════════════════════════

"use client";
import {
  usePublicReviews,
  usePublicReviewSummary,
} from "@/lib/hooks/usePublic";
import { StarRating } from "@/components/public/cards/StarRating";
import { useFadeUp } from "@/lib/hooks/animations";
import { formatDate } from "@/lib/utils/format";

interface UnitReviewsSectionProps {
  unitId: string;
}

export function UnitReviewsSection({ unitId }: UnitReviewsSectionProps) {
  const sectionRef = useFadeUp<HTMLDivElement>();
  const { data: summary } = usePublicReviewSummary(unitId);
  const { data: reviews, isLoading } = usePublicReviews(unitId, {
    page: 1,
    pageSize: 5,
  });

  // Hide section if no reviews
  if (!summary || summary.publishedReviewCount === 0) return null;

  return (
    <div ref={sectionRef} className="motion-safe:opacity-0">
      <h2 className="mb-6 font-display text-xl font-semibold text-neutral-900">
        Guest Reviews
      </h2>

      {/* Summary */}
      {summary && (
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
          <div className="text-center">
            <div className="font-display text-4xl font-bold text-neutral-900">
              {summary.averageRating.toFixed(1)}
            </div>
            <StarRating
              rating={Math.round(summary.averageRating)}
              size={16}
              className="mt-1 justify-center"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {summary.publishedReviewCount} reviews
            </p>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        )}

        {reviews?.map((review) => (
          <div
            key={review.reviewId}
            className="border-b border-neutral-100 pb-6 last:border-0"
          >
            <div className="mb-2 flex items-center gap-3">
              <StarRating rating={review.rating} size={14} />
              <span className="font-semibold text-neutral-900">
                {review.title}
              </span>
            </div>
            {review.comment && (
              <p className="mb-2 text-sm leading-relaxed text-neutral-600">
                {review.comment}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Verified Guest</span>
              <span>·</span>
              <span>{formatDate(review.publishedAt)}</span>
            </div>
            {/* Owner Reply */}
            {review.ownerReplyText && (
              <div className="border-primary-500/30 ml-4 mt-3 border-l-2 pl-4">
                <p className="text-sm text-neutral-600">
                  {review.ownerReplyText}
                </p>
                {review.ownerReplyUpdatedAt && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Owner replied · {formatDate(review.ownerReplyUpdatedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
