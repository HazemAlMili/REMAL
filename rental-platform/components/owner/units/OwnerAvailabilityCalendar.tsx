"use client";
import { useState, type FormEvent } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import {
  useCreateOwnerDateBlock,
  useOwnerUnitAvailability,
} from "@/lib/hooks/useOwnerPortal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import "react-day-picker/dist/style.css";
import type { DateBlockReason } from "@/lib/types/unit.types";

interface OwnerAvailabilityCalendarProps {
  unitId: string;
  unitName: string;
}

export function OwnerAvailabilityCalendar({
  unitId,
  unitName,
}: OwnerAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockForm, setBlockForm] = useState<{
    startDate: string;
    endDate: string;
    reason: DateBlockReason;
    notes: string;
  }>({
    startDate: "",
    endDate: "",
    reason: "OwnerUse",
    notes: "",
  });

  const { data, isLoading } = useOwnerUnitAvailability(unitId, currentMonth);
  const createBlock = useCreateOwnerDateBlock(unitId);

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

  const canCreateBlock =
    blockForm.startDate &&
    blockForm.endDate &&
    blockForm.startDate <= blockForm.endDate &&
    !createBlock.isPending;

  const submitBlock = (event: FormEvent) => {
    event.preventDefault();
    if (!canCreateBlock) return;

    createBlock.mutate(
      {
        startDate: blockForm.startDate,
        endDate: blockForm.endDate,
        reason: blockForm.reason,
        notes: blockForm.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Dates blocked");
          setBlockForm({
            startDate: "",
            endDate: "",
            reason: "OwnerUse",
            notes: "",
          });
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Could not block these dates";
          toast.error(message);
        },
      }
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

      <form
        onSubmit={submitBlock}
        className="mx-auto grid max-w-2xl gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-2"
      >
        <Input
          label="Block from"
          type="date"
          value={blockForm.startDate}
          onChange={(event) =>
            setBlockForm((current) => ({
              ...current,
              startDate: event.target.value,
            }))
          }
          disabled={createBlock.isPending}
          required
        />
        <Input
          label="Block to"
          type="date"
          value={blockForm.endDate}
          min={blockForm.startDate || undefined}
          onChange={(event) =>
            setBlockForm((current) => ({
              ...current,
              endDate: event.target.value,
            }))
          }
          disabled={createBlock.isPending}
          required
        />
        <Select
          label="Reason"
          value={blockForm.reason}
          options={[
            { value: "OwnerUse", label: "Owner use" },
            { value: "Maintenance", label: "Maintenance" },
            { value: "Other", label: "Other" },
          ]}
          onChange={(value) =>
            setBlockForm((current) => ({
              ...current,
              reason: value as DateBlockReason,
            }))
          }
          disabled={createBlock.isPending}
        />
        <Input
          label="Note"
          value={blockForm.notes}
          onChange={(event) =>
            setBlockForm((current) => ({
              ...current,
              notes: event.target.value,
            }))
          }
          disabled={createBlock.isPending}
          placeholder="Optional"
        />
        <div className="md:col-span-2 flex justify-end">
          <Button
            type="submit"
            isLoading={createBlock.isPending}
            disabled={!canCreateBlock}
          >
            Block dates
          </Button>
        </div>
      </form>

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
