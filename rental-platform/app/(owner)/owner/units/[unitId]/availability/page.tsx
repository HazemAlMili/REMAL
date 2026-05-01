"use client";
import { use } from "react";
import { useOwnerUnit } from "@/lib/hooks/useOwnerPortal";
import { OwnerAvailabilityCalendar } from "@/components/owner/units/OwnerAvailabilityCalendar";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

export default function OwnerUnitAvailabilityPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = use(params);
  const { data: unit, isLoading } = useOwnerUnit(unitId);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-80 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href={ROUTES.owner.unitDetail(unitId)}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {unit?.unitName ?? "Unit"}
      </Link>

      {/* Calendar */}
      <OwnerAvailabilityCalendar
        unitId={unitId}
        unitName={unit?.unitName ?? "Unit"}
      />
    </div>
  );
}
