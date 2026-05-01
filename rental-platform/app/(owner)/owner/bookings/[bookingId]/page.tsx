"use client";

import { useParams, useRouter } from "next/navigation";
import { useOwnerBooking } from "@/lib/hooks/useOwnerPortal";
import { OwnerBookingDetail } from "@/components/owner/bookings/OwnerBookingDetail";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/routes";

export default function OwnerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = useOwnerBooking(bookingId);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton header */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>

        {/* Skeleton status badge */}
        <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-200" />

        {/* Skeleton details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-lg bg-neutral-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.owner.bookings)}
          >
            ← Back to Bookings
          </Button>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load booking
          </h2>
          <p className="mt-1 text-sm text-red-600">
            We could not load the booking details.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.owner.bookings)}
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Booking Details
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              View booking information
            </p>
          </div>
        </div>
      </div>

      {/* Booking detail component */}
      <OwnerBookingDetail booking={booking} />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(ROUTES.owner.unitDetail(booking.unitId))}
        >
          View Unit
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `${ROUTES.owner.finance}?bookingId=${booking.bookingId}`
            )
          }
        >
          View Finance
        </Button>
      </div>
    </div>
  );
}
