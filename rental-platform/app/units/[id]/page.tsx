// ═══════════════════════════════════════════════════════════
// app/units/[id]/page.tsx
// Main unit detail page — orchestrates all components + API calls
// ═══════════════════════════════════════════════════════════

"use client";
import {
  usePublicUnitDetail,
  usePublicUnitImages,
  usePublicUnitAmenities,
  usePublicProjects,
} from "@/lib/hooks/usePublic";
import { UnitDetailInfo } from "@/components/public/unit/UnitDetailInfo";
import { UnitBookingPanel } from "@/components/public/unit/UnitBookingPanel";
import { UnitAmenitiesGrid } from "@/components/public/unit/UnitAmenitiesGrid";
import { UnitReviewsSection } from "@/components/public/unit/UnitReviewsSection";
import { UnitGallery } from "@/components/public/unit/UnitGallery";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function UnitDetailPage({ params }: { params: { id: string } }) {
  const { id: unitId } = params;
  const router = useRouter();

  const {
    data: unit,
    isLoading: unitLoading,
    isError,
  } = usePublicUnitDetail(unitId);
  const canLoadPublicUnitChildren = Boolean(
    unit && unit.isActive && unit.isVisibleInPortfolio
  );
  const { data: images } = usePublicUnitImages(
    unitId,
    canLoadPublicUnitChildren
  );
  const { data: amenities } = usePublicUnitAmenities(
    unitId,
    canLoadPublicUnitChildren
  );
  const { data: projects } = usePublicProjects();

  // Loading State
  if (unitLoading) {
    return (
      <div className="mx-auto max-w-container px-6 py-8">
        <Skeleton className="mb-8 h-[400px] w-full rounded-2xl" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-[500px] w-[380px] shrink-0 rounded-2xl" />
        </div>
      </div>
    );
  }

  // 404 / Error State
  if (isError || !unit || !unit.isActive || !unit.isVisibleInPortfolio) {
    return (
      <div className="mx-auto max-w-container px-6 py-20">
        <EmptyState
          title="Property not found"
          description="This property is not currently available in the public catalog. Browse the latest available properties instead."
          action={
            <Button variant="outline" onClick={() => router.push("/units")}>
              Browse all properties
            </Button>
          }
        />
      </div>
    );
  }

  // Sort images: cover first, then by displayOrder
  const sortedImages = [...(images || [])].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return a.displayOrder - b.displayOrder;
  });

  // Get project name
  const projectName = projects?.find((a) => a.id === unit.projectId)?.name;

  return (
    <div className="min-h-screen bg-white">
      {/* Gallery with hero image + thumbnail strip + lightbox */}
      <UnitGallery images={sortedImages} unitName={unit.name} />

      {/* Content */}
      <div className="unit-detail-summary mx-auto max-w-container px-6 py-10">
        <div className="unit-detail-summary-band mb-8 grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold leading-tight text-neutral-900">
              {unit.name}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              A quick read before you choose dates: capacity, bedrooms, project,
              amenities, and guest feedback are grouped below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="unit-detail-summary-stat px-3 py-1.5 text-sm font-medium text-neutral-700">
              Up to {unit.maxGuests} guests
            </span>
            <span className="unit-detail-summary-stat px-3 py-1.5 text-sm font-medium text-neutral-700">
              {unit.bedrooms} bedrooms
            </span>
            {projectName && (
              <span className="unit-detail-summary-stat px-3 py-1.5 text-sm font-medium text-neutral-700">
                {projectName}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="unit-detail-summary-main flex-1 space-y-10">
            <div className="unit-detail-section">
              <UnitDetailInfo unit={unit} projectName={projectName} />
            </div>
            <div className="unit-detail-section">
              <UnitAmenitiesGrid amenities={amenities || []} />
            </div>
            <UnitReviewsSection unitId={unitId} />
          </div>

          <div className="w-full shrink-0 lg:w-[380px]">
            <UnitBookingPanel
              unitId={unit.id}
              basePricePerNight={unit.basePricePerNight}
              maxGuests={unit.maxGuests}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
