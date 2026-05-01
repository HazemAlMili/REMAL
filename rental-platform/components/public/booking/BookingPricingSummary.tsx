// ═══════════════════════════════════════════════════════════
// components/public/booking/BookingPricingSummary.tsx
// Pricing breakdown for selected dates
// ═══════════════════════════════════════════════════════════

import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { PricingCalculateResponse } from "@/lib/types/public.types";

interface BookingPricingSummaryProps {
  pricing: PricingCalculateResponse;
}

export function BookingPricingSummary({ pricing }: BookingPricingSummaryProps) {
  return (
    <div className="space-y-3 rounded-xl bg-neutral-50 p-4">
      <h4 className="font-semibold text-neutral-900">Price Details</h4>

      {/* Nightly Breakdown */}
      <div className="space-y-2">
        {pricing.nights.map((night) => (
          <div
            key={night.date}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-neutral-600">
              {formatDate(night.date)}
              {night.priceSource === "SeasonalPricing" && (
                <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                  Seasonal
                </span>
              )}
            </span>
            <span className="text-neutral-900">
              {formatCurrency(night.pricePerNight)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
        <span className="font-semibold text-neutral-900">
          Total ({pricing.nights.length}{" "}
          {pricing.nights.length === 1 ? "night" : "nights"})
        </span>
        <span className="font-display text-xl font-bold text-neutral-900">
          {formatCurrency(pricing.totalPrice)}{" "}
          {/* P05: totalPrice, NOT totalAmount */}
        </span>
      </div>

      <p className="text-xs text-neutral-500">
        Final pricing may vary. A deposit will be required upon confirmation by
        our team.
      </p>
    </div>
  );
}
