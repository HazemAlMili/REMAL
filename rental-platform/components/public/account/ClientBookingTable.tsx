// ═══════════════════════════════════════════════════════════
// components/public/account/ClientBookingTable.tsx
// Desktop table view of bookings
// ═══════════════════════════════════════════════════════════

"use client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatCurrency, formatDate, getNights } from "@/lib/utils/format";
import { Star } from "lucide-react";
import type { ClientBooking } from "@/lib/types/client.types";
import type { BadgeVariant } from "@/components/ui/Badge";

const BOOKING_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Pending: "warning",
  Confirmed: "info",
  CheckIn: "success",
  Completed: "success",
  Cancelled: "danger",
  LeftEarly: "danger",
};

interface ClientBookingTableProps {
  bookings: ClientBooking[];
  reviewStatuses: Record<string, { hasReview: boolean; reviewStatus?: string }>; // bookingId → review info
  reviewLoadingIds: Set<string>; // booking IDs still checking review
}

export function ClientBookingTable({
  bookings,
  reviewStatuses,
  reviewLoadingIds,
}: ClientBookingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="px-4 py-3 text-left font-medium text-neutral-500">
              Unit
            </th>
            <th className="px-4 py-3 text-left font-medium text-neutral-500">
              Check-in
            </th>
            <th className="px-4 py-3 text-left font-medium text-neutral-500">
              Check-out
            </th>
            <th className="px-4 py-3 text-center font-medium text-neutral-500">
              Nights
            </th>
            <th className="px-4 py-3 text-center font-medium text-neutral-500">
              Guests
            </th>
            <th className="px-4 py-3 text-right font-medium text-neutral-500">
              Total
            </th>
            <th className="px-4 py-3 text-center font-medium text-neutral-500">
              Status
            </th>
            <th className="px-4 py-3 text-center font-medium text-neutral-500">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const nightsCount = getNights(
              booking.checkInDate,
              booking.checkOutDate
            );
            const isCompleted = booking.bookingStatus === "Completed"; // P10: bookingStatus
            const reviewInfo = reviewStatuses[booking.id]; // P10: id, NOT bookingId
            const isLoadingReview = reviewLoadingIds.has(booking.id);

            return (
              <tr
                key={booking.id}
                className="border-b border-neutral-100 hover:bg-neutral-50"
              >
                {/* Unit — unitId only (no unitName available per P10) */}
                <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                  {booking.unitId.slice(0, 8)}...
                </td>

                {/* Check-in */}
                <td className="px-4 py-3 text-neutral-900">
                  {formatDate(booking.checkInDate)}
                </td>

                {/* Check-out */}
                <td className="px-4 py-3 text-neutral-900">
                  {formatDate(booking.checkOutDate)}
                </td>

                {/* Nights */}
                <td className="px-4 py-3 text-center text-neutral-600">
                  {nightsCount}
                </td>

                {/* Guests */}
                <td className="px-4 py-3 text-center text-neutral-600">
                  {booking.guestCount}
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                  {formatCurrency(booking.finalAmount)}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={
                      BOOKING_STATUS_VARIANT[booking.bookingStatus] || "neutral"
                    }
                  >
                    {booking.bookingStatus}
                  </Badge>
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-center">
                  {isCompleted && isLoadingReview && (
                    <span className="text-xs text-neutral-400">
                      Checking...
                    </span>
                  )}
                  {isCompleted && !isLoadingReview && reviewInfo && (
                    <Link
                      href={
                        reviewInfo.hasReview
                          ? `/account/bookings/${booking.id}/review?edit=true`
                          : `/account/bookings/${booking.id}/review`
                      }
                    >
                      <Button variant="ghost" size="sm">
                        <Star className="mr-1 h-3 w-3" />
                        {reviewInfo.hasReview ? "Edit" : "Review"}
                      </Button>
                    </Link>
                  )}
                  {!isCompleted && (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
