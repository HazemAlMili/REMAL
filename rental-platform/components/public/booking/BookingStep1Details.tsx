// ═══════════════════════════════════════════════════════════
// components/public/booking/BookingStep1Details.tsx
// Step 1: Date confirmation + guest count + availability + pricing
// ═══════════════════════════════════════════════════════════

"use client";
import { useState, useEffect } from "react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingPricingSummary } from "./BookingPricingSummary";
import {
  usePricingCalculate,
  useAvailabilityCheck,
} from "@/lib/hooks/usePublic";
import { ShieldCheck, AlertCircle } from "lucide-react";
import type {
  PublicUnitDetail,
  PricingCalculateResponse,
} from "@/lib/types/public.types";

interface BookingStep1DetailsProps {
  unit: PublicUnitDetail;
  startDate: string | null;
  endDate: string | null;
  guestCount: number;
  onDatesChange: (start: string | null, end: string | null) => void;
  onGuestChange: (count: number) => void;
  onPricingChange?: (pricing: PricingCalculateResponse | null) => void;
  onContinue: () => void;
}

export function BookingStep1Details({
  unit,
  startDate,
  endDate,
  guestCount,
  onDatesChange,
  onGuestChange,
  onPricingChange,
  onContinue,
}: BookingStep1DetailsProps) {
  // Local date state for DateRangePicker (Date objects)
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: startDate ? new Date(startDate) : null,
    to: endDate ? new Date(endDate) : null,
  });

  // Sync local date state to parent
  useEffect(() => {
    const newStart: string | null = dateRange.from
      ? formatISO(dateRange.from)
      : null;
    const newEnd: string | null = dateRange.to ? formatISO(dateRange.to) : null;
    onDatesChange(newStart, newEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Pricing query (P05 corrected)
  const { data: pricing, isLoading: pricingLoading } = usePricingCalculate(
    unit.id,
    startDate,
    endDate
  );

  // Notify parent when pricing changes (for Step 3)
  useEffect(() => {
    if (onPricingChange) {
      onPricingChange(pricing || null);
    }
  }, [pricing, onPricingChange]);

  // Availability query (P04 corrected)
  const { data: availability, isLoading: availLoading } = useAvailabilityCheck(
    unit.id,
    startDate,
    endDate
  );

  const isAvailable = availability?.isAvailable ?? null;
  const canContinue = Boolean(
    startDate && endDate && isAvailable && guestCount > 0
  );

  return (
    <div className="space-y-6">
      {/* Dates */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Select Dates
        </label>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          minDate={new Date()}
        />
      </div>

      {/* Guest Count */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Number of Guests
        </label>
        <select
          value={guestCount}
          onChange={(e) => onGuestChange(Number(e.target.value))}
          className="focus:ring-primary-500/20 w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary-500"
        >
          {Array.from({ length: unit.maxGuests }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} {i === 0 ? "guest" : "guests"}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-neutral-500">
          Maximum {unit.maxGuests} guests
        </p>
      </div>

      {/* Availability Indicator */}
      {startDate && endDate && !availLoading && isAvailable !== null && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            isAvailable
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {isAvailable ? (
            <>
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                Dates are available! Complete your request to secure them.
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div>
                <span>Not available for these dates.</span>
                {availability?.reason && (
                  <p className="mt-0.5 text-xs">
                    Reason: {availability.reason}
                  </p>
                )}
                {availability?.blockedDates &&
                  availability.blockedDates.length > 0 && (
                    <p className="mt-0.5 text-xs">
                      Blocked: {availability.blockedDates.join(", ")}
                    </p>
                  )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Loading indicator for availability */}
      {startDate && endDate && availLoading && (
        <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-500">
          <Skeleton className="h-4 w-4 rounded-full" />
          <span>Checking availability...</span>
        </div>
      )}

      {/* Pricing Summary */}
      {startDate && endDate && pricing && (
        <BookingPricingSummary pricing={pricing} />
      )}

      {/* Pricing loading */}
      {startDate && endDate && pricingLoading && (
        <div className="space-y-3 rounded-xl bg-neutral-50 p-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-40" />
        </div>
      )}

      {/* Select dates prompt */}
      {(!startDate || !endDate) && (
        <div className="rounded-xl bg-neutral-50 p-4 text-center text-sm text-neutral-500">
          Select dates to see pricing and availability
        </div>
      )}

      {/* Continue Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onContinue}
        disabled={!canContinue}
      >
        Continue
      </Button>

      <p className="text-center text-xs text-neutral-400">
        You will not be charged yet. Our team will contact you to confirm.
      </p>
    </div>
  );
}

function formatISO(date: Date): string {
  const isoString = date.toISOString();
  const datePart = isoString.split("T")[0];
  return datePart!;
}
