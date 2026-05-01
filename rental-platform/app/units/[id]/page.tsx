// ═══════════════════════════════════════════════════════════
// app/units/[id]/page.tsx
// Main unit detail page — orchestrates all components + API calls
// ═══════════════════════════════════════════════════════════

"use client";
import { use } from "react";
import {
  usePublicUnitDetail,
  usePublicUnitImages,
  usePublicUnitAmenities,
  usePublicAreas,
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

export default function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: unitId } = use(params);
  const router = useRouter();

  const {
    data: unit,
    isLoading: unitLoading,
    isError,
  } = usePublicUnitDetail(unitId);
  const { data: images } = usePublicUnitImages(unitId);
  const { data: amenities } = usePublicUnitAmenities(unitId);
  const { data: areas } = usePublicAreas();

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
  if (isError || !unit || !unit.isActive) {
    return (
      <div className="mx-auto max-w-container px-6 py-20">
        <EmptyState
          title="Property not found"
          description="This property may no longer be available or the link is incorrect."
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

  // Get area name
  const areaName = areas?.find((a) => a.id === unit.areaId)?.name;

  return (
    <div className="min-h-screen bg-white">
      {/* Gallery with hero image + thumbnail strip + lightbox */}
      <UnitGallery images={sortedImages} unitName={unit.name} />

      {/* Content */}
      <div className="mx-auto max-w-container px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column: Info + Amenities + Reviews */}
          <div className="flex-1 space-y-12">
            <UnitDetailInfo unit={unit} areaName={areaName} />
            <UnitAmenitiesGrid amenities={amenities || []} />
            <UnitReviewsSection unitId={unitId} />
          </div>

          {/* Right Column: Booking Panel */}
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
