"use client";

import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateRangePicker, DateRange } from "@/components/ui/DateRangePicker";
import { BOOKING_STATUS_LABELS } from "@/lib/constants/booking-statuses";
import { formatDateForApi, parseDateOnly } from "@/lib/utils/format";
import type { BookingListFilters, FormalBookingStatus } from "@/lib/types/booking.types";

const BOOKING_STATUS_OPTIONS = Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => ({
  value: key as FormalBookingStatus,
  label,
}));

interface BookingFiltersProps {
  filters: BookingListFilters;
  onChange: (filters: BookingListFilters) => void;
}

export function BookingFilters({ filters, onChange }: BookingFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchTerm(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search ?? "")) {
        onChange({ ...filters, page: 1, search: searchTerm || undefined });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, filters, onChange]);

  const dateRangeValue: DateRange = useMemo(() => {
    return {
      from: filters.checkInFrom ? parseDateOnly(filters.checkInFrom) : null,
      to: filters.checkInTo ? parseDateOnly(filters.checkInTo) : null,
    };
  }, [filters.checkInFrom, filters.checkInTo]);

  const handleDateChange = (range: DateRange) => {
    onChange({
      ...filters,
      page: 1,
      checkInFrom: range.from ? formatDateForApi(range.from) : undefined,
      checkInTo: range.to ? formatDateForApi(range.to) : undefined,
    });
  };

  const statusOptions = [
    { value: "", label: "All statuses" },
    ...BOOKING_STATUS_OPTIONS,
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
      <div className="flex flex-1 flex-wrap items-center gap-4">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={statusOptions}
            value={filters.bookingStatus ?? ""}
            onChange={(value) => {
              onChange({
                ...filters,
                page: 1,
                bookingStatus: (value as FormalBookingStatus) || undefined,
              });
            }}
          />
        </div>
        <div className="w-full sm:w-64">
          <DateRangePicker
            value={dateRangeValue}
            onChange={handleDateChange}
            placeholder="Check-in dates"
          />
        </div>
      </div>
    </div>
  );
}
