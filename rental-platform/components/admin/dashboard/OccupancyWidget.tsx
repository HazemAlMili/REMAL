"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import { reportsService } from "@/lib/api/services/reports.service";
import { unitsService } from "@/lib/api/services/units.service";
import { queryKeys } from "@/lib/hooks/query-keys";
import { differenceInDays, format, startOfMonth, endOfMonth } from "date-fns";

// CORRECTED per API Reference Section 34 / P28:
// confirmedBookings → totalConfirmedBookingsCount
// completedBookings → totalCompletedBookingsCount

export function OccupancyWidget() {
  const dateFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const dateTo = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data: bookingsSummary, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.reports.bookingsSummary({ dateFrom, dateTo }),
    queryFn: () => reportsService.getBookingsSummary({ dateFrom, dateTo }),
    staleTime: 1000 * 60 * 10,
  });

  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: queryKeys.units.internalList({ pageSize: 1000 }),
    queryFn: () => unitsService.getInternalList({ pageSize: 1000 }),
    staleTime: 1000 * 60 * 10,
  });

  if (summaryLoading || unitsLoading) {
    return <Skeleton height={160} className="rounded-lg" />;
  }

  if (!bookingsSummary || !unitsData) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 font-medium text-neutral-700">Occupancy Rate</h3>
        <p className="text-sm italic text-neutral-400">Data unavailable</p>
      </div>
    );
  }

  // Compute occupancy rate
  const activeUnitCount = unitsData.items.filter((u) => u.isActive).length ?? 0;
  const daysInRange =
    differenceInDays(new Date(dateTo), new Date(dateFrom)) + 1;
  const totalActiveDays = daysInRange * activeUnitCount;

  // CORRECTED: use totalConfirmedBookingsCount + totalCompletedBookingsCount — P28
  const activeBookings =
    (bookingsSummary.totalConfirmedBookingsCount ?? 0) +
    (bookingsSummary.totalCompletedBookingsCount ?? 0);

  const occupancyRate =
    totalActiveDays > 0
      ? Math.min((activeBookings / totalActiveDays) * 100, 100)
      : 0;

  const threshold =
    occupancyRate >= 70
      ? { color: "var(--color-accent-green)", label: "High" }
      : occupancyRate >= 40
        ? { color: "var(--color-accent-amber)", label: "Medium" }
        : { color: "var(--color-error)", label: "Low" };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 font-medium text-neutral-700">Occupancy Rate</h3>
      <p className="mb-4 text-xs text-neutral-400">
        Current month (approximate)
      </p>

      {/* Radial progress */}
      <div className="flex items-center justify-center">
        <div className="relative h-32 w-32">
          <svg
            className="h-full w-full -rotate-90 transform"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-neutral-100)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={threshold.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${occupancyRate * 2.64} 264`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold"
              style={{ color: threshold.color }}
            >
              {occupancyRate.toFixed(0)}%
            </span>
            <span className="text-xs text-neutral-500">{threshold.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-neutral-400">
        {activeBookings} active bookings / {totalActiveDays} unit-days
      </div>
    </div>
  );
}
