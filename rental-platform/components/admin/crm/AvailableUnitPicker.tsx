"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { UNIT_TYPE_LABELS } from "@/lib/constants/unit-types";
import type { UnitListItemResponse, UnitType } from "@/lib/types/unit.types";

const TYPE_CHIPS: Array<{ value: "" | UnitType; label: string }> = [
  { value: "", label: "All" },
  ...(Object.entries(UNIT_TYPE_LABELS) as Array<[UnitType, string]>).map(
    ([value, label]) => ({ value, label })
  ),
];

interface AvailableUnitPickerProps {
  /** Units already filtered by date range (and unit type) from the live catalog query. */
  units: UnitListItemResponse[];
  value: string | null;
  onChange: (id: string | null) => void;
  unitTypeFilter: "" | UnitType;
  onUnitTypeFilterChange: (type: "" | UnitType) => void;
  hasValidRange: boolean;
  isRefreshing: boolean;
  disabled?: boolean;
}

/**
 * Inline, always-visible picker for available units. Replaces the closed
 * combobox so the operator can see and compare the facts that decide the pick
 * (type, area, capacity, price) and select with one click. Selection uses the
 * terracotta spotlight (primary) per the admin design system.
 */
export function AvailableUnitPicker({
  units,
  value,
  onChange,
  unitTypeFilter,
  onUnitTypeFilterChange,
  hasValidRange,
  isRefreshing,
  disabled = false,
}: AvailableUnitPickerProps) {
  const [query, setQuery] = useState("");

  const visibleUnits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return units;
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.areaName.toLowerCase().includes(q)
    );
  }, [units, query]);

  if (!hasValidRange) {
    return (
      <div className="rounded-[var(--portal-radius-control)] border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        Select a date range above to see available units.
      </div>
    );
  }

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_CHIPS.map((chip) => {
          const active = unitTypeFilter === chip.value;
          return (
            <button
              key={chip.value || "all"}
              type="button"
              disabled={disabled}
              onClick={() => onUnitTypeFilterChange(chip.value)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              {chip.label}
            </button>
          );
        })}
        <span className="ms-auto text-xs text-neutral-500">
          {isRefreshing
            ? "Refreshing…"
            : `${units.length} ${units.length === 1 ? "unit" : "units"} available`}
        </span>
      </div>

      <div className="relative">
        <Search
          aria-hidden="true"
          size={15}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search units by name or area"
          disabled={disabled || (units.length === 0 && !query)}
          className="h-[var(--portal-control-height)] w-full rounded-[var(--portal-radius-control)] border border-neutral-300 bg-white pe-3 ps-9 text-sm text-neutral-800 placeholder:text-neutral-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50"
        />
      </div>

      {isRefreshing ? (
        <div className="flex items-center justify-center gap-2 rounded-[var(--portal-radius-control)] border border-neutral-200 px-4 py-8 text-sm text-neutral-500">
          <Loader2 aria-hidden="true" size={16} className="animate-spin" />
          Loading available units…
        </div>
      ) : units.length === 0 ? (
        <p className="rounded-[var(--portal-radius-control)] border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          {unitTypeFilter
            ? `No available ${UNIT_TYPE_LABELS[
                unitTypeFilter
              ].toLowerCase()} units for these dates. Choose another type or adjust the dates.`
            : "No units are available for these dates. Try adjusting the date range."}
        </p>
      ) : visibleUnits.length === 0 ? (
        <p className="rounded-[var(--portal-radius-control)] border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          No units match “{query.trim()}”.
        </p>
      ) : (
        <div className="grid max-h-72 grid-cols-1 gap-2 overflow-auto sm:grid-cols-2">
          {visibleUnits.map((unit) => {
            const selected = unit.id === value;
            return (
              <button
                key={unit.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(selected ? null : unit.id)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col gap-1.5 rounded-[var(--portal-radius-control)] border p-3 text-start transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                  selected
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                    : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50",
                  disabled && "cursor-not-allowed opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-medium text-neutral-900">
                    {unit.name}
                  </span>
                  {selected && (
                    <Check
                      aria-hidden="true"
                      size={16}
                      className="shrink-0 text-primary-600"
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-[2px] text-xs text-neutral-700">
                    {UNIT_TYPE_LABELS[unit.unitType]}
                  </span>
                  <span className="truncate text-xs text-neutral-500">
                    {unit.areaName}
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {unit.maxGuests} {unit.maxGuests === 1 ? "guest" : "guests"} ·{" "}
                  {unit.bedrooms} bd · {unit.bathrooms} ba
                </p>
                <p className="text-xs font-medium text-neutral-800">
                  {formatCurrency(unit.basePricePerNight)} / night
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
