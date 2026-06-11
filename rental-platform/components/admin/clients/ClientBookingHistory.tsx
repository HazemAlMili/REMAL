"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, getNights } from "@/lib/utils/format";
import { bookingsService } from "@/lib/api/services/bookings.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

interface ClientBookingHistoryProps {
  clientId: string;
}

export function ClientBookingHistory({ clientId }: ClientBookingHistoryProps) {
  // ⚠️ clientId filter on GET /api/internal/bookings is NOT documented in API Reference Section 16.
  // This query will only work if the backend supports the clientId query parameter.
  // If it returns an error or empty results unexpectedly, show a placeholder.
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.bookings.list({ clientId }),
    queryFn: () =>
      bookingsService.getList({ clientId, page: 1, pageSize: 100 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // If the API doesn't support clientId filter, show placeholder
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Booking History"
          description="Booking history requires backend confirmation of clientId filter support on the bookings endpoint."
        />
      </div>
    );
  }

  const bookings = data?.items ?? [];

  if (bookings.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No booking history"
          description="This client has no bookings."
        />
      </div>
    );
  }

  // Compute summary stats
  const activeBookings = bookings.filter((b) =>
    ["confirmed", "completed"].includes(b.bookingStatus)
  );
  const totalSpent = activeBookings.reduce((sum, b) => sum + b.finalAmount, 0);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white p-4">
          <span className="text-sm text-neutral-500">Total Bookings</span>
          <p className="text-[22px] font-semibold tabular-nums text-neutral-900">
            {bookings.length}
          </p>
        </div>
        <div className="rounded-[var(--portal-radius-card)] border border-neutral-200 bg-white p-4">
          <span className="text-sm text-neutral-500">Total Spent</span>
          <p className="text-[22px] font-semibold tabular-nums text-neutral-900">
            {formatCurrency(totalSpent)}
          </p>
        </div>
      </div>

      {/* Bookings table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Unit</th>
              <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Check-in</th>
              <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Check-out</th>
              <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Nights</th>
              <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Total</th>
              <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Status</th>
              <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Booked On</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-neutral-100 hover:bg-neutral-50"
              >
                <td className="px-3 py-2.5 text-sm">
                  <Link
                    href={`${ROUTES.admin.bookings.detail(booking.id)}`}
                    className="font-medium text-neutral-700 hover:text-primary-600 hover:underline"
                  >
                    {booking.unitName ?? `${booking.unitId.slice(0, 8)}...`}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-sm tabular-nums">
                  {formatDate(booking.checkInDate)}
                </td>
                <td className="px-3 py-2.5 text-sm tabular-nums">
                  {formatDate(booking.checkOutDate)}
                </td>
                <td className="px-3 py-2.5 text-sm tabular-nums">
                  {getNights(booking.checkInDate, booking.checkOutDate)}
                </td>
                <td className="px-3 py-2.5 text-sm font-medium tabular-nums">
                  {formatCurrency(booking.finalAmount)}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={booking.bookingStatus} />
                </td>
                <td className="px-3 py-2.5 text-sm tabular-nums text-neutral-500">
                  {formatDate(booking.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
