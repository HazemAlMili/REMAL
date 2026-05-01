// ═══════════════════════════════════════════════════════════
// components/public/sections/TestimonialsSection.tsx
// Section wrapper — heading + curated reviews + dynamic carousel
// ═══════════════════════════════════════════════════════════

"use client";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQueries } from "@tanstack/react-query";
import { publicService } from "@/lib/api/services/public.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { useFadeUp } from "@/lib/hooks/animations";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  TESTIMONIAL_UNIT_IDS,
  MAX_REVIEWS_PER_UNIT,
} from "@/lib/constants/curated-units";
import type { PublishedReviewListItem } from "@/lib/types/public.types";

const TestimonialsCarousel = dynamic(
  () =>
    import("./TestimonialsCarousel").then((mod) => ({
      default: mod.TestimonialsCarousel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[250px] w-[85%] shrink-0 rounded-2xl sm:w-[45%] lg:w-[30%]"
          />
        ))}
      </div>
    ),
  }
);

export function TestimonialsSection() {
  const headingRef = useFadeUp<HTMLDivElement>();

  // Fetch reviews for each curated unit in parallel using useQueries
  const reviewQueries = useQueries({
    queries: TESTIMONIAL_UNIT_IDS.map((unitId) => ({
      queryKey: queryKeys.publicReviews.byUnit(unitId, {
        page: 1,
        pageSize: MAX_REVIEWS_PER_UNIT,
      }),
      queryFn: () =>
        publicService.getUnitReviews(unitId, {
          page: 1,
          pageSize: MAX_REVIEWS_PER_UNIT,
        }),
      enabled: !!unitId,
    })),
  });

  const isLoading = reviewQueries.some((q) => q.isLoading);

  // Flatten reviews from all units, take MAX_REVIEWS_PER_UNIT per unit
  const allReviews = useMemo<PublishedReviewListItem[]>(() => {
    const collected: PublishedReviewListItem[] = [];
    reviewQueries.forEach((query) => {
      if (query.data) {
        collected.push(...query.data.slice(0, MAX_REVIEWS_PER_UNIT));
      }
    });
    return collected;
  }, [reviewQueries]);

  // Hide section entirely if no curated unit IDs configured
  if (TESTIMONIAL_UNIT_IDS.length === 0) return null;

  return (
    <section className="bg-neutral-50 py-20 lg:py-32">
      <div className="mx-auto max-w-container px-6">
        {/* Section Header */}
        <div
          ref={headingRef}
          className="mb-12 text-center motion-safe:opacity-0 lg:mb-16"
        >
          <span className="font-body text-sm font-medium uppercase tracking-wider text-primary-500">
            Testimonials
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">
            What Our Guests Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 lg:text-lg">
            Real experiences from travelers who&apos;ve stayed at our curated
            properties.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[250px] w-[85%] shrink-0 rounded-2xl sm:w-[45%] lg:w-[30%]"
              />
            ))}
          </div>
        )}

        {/* Carousel or Empty State */}
        {!isLoading && allReviews.length > 0 && (
          <TestimonialsCarousel reviews={allReviews} />
        )}

        {/* Empty State — no reviews exist yet (early launch) */}
        {!isLoading && allReviews.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-body text-lg text-neutral-500">
              Be the first to experience our properties
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Guest reviews will appear here after their stay
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
