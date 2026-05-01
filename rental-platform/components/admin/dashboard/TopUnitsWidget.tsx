"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { unitsService } from "@/lib/api/services/units.service";
import { queryKeys } from "@/lib/hooks/query-keys";
import { UNIT_TYPE_LABELS } from "@/lib/constants/unit-types";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { Home } from "lucide-react";

// NOTE: GET /api/internal/units does NOT document a sort parameter.
// This widget shows active units as a list — NOT ranked by booking count.
// "Top by bookings" requires backend support for sorting.

export function TopUnitsWidget() {
  const { data: unitsData, isLoading } = useQuery({
    queryKey: queryKeys.units.internalList({ pageSize: 5 }),
    queryFn: () => unitsService.getInternalList({ pageSize: 5 }),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return <Skeleton height={260} className="rounded-lg" />;
  }

  const activeUnits =
    unitsData?.items.filter((u) => u.isActive).slice(0, 5) ?? [];

  if (activeUnits.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-medium text-neutral-700">Active Units</h3>
        <EmptyState
          title="No active units"
          description="No units are currently active."
          icon={<Home size={32} />}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-neutral-700">Active Units</h3>
        <Link
          href={ROUTES.admin.units.list}
          className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {activeUnits.map((unit) => (
          <Link
            key={unit.id}
            href={ROUTES.admin.units.detail(unit.id)}
            className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-neutral-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-800">
                {unit.name}
              </p>
              <p className="text-xs text-neutral-500">
                {UNIT_TYPE_LABELS[
                  unit.unitType as keyof typeof UNIT_TYPE_LABELS
                ] ?? unit.unitType}
                {" · "}
                {unit.maxGuests} guests
                {" · "}
                {unit.bedrooms} bed
              </p>
            </div>
            <div className="ml-3 text-right">
              <span className="text-sm font-medium text-neutral-600">
                {formatCurrency(unit.basePricePerNight)}
              </span>
              <span className="text-xs text-neutral-400">/night</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-3 text-xs italic text-neutral-400">
        ⚠️ Sorting by booking count is not yet available — showing recent active
        units
      </p>
    </div>
  );
}
