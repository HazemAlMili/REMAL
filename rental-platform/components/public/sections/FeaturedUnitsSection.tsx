// ═══════════════════════════════════════════════════════════
// components/public/sections/FeaturedUnitsSection.tsx
// Swiper carousel of featured units — dynamic loaded
// ═══════════════════════════════════════════════════════════

"use client";
import dynamic from "next/dynamic";
import { usePublicUnits } from "@/lib/hooks/usePublic";
import { useFadeUp } from "@/lib/hooks/animations";
import { Skeleton } from "@/components/ui/Skeleton";

// Swiper loaded via dynamic() — SSR disabled (client-only library)
const FeaturedUnitsCarousel = dynamic(
  () =>
    import("./FeaturedUnitsCarousel").then((mod) => ({
      default: mod.FeaturedUnitsCarousel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-hidden px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[85%] shrink-0 sm:w-[40%] lg:w-[28%]">
            <Skeleton className="aspect-[4/3] rounded-t-2xl" />
            <Skeleton className="mt-0 h-28 rounded-b-2xl" />
          </div>
        ))}
      </div>
    ),
  }
);

export function FeaturedUnitsSection() {
  const { data, isLoading } = usePublicUnits({ page: 1, pageSize: 8 });
  const headingRef = useFadeUp<HTMLDivElement>();

  const units = data?.items ?? [];

  // Hide section if no units after loading
  if (!isLoading && units.length === 0) return null;

  return (
    <section className="overflow-hidden bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-container">
        {/* Section Header */}
        <div
          ref={headingRef}
          className="mb-12 px-6 text-center motion-safe:opacity-0 lg:mb-16"
        >
          <span className="font-body text-sm font-medium uppercase tracking-wider text-primary-500">
            Properties
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">
            Featured Properties
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 lg:text-lg">
            Handpicked properties across Egypt&apos;s finest destinations — each
            one personally vetted for quality and comfort.
          </p>
        </div>

        {/* Carousel */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden px-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[85%] shrink-0 sm:w-[40%] lg:w-[28%]">
                <Skeleton className="aspect-[4/3] rounded-t-2xl" />
                <Skeleton className="mt-0 h-28 rounded-b-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <FeaturedUnitsCarousel units={units} />
        )}
      </div>
    </section>
  );
}
