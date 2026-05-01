"use client";

import { useState } from "react";
import { useOwnerUnits } from "@/lib/hooks/useOwnerPortal";
import { OwnerUnitCard } from "@/components/owner/units/OwnerUnitCard";
import { Button } from "@/components/ui/Button";

export default function OwnerUnitsPage() {
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );

  const { data, isLoading, error, refetch } = useOwnerUnits({
    isActive: isActiveFilter,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">My Units</h1>
          <p className="mt-1 text-sm text-neutral-500">
            View your property portfolio
          </p>
        </div>

        {/* Skeleton filters */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-20 animate-pulse rounded-lg bg-neutral-200"
            />
          ))}
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-lg bg-neutral-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">My Units</h1>
          <p className="mt-1 text-sm text-neutral-500">
            View your property portfolio
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load units
          </h2>
          <p className="mt-1 text-sm text-red-600">
            We could not load your units list.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const units = data.items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">My Units</h1>
        <p className="mt-1 text-sm text-neutral-500">
          View your property portfolio
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsActiveFilter(undefined)}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            isActiveFilter === undefined
              ? "bg-primary-600 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
          ].join(" ")}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setIsActiveFilter(true)}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            isActiveFilter === true
              ? "bg-primary-600 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
          ].join(" ")}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setIsActiveFilter(false)}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            isActiveFilter === false
              ? "bg-primary-600 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
          ].join(" ")}
        >
          Inactive
        </button>
      </div>

      {/* Empty state */}
      {units.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-neutral-900">No units found</p>
          <p className="mt-1 text-sm text-neutral-500">
            {isActiveFilter === undefined
              ? "You don't have any units yet."
              : isActiveFilter
                ? "You don't have any active units."
                : "You don't have any inactive units."}
          </p>
        </div>
      ) : (
        <>
          {/* Units grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <OwnerUnitCard key={unit.unitId} unit={unit} />
            ))}
          </div>

          {/* Pagination info */}
          {data.pagination && (
            <div className="text-center text-sm text-neutral-500">
              Showing {units.length} of {data.pagination.totalCount} units
            </div>
          )}
        </>
      )}
    </div>
  );
}
