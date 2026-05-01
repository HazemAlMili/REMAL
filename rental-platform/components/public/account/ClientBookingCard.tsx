// ═══════════════════════════════════════════════════════════
// components/public/account/ClientBookingCard.tsx
// Individual booking card — used in mobile list
// ═══════════════════════════════════════════════════════════

"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, getNights } from "@/lib/utils/format";
import { useBookingReview } from "@/lib/hooks/useClient";
import { Calendar, Users, Star } from "lucide-react";
import type { ClientBooking } from "@/lib/types/client.types";
import type { BadgeVariant } from "@/components/ui/Badge";

// Status badge color mapping (P10: bookingStatus, NOT status)
const BOOKING_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Pending: "warning",
  Confirmed: "info",
  CheckIn: "success",
  Completed: "success",
  Cancelled: "danger",
  LeftEarly: "danger",
};

interface ClientBookingCardProps {
  booking: ClientBooking;
}

export function ClientBookingCard({ booking }: ClientBookingCardProps) {
  const isCompleted = booking.bookingStatus === "Completed"; // P10: bookingStatus
  const nightsCount = getNights(booking.checkInDate, booking.checkOutDate);

  // Check if review exists (only for Completed bookings)
  const { data: existingReview, isLoading: reviewLoading } = useBookingReview(
    booking.id, // P10: id, NOT bookingId
    isCompleted // Only check for completed bookings
  );

  const hasReview = existingReview !== null && existingReview !== undefined;
  const reviewActionHref = hasReview
    ? `/account/bookings/${booking.id}/review?edit=true` // Edit existing review
    : `/account/bookings/${booking.id}/review`; // Write new review

  return (
    <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-card">
      {/* Status + Date Row */}
      <div className="flex items-center justify-between">
        <Badge
          variant={BOOKING_STATUS_VARIANT[booking.bookingStatus] || "neutral"}
        >
          {booking.bookingStatus}
        </Badge>
        <span className="text-xs text-neutral-400">
          {formatDate(booking.createdAt)}
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-primary-500" />
        <span className="font-medium text-neutral-900">
          {formatDate(booking.checkInDate)}
        </span>
        <span className="text-neutral-400">→</span>
        <span className="font-medium text-neutral-900">
          {formatDate(booking.checkOutDate)}
        </span>
        <span className="text-neutral-500">
          ({nightsCount} {nightsCount === 1 ? "night" : "nights"})
        </span>
      </div>

      {/* Guests */}
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Users className="h-4 w-4 text-primary-500" />
        <span>
          {booking.guestCount} {booking.guestCount === 1 ? "guest" : "guests"}
        </span>
      </div>

      {/* Unit ID — placeholder until unitName is available */}
      <p className="text-xs text-neutral-400">
        Unit: {booking.unitId.slice(0, 8)}...
      </p>

      {/* Price */}
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm text-neutral-500">Total</span>
        <span className="font-display text-lg font-bold text-neutral-900">
          {formatCurrency(booking.finalAmount)}
        </span>
      </div>

      {/* Write Review Action */}
      {isCompleted && !reviewLoading && (
        <Link href={reviewActionHref}>
          <Button variant="secondary" size="sm" className="w-full">
            <Star className="mr-2 h-4 w-4" />
            {hasReview ? "Edit Review" : "Write Review"}
          </Button>
        </Link>
      )}

      {/* Review loading */}
      {isCompleted && reviewLoading && (
        <div className="h-9 animate-pulse rounded-lg bg-neutral-100" />
      )}

      {/* Review status indicator */}
      {isCompleted && hasReview && existingReview && (
        <p className="text-xs text-neutral-400">
          Review status: {existingReview.reviewStatus}
        </p>
      )}
    </div>
  );
}
