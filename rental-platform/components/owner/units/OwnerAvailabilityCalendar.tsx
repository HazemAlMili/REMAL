"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { useOwnerUnitAvailability } from "@/lib/hooks/useOwnerPortal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

interface OwnerAvailabilityCalendarProps {
  unitId: string;
  unitName: string;
}

export function OwnerAvailabilityCalendar({
  unitId,
  unitName,
}: OwnerAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data, isLoading } = useOwnerUnitAvailability(unitId, currentMonth);

  // P04: blockedDates is a FLAT STRING ARRAY — map to Date objects for react-day-picker
  const disabledDays =
    data?.blockedDates.map((d) => new Date(d + "T00:00:00")) || [];

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">
          {unitName} — Availability
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      {isLoading ? (
        <Skeleton className="mx-auto h-80 w-full max-w-2xl" />
      ) : (
        <div className="mx-auto max-w-2xl rounded-lg border border-neutral-200 p-4">
          <DayPicker
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={disabledDays}
            modifiers={{
              booked: disabledDays,
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: "#c2410c", // terracotta-700
                color: "white",
                borderRadius: "50%",
              },
            }}
            styles={{
              day: { margin: "2px" },
            }}
            classNames={{
              day_selected: "bg-blue-500 text-white",
            }}
          />
        </div>
      )}

      {/* Legend */}
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-6 border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border border-neutral-300 bg-white" />
          <span className="text-sm text-neutral-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: "#c2410c" }}
          />
          <span className="text-sm text-neutral-600">Booked / Blocked</span>
        </div>
      </div>
    </div>
  );
}
