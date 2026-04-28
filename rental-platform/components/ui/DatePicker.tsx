"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export interface DatePickerProps {
  label?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  error,
  minDate,
  maxDate,
  disabledDates = [],
}: DatePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    value?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    value?.getMonth() ?? today.getMonth()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDisabled = (day: Date): boolean => {
    const d = startOfDay(day);
    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > startOfDay(maxDate)) return true;
    return disabledDates.some((disabled) => isSameDay(d, disabled));
  };

  const handleSelect = (day: Date) => {
    if (isDisabled(day)) return;
    onChange(day);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build calendar cells: null = empty leading/trailing cell
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(viewYear, viewMonth, i + 1)
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border px-3.5 text-left text-sm transition-colors focus:outline-none",
          error
            ? "border-error text-error focus:ring-1 focus:ring-error"
            : "border-neutral-300 text-neutral-800 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500",
          !value && "text-neutral-500"
        )}
      >
        <span>{value ? formatDate(value) : placeholder}</span>
        <CalendarDays size={16} className="shrink-0 text-neutral-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
          {/* Month / year navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded p-1 text-neutral-500 hover:bg-neutral-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-neutral-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded p-1 text-neutral-500 hover:bg-neutral-100"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAY_LABELS.map((d) => (
              <span
                key={d}
                className="text-[11px] font-medium text-neutral-400"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const disabled = isDisabled(day);
              const isSelected = value ? isSameDay(day, value) : false;
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors",
                    disabled && "cursor-not-allowed text-neutral-300",
                    !disabled &&
                      !isSelected &&
                      "text-neutral-700 hover:bg-neutral-100",
                    isSelected && "bg-primary-500 font-medium text-white",
                    isToday && !isSelected && "font-semibold text-primary-600"
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
