"use client";

import { useParams } from "next/navigation";
import { AlertCircle, Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOwnerUnits } from "@/lib/hooks/useOwners";
import type { OwnerUnitResponse } from "@/lib/types/owner.types";
import { cn } from "@/lib/utils/cn";

export function OwnerUnitsList() {
  const { id } = useParams();
  const { data: units, isLoading, isError } = useOwnerUnits(id as string);

  // The shared response interceptor unwraps paginated payloads to
  // `{ items, pagination }`, so this endpoint may hand back either a bare
  // array or a paginated wrapper. Normalize to an array before rendering.
  const unitList: OwnerUnitResponse[] = Array.isArray(units)
    ? units
    : (units as { items?: OwnerUnitResponse[] } | undefined)?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-red-400" />}
        title="Could not load owner units"
        description="An error occurred while fetching the owner's units."
      />
    );
  }

  if (unitList.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="h-10 w-10 text-neutral-400" />}
        title="No units"
        description="This owner has no units assigned yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      {unitList.map((unit) => (
        <div
          key={unit.id}
          className="flex items-start justify-between rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-neutral-900">{unit.name}</h4>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  unit.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-600"
                )}
              >
                {unit.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
              <span className="capitalize">{unit.unitType}</span>
              <span>•</span>
              <span>{unit.bedrooms} Bed</span>
              <span>•</span>
              <span>{unit.bathrooms} Bath</span>
              <span>•</span>
              <span>Max {unit.maxGuests} Guests</span>
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-lg font-bold text-primary-600">
              {unit.basePricePerNight.toLocaleString()} EGP
            </div>
            <div className="text-xs text-neutral-500">per night</div>
          </div>
        </div>
      ))}
    </div>
  );
}
