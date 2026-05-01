// ═══════════════════════════════════════════════════════════
// components/public/sections/MapSection.tsx
// Section wrapper — heading + dynamically loaded map
// ═══════════════════════════════════════════════════════════

"use client";
import dynamic from "next/dynamic";
import { usePublicAreas } from "@/lib/hooks/usePublic";
import { useFadeUp } from "@/lib/hooks/animations";
import { Skeleton } from "@/components/ui/Skeleton";

const UnitsMap = dynamic(
  () =>
    import("@/components/public/map/UnitsMap").then((mod) => ({
      default: mod.UnitsMap,
    })),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[400px] w-full rounded-2xl lg:h-[500px]" />
    ),
  }
);

export function MapSection() {
  const { data: areas, isLoading } = usePublicAreas();
  const headingRef = useFadeUp<HTMLDivElement>();

  const activeAreas = (areas ?? []).filter((area) => area.isActive);

  // Hide section if no areas
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
            Locations
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">
            Where We Are
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 lg:text-lg">
            Our properties span Egypt&apos;s most desirable coastal and resort
            communities.
          </p>
        </div>

        {/* Map */}
        <div className="overflow-hidden rounded-2xl shadow-card">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full lg:h-[500px]" />
          ) : (
            <UnitsMap areas={activeAreas} />
          )}
        </div>
      </div>
    </section>
  );
}
