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
          title="No bookings yet"
          description="This client has no bookings."
        />
      </div>
    );
  }

  // Compute summary stats
  const activeBookings = bookings.filter((b) =>
    ["Confirmed", "CheckIn", "Completed"].includes(b.bookingStatus)
  );
  const totalSpent = activeBookings.reduce((sum, b) => sum + b.finalAmount, 0);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-neutral-50 p-4">
          <span className="text-sm text-neutral-500">Total Bookings</span>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-4">
          <span className="text-sm text-neutral-500">Total Spent</span>
          <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {/* Bookings table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-neutral-500">
              <th className="p-3">Unit</th>
              <th className="p-3">Check-in</th>
              <th className="p-3">Check-out</th>
              <th className="p-3">Nights</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Booked On</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-neutral-50">
                <td className="p-3 text-sm">
                  <Link
                    href={`${ROUTES.admin.bookings.detail(booking.id)}`}
                    className="font-mono text-blue-600 hover:underline"
                  >
                    {booking.unitId.slice(0, 8)}…
                  </Link>
                </td>
                <td className="p-3 text-sm">
                  {formatDate(booking.checkInDate)}
                </td>
                <td className="p-3 text-sm">
                  {formatDate(booking.checkOutDate)}
                </td>
                <td className="p-3 text-sm">
                  {getNights(booking.checkInDate, booking.checkOutDate)}
                </td>
                <td className="p-3 text-sm font-medium">
                  {formatCurrency(booking.finalAmount)}
                </td>
                <td className="p-3">
                  <StatusBadge status={booking.bookingStatus} />
                </td>
                <td className="p-3 text-sm text-neutral-500">
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
