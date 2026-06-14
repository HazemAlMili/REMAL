"use client";

import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Select } from "@/components/ui/Select";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

export type ReportPreset =
  | "last7"
  | "last30"
  | "last3m"
  | "last12m"
  | "thisMonth"
  | "all"
  | "custom";

export interface ReportRangeValue {
  preset: ReportPreset;
  from: Date | null;
  to: Date | null;
}

const PRESET_OPTIONS: { value: ReportPreset; label: string }[] = [
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "last3m", label: "Last 3 months" },
  { value: "last12m", label: "Last 12 months" },
  { value: "thisMonth", label: "This month" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range…" },
];

/**
 * Resolve a preset to a concrete [from, to] range. `all` clears the range
 * (no date filter → backend returns every period); `custom` keeps whatever the
 * caller already holds, since the calendar owns those dates.
 */
export function resolveReportPreset(
  preset: ReportPreset,
  current?: { from: Date | null; to: Date | null }
): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (preset) {
    case "last7":
      return { from: subDays(now, 6), to: now };
    case "last30":
      return { from: subDays(now, 29), to: now };
    case "last3m":
      return { from: subMonths(now, 3), to: now };
    case "last12m":
      return { from: subMonths(now, 12), to: now };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "all":
      return { from: null, to: null };
    case "custom":
      return { from: current?.from ?? null, to: current?.to ?? null };
  }
}

/** Default landing range: last 3 months, so the page opens on recent activity. */
export const DEFAULT_REPORT_RANGE: ReportRangeValue = {
  preset: "last3m",
  ...resolveReportPreset("last3m"),
};

function summarize(value: ReportRangeValue): string {
  if (value.preset === "all") return "All time";
  if (!value.from) return "Select a range";
  const from = format(value.from, "MMM d, yyyy");
  if (!value.to) return `${from} → …`;
  return `${from} → ${format(value.to, "MMM d, yyyy")}`;
}

interface ReportRangeFilterProps {
  value: ReportRangeValue;
  onChange: (next: ReportRangeValue) => void;
}

export function ReportRangeFilter({ value, onChange }: ReportRangeFilterProps) {
  const handlePresetChange = (raw: string | number) => {
    const preset = raw as ReportPreset;
    if (preset === "custom") {
      // Seed the calendar from the currently shown range so it opens on context.
      const seed = value.from
        ? { from: value.from, to: value.to }
        : resolveReportPreset("last30");
      onChange({ preset, from: seed.from, to: seed.to });
      return;
    }
    onChange({ preset, ...resolveReportPreset(preset) });
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
      <div className="w-full sm:w-44">
        <Select
          aria-label="Reporting period"
          options={PRESET_OPTIONS}
          value={value.preset}
          onChange={handlePresetChange}
        />
      </div>

      {value.preset === "custom" ? (
        <div className="w-full sm:w-72">
          <DateRangePicker
            value={{ from: value.from, to: value.to }}
            onChange={(range) =>
              onChange({ preset: "custom", from: range.from, to: range.to })
            }
            maxDate={new Date()}
            placeholder="Choose a custom range"
          />
        </div>
      ) : (
        <span
          suppressHydrationWarning
          className="text-sm tabular-nums text-neutral-500 sm:text-end"
        >
          {summarize(value)}
        </span>
      )}
    </div>
  );
}
