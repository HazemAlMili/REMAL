"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DayPicker, type DateRange } from "react-day-picker";
import {
  format,
  startOfMonth,
  startOfToday,
  differenceInCalendarDays,
} from "date-fns";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAvailabilityCheck, useUnitDateBlocks } from "@/lib/hooks/useUnits";
import { cn } from "@/lib/utils/cn";
import {
  DATE_BLOCK_REASONS,
  DATE_BLOCK_REASON_LABELS,
} from "@/lib/constants/date-block-reasons";

const dateBlockSchema = z
  .object({
    startDate: z.string().min(1, "Pick the dates to block"),
    endDate: z.string().min(1, "Pick the end date"),
    reason: z.enum(["Maintenance", "OwnerUse", "Other"]),
    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional()
      .nullable(),
  })
  // End is inclusive (a single-day block has start === end), so allow equal dates.
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be on or before the end date",
    path: ["endDate"],
  });

export type DateBlockFormValues = z.infer<typeof dateBlockSchema>;

export interface DateBlockFormProps {
  unitId: string;
  defaultValues?: Partial<DateBlockFormValues>;
  onSubmit: (values: DateBlockFormValues) => void;
  isLoading?: boolean;
}

const REASON_OPTIONS = [
  {
    value: DATE_BLOCK_REASONS.Maintenance,
    label: DATE_BLOCK_REASON_LABELS.Maintenance,
  },
  {
    value: DATE_BLOCK_REASONS.OwnerUse,
    label: DATE_BLOCK_REASON_LABELS.OwnerUse,
  },
  { value: DATE_BLOCK_REASONS.Other, label: DATE_BLOCK_REASON_LABELS.Other },
];

