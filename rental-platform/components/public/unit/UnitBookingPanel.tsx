// ═══════════════════════════════════════════════════════════
// components/public/unit/UnitBookingPanel.tsx
// Sticky booking panel — dates, guests, pricing, availability, CTA
// ═══════════════════════════════════════════════════════════

"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  usePricingCalculate,
  useAvailabilityCheck,
} from "@/lib/hooks/usePublic";
import { Button } from "@/components/ui/Button";
import { DateRangePicker, DateRange } from "@/components/ui/DateRangePicker";
import { PricingBreakdown } from "./PricingBreakdown";
import {
  formatCurrency,
  formatDateForApi,
  getTodayDateString,
  parseDateOnly,
} from "@/lib/utils/format";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface UnitBookingPanelProps {
  unitId: string;
  basePricePerNight: number;
  maxGuests: number;
}

export function UnitBookingPanel({
  unitId,
  basePricePerNight,
  maxGuests,
}: UnitBookingPanelProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [guestCount, setGuestCount] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const today = useMemo(() => getTodayDateString(), []);
  const preloadEndDate = useMemo(() => {
    const end = parseDateOnly(today);
    end.setDate(end.getDate() + 180);
    return formatDateForApi(end);
  }, [today]);

  const {
    data: pricing,
    isLoading: pricingLoading,
    isError: pricingError,
  } = usePricingCalculate(unitId, startDate || null, endDate || null);
  const { data: availability, isLoading: availLoading } = useAvailabilityCheck(
    unitId,
    startDate || null,
    endDate || null
  );
  const { data: calendarAvailability } = useAvailabilityCheck(
    unitId,
    today,
    preloadEndDate
  );

  const disabledDates = useMemo(
    () =>
      (calendarAvailability?.blockedDates ?? []).map((date) =>
        parseDateOnly(date)
      ),
    [calendarAvailability?.blockedDates]
  );

  const isAvailable = availability?.isAvailable ?? null;
  const canBook = Boolean(startDate && endDate && isAvailable);

  const handleBookNow = () => {
    if (!startDate || !endDate) return;
    router.push(
      `/units/${unitId}/book?startDate=${startDate}&endDate=${endDate}&guests=${guestCount}`
    );
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setStartDate(range.from ? formatDateForApi(range.from) : "");
    setEndDate(range.to ? formatDateForApi(range.to) : "");
  };

  return (
    <div className="sticky top-24 rounded-2xl border border-neutral-100 bg-white p-6 shadow-card">
      {/* Price Header */}
      <div className="mb-6">
        <span className="font-display text-2xl font-bold text-neutral-900">
          {formatCurrency(basePricePerNight)}
        </span>
        <span className="text-sm text-neutral-500"> / night</span>
      </div>

      {/* Date Range Inputs */}
      <div className="mb-4">
        <DateRangePicker
          label="Dates"
          value={dateRange}
          onChange={handleDateRangeChange}
          minDate={parseDateOnly(today)}
          disabledDates={disabledDates}
          placeholder="Check-in → Check-out"
        />
      </div>

      {/* Guest Count */}
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Guests
        </label>
        <select
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {Array.from({ length: maxGuests }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} {i === 0 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Indicator */}
      {startDate && endDate && !availLoading && isAvailable !== null && (
        <div
          className={`mb-4 flex items-center gap-2 text-sm ${isAvailable ? "text-green-600" : "text-red-600"}`}
        >
          {isAvailable ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>
            {isAvailable
              ? "Available for selected dates"
              : `Not available: ${availability?.reason || "dates are blocked"}`}
          </span>
        </div>
      )}

      {/* Pricing Breakdown */}
      {startDate && endDate && pricing && !pricingError && (
        <PricingBreakdown pricing={pricing} isLoading={pricingLoading} />
      )}

      {/* Select dates prompt */}
      {(!startDate || !endDate) && (
        <p className="mb-4 text-sm text-neutral-500">
          Select dates to see price and availability
        </p>
      )}

      {/* Book Now Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleBookNow}
        disabled={!canBook}
      >
        {isAvailable === false ? "Dates Not Available" : "Book Now"}
      </Button>

      <p className="mt-3 text-center text-xs text-neutral-400">
        You will not be charged yet
      </p>
    </div>
  );
}
