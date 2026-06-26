// ═══════════════════════════════════════════════════════════
// components/public/sections/AreasSection.tsx
// Areas grid with staggered entrance animation
// ═══════════════════════════════════════════════════════════

"use client";
import { usePublicAreas } from "@/lib/hooks/usePublic";
import { useStaggerCards, useFadeUp } from "@/lib/hooks/animations";
import { AreaCard } from "@/components/public/cards/AreaCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function AreasSection() {
  const { data: areas, isLoading } = usePublicAreas();
  const headingRef = useFadeUp<HTMLDivElement>();
  const gridRef = useStaggerCards<HTMLDivElement>({ stagger: 0.15 });

  // Filter to active areas only
  const activeAreas = (areas ?? []).filter((area) => area.isActive);

  // Hide section entirely if no active areas (after loading completes)
  if (!isLoading && activeAreas.length === 0) return null;

  return (
    <section className="bg-neutral-50 py-20 lg:py-32">
      <div className="mx-auto max-w-container px-6">
        {/* Section Header */}
        <div
          ref={headingRef}
          className="mb-12 text-center motion-safe:opacity-0 lg:mb-16"
        >
          <span className="font-body text-sm font-medium uppercase tracking-wider text-primary-500">
            Destinations
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">
            Explore Our Destinations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 lg:text-lg">
            From pristine Mediterranean coastlines to serene resort communities
            — discover the perfect setting for your next getaway.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        )}

        {/* Area Cards Grid */}
        {!isLoading && activeAreas.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {activeAreas.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