// Robust against both "yyyy-MM-dd" and full ISO strings; builds a LOCAL date so
// there's no UTC day-shift.
function parseDateOnly(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function buildDateRange(startDate: string, endDate: string): Date[] {
  const dates: Date[] = [];
  const current = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatRange(start: Date, end: Date): string {
  if (start.getTime() === end.getTime()) return format(start, "MMM d, yyyy");
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

export function DateBlockForm({
  unitId,
  defaultValues,
  onSubmit,
  isLoading,
}: DateBlockFormProps) {
  const today = startOfToday();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DateBlockFormValues>({
    resolver: zodResolver(dateBlockSchema),
    defaultValues: {
      startDate: defaultValues?.startDate || "",
      endDate: defaultValues?.endDate || "",
      reason: defaultValues?.reason || "Maintenance",
      notes: defaultValues?.notes || "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const reason = watch("reason");

  const [currentMonth, setCurrentMonth] = React.useState(() =>
    startOfMonth(defaultValues?.startDate ? parseDateOnly(defaultValues.startDate) : today)
  );

  // Operational availability for the visible month — the single source of truth
  // shared with bookings, the owner calendar, and the read-only admin calendar.
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const { data: availability } = useAvailabilityCheck(
    unitId,
    currentMonth.getMonth(),
    currentMonth.getFullYear(),
    {
      startDate: format(monthStart, "yyyy-MM-dd"),
      endDate: format(monthEnd, "yyyy-MM-dd"),
    }
  );
  const { data: blocks = [] } = useUnitDateBlocks(unitId);

  // The block being edited must remain selectable, so exclude its own nights from
  // the "occupied" sets.
  const editingKeys = React.useMemo(() => {
    const keys = new Set<number>();
    if (defaultValues?.startDate && defaultValues?.endDate) {
      for (const day of buildDateRange(
        defaultValues.startDate,
        defaultValues.endDate
      )) {
        keys.add(day.getTime());
      }
    }
    return keys;
  }, [defaultValues?.startDate, defaultValues?.endDate]);

  // Existing date blocks (across all months) — rendered slate, never selectable.
  const blockDays = React.useMemo(
    () =>
      blocks
        .flatMap((b) => buildDateRange(b.startDate, b.endDate))
        .filter((d) => !editingKeys.has(d.getTime())),
    [blocks, editingKeys]
  );
  const blockKeys = React.useMemo(
    () => new Set(blockDays.map((d) => d.getTime())),
    [blockDays]
  );

  // Everything the availability check reports occupied for the visible month
  // (blocks ∪ holding bookings); subtract the date blocks to leave bookings.
  const occupiedDays = React.useMemo(
    () =>
      (availability?.blockedDates ?? [])
        .map(parseDateOnly)
        .filter((d) => !editingKeys.has(d.getTime())),
    [availability?.blockedDates, editingKeys]
  );
  const bookedDays = React.useMemo(
    () => occupiedDays.filter((d) => !blockKeys.has(d.getTime())),
    [occupiedDays, blockKeys]
  );

  const disabledMatchers = React.useMemo(
    () => [{ before: today }, ...occupiedDays, ...blockDays],
    [today, occupiedDays, blockDays]
  );

  const range: DateRange | undefined = startDate
    ? {
        from: parseDateOnly(startDate),
        to: endDate ? parseDateOnly(endDate) : undefined,
      }
    : undefined;

  const handleSelect = (selected: DateRange | undefined) => {
    setValue("startDate", selected?.from ? format(selected.from, "yyyy-MM-dd") : "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("endDate", selected?.to ? format(selected.to, "yyyy-MM-dd") : "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const nights =
    startDate && endDate
      ? differenceInCalendarDays(parseDateOnly(endDate), parseDateOnly(startDate)) +
        1
      : 0;
  const dateError = errors.startDate?.message || errors.endDate?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Calendar */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-neutral-800">
          Blocked dates
        </span>
        <div className="rounded-[var(--portal-radius-control)] border border-neutral-200 bg-white p-3">
          <div className="cal-skin flex justify-center">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={disabledMatchers}
              excludeDisabled
              showOutsideDays
              modifiers={{ booked: bookedDays, blocked: blockDays }}
              modifiersClassNames={{ booked: "cal-booked", blocked: "cal-owner" }}
            />
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-neutral-100 pt-3">
            <LegendDot className="border border-neutral-300 bg-white" label="Available" />
            <LegendDot className="bg-error-bg" label="Booked" />
            <LegendDot className="bg-neutral-200" label="Blocked" />
            <LegendDot className="bg-primary-500" label="Selected" />
          </div>
        </div>

        {/* Selection summary / guidance */}
        <p className="mt-2 text-sm">
          {startDate && endDate ? (
            <span className="text-neutral-700">
              <span className="font-medium tabular-nums text-neutral-900">
                {formatRange(parseDateOnly(startDate), parseDateOnly(endDate))}
              </span>
              <span className="text-neutral-500 tabular-nums">
                {" "}
                · {nights} night{nights === 1 ? "" : "s"}
              </span>
            </span>
          ) : startDate ? (
            <span className="text-neutral-500">
              Now pick the end date{" "}
              <span className="text-neutral-400">(or the same day for one).</span>
            </span>
          ) : (
            <span className="text-neutral-500">
              Pick a start and end date on the calendar. Booked and blocked dates
              can&apos;t be selected.
            </span>
          )}
        </p>
        {dateError && <p className="mt-1 text-xs text-error">{dateError}</p>}
      </div>

      <Select
        label="Reason"
        options={REASON_OPTIONS}
        value={reason}
        onChange={(val) =>
          setValue("reason", val as DateBlockFormValues["reason"], {
            shouldValidate: true,
          })
        }
        error={errors.reason?.message}
        disabled={isLoading}
      />

      <Textarea
        label="Notes (optional)"
        placeholder="Add context about why these dates are blocked…"
        {...register("notes")}
        error={errors.notes?.message}
        disabled={isLoading}
        rows={3}
      />

      <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
        <Button type="submit" disabled={isLoading || !startDate || !endDate}>
          {isLoading ? "Saving…" : "Save date block"}
        </Button>
      </div>
    </form>
  );
}

function LegendDot({ className, label }: { className?: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-3.5 w-3.5 rounded-[5px]", className)} />
      <span className="text-xs text-neutral-600">{label}</span>
    </span>
  );
}
