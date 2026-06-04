"use client";

import { useState } from "react";
import {
  usePublicUnitReviewSummary,
  usePublicUnitReviewList,
} from "@/lib/hooks/usePublicReviews";
import { StarRating } from "@/components/public/cards/StarRating";
import { useFadeUp } from "@/lib/hooks/animations";
import { ReviewList } from "./ReviewList";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UnitReviewsSectionProps {
  unitId: string;
}

export function UnitReviewsSection({ unitId }: UnitReviewsSectionProps) {
  const sectionRef = useFadeUp<HTMLDivElement>();
  const [page, setPage] = useState(1);

  // Hook A: fetch review summary metrics
  const { data: summary, isLoading: summaryLoading } = usePublicUnitReviewSummary(unitId);

  // Hook B: fetch reviews list (paginated, 5 per page)
  const { data: reviews, isLoading: reviewsLoading } = usePublicUnitReviewList(unitId, page);

  const isLoading = summaryLoading || reviewsLoading;

  // ── Handle Empty Layout States Safely ──
  if (summary && summary.publishedReviewCount === 0) {
    return (
      <div ref={sectionRef} className="motion-safe:opacity-0">
        <h2 className="mb-6 font-display text-xl font-semibold text-neutral-900">
          Guest Reviews
        </h2>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 p-8 bg-neutral-50/20 text-center">
          <div className="rounded-full bg-primary-50 p-3 ring-8 ring-primary-50/50">
            <Star className="h-6 w-6 text-primary-500 stroke-[1.5]" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-600 leading-relaxed max-w-sm">
            <bdi>لا توجد تقييمات منشورة لهذه الوحدة بعد. كن أول من يشارك تجربته!</bdi>
          </p>
        </div>
      </div>
    );
  }

  // Calculate total pages for pagination controls
  const totalPages = summary ? Math.ceil(summary.publishedReviewCount / 5) : 0;

  return (
    <div ref={sectionRef} className="motion-safe:opacity-0 space-y-6">
      <h2 className="font-display text-xl font-semibold text-neutral-900">
        Guest Reviews
      </h2>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-neutral-100" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && summary && (
        <>
          {/* Dynamic Summary Cards */}
          <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4 shadow-sm">
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
                {summary.publishedReviewCount} {summary.publishedReviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {/* Paginated Reviews List */}
          {reviews && <ReviewList reviews={reviews} />}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-xs transition-all hover:bg-neutral-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs text-neutral-500 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-xs transition-all hover:bg-neutral-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
