"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOwnerBookings } from "@/lib/hooks/useOwnerPortal";
import { OwnerBookingRow } from "@/components/owner/bookings/OwnerBookingRow";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/routes";

export default function OwnerBookingsPage() {
  const router = useRouter();
  const [bookingStatus, setBookingStatus] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useOwnerBookings({
    bookingStatus,
    page,
    pageSize,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Bookings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            View all bookings for your units
          </p>
        </div>

        {/* Skeleton filters */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 animate-pulse rounded-lg bg-neutral-200"
            />
          ))}
        </div>

        {/* Skeleton table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="h-12 animate-pulse bg-neutral-100" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse border-t border-neutral-200 bg-white"
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
          <h1 className="text-2xl font-bold text-neutral-800">Bookings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            View all bookings for your units
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load bookings
          </h2>
          <p className="mt-1 text-sm text-red-600">
            We could not load your bookings list.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const bookings = data.items;
  const pagination = data.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Bookings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          View all bookings for your units
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setBookingStatus(undefined);
            setPage(1);
          }}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            bookingStatus === undefined
              ? "bg-primary-600 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
          ].join(" ")}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => {
            setBookingStatus("Confirmed");
            setPage(1);
          }}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            bookingStatus === "Confirmed"
              ? "bg-primary-600 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
          ].join(" ")}
        >
          Confirmed
        </button>
        <button
          type="button"
          onClick={() => {
            setBookingStatus("Completed");
            setPage(1);
          }}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            bookingStatus === "Completed"
              ? "bg-primary-600 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
          ].join(" ")}
        >
          Completed
        </button>
        <button
          type="button"
          onClick={() => {
            setBookingStatus("Cancelled");
            setPage(1);
          }}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            bookingStatus === "Cancelled"
              ? "bg-primary-600 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
          ].join(" ")}
        >
          Cancelled
        </button>
      </div>

      {/* Empty state */}
      {bookings.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-neutral-900">
            No bookings found
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {bookingStatus
              ? `You don't have any ${bookingStatus.toLowerCase()} bookings.`
              : "You don't have any bookings yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Bookings table */}
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Booking ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Unit ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Check-out
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Guests
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bookings.map((booking) => (
                    <OwnerBookingRow
                      key={booking.bookingId}
                      booking={booking}
                      onClick={() =>
                        router.push(
                          ROUTES.owner.bookingDetail(booking.bookingId)
                        )
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing {bookings.length} of {pagination.totalCount} bookings
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-3">
                  <span className="text-sm text-neutral-600">
                    Page {page} of {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
