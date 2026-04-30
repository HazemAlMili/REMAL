import type { UnitPublishedReviewSummaryResponse } from "@/lib/types/review.types";

interface OwnerReviewSummaryProps {
  summary: UnitPublishedReviewSummaryResponse;
}

export function OwnerReviewSummary({ summary }: OwnerReviewSummaryProps) {
  const fullStars = Math.floor(summary.averageRating);
  const hasHalfStar = summary.averageRating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-6 rounded-xl bg-neutral-50 p-4">
      {/* Average Rating */}
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold text-neutral-900">
          {summary.averageRating.toFixed(1)}
        </span>
        <div className="mt-1 flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={[
                "h-5 w-5",
                i < fullStars
                  ? "fill-amber-400 text-amber-400"
                  : i === fullStars && hasHalfStar
                    ? "fill-amber-200 text-amber-400"
                    : "text-neutral-300",
              ].join(" ")}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Review Count */}
      <div className="flex flex-col">
        <span className="text-sm text-neutral-500">Published reviews</span>
        <span className="text-lg font-semibold text-neutral-800">
          {summary.publishedReviewCount}
        </span>
      </div>
    </div>
  );
}
