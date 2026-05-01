// ═══════════════════════════════════════════════════════════
// components/public/unit/PricingBreakdown.tsx
// Nightly breakdown accordion + total
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ChevronDown } from "lucide-react";
import type { PricingCalculateResponse } from "@/lib/types/public.types";

interface PricingBreakdownProps {
  pricing: PricingCalculateResponse;
  isLoading: boolean;
}

export function PricingBreakdown({
  pricing,
  isLoading,
}: PricingBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading)
    return (
      <div className="mb-4 h-20 animate-pulse rounded-lg bg-neutral-100" />
    );

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-neutral-100">
      {/* Total */}
      <div className="flex items-center justify-between p-4">
        <span className="font-semibold text-neutral-900">
          {pricing.nights.length}{" "}
          {pricing.nights.length === 1 ? "night" : "nights"} total
        </span>
        <span className="font-display text-xl font-bold text-neutral-900">
          {formatCurrency(pricing.totalPrice)}
        </span>
      </div>

      {/* Toggle Breakdown */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
      >
        <span>Price breakdown</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Nightly List */}
      {isExpanded && (
        <div className="space-y-2 px-4 pb-4">
          {pricing.nights.map((night) => (
            <div
              key={night.date}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-neutral-600">{formatDate(night.date)}</span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-900">
                  {formatCurrency(night.pricePerNight)}
                </span>
                {night.priceSource === "SeasonalPricing" && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                    Seasonal
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
