import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";
import type { OwnerPortalBookingResponse } from "@/lib/types/owner-portal.types";

interface UpcomingBookingsProps {
  bookings: OwnerPortalBookingResponse[];
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
        <p className="text-sm text-neutral-500">
          No upcoming confirmed bookings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookings.map((booking) => (
        <div
          key={booking.bookingId}
          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">
              Unit ID: {booking.unitId}
            </p>
            <div className="mt-1 flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(booking.checkInDate), "MMM dd")} -{" "}
                {format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {booking.guestCount} guest{booking.guestCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-neutral-900">
              {booking.bookingStatus}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
