"use client";

import { UnitListFilters } from "@/lib/types";

interface UnitFiltersProps {
  filters: UnitListFilters;
  onChange: (filters: UnitListFilters) => void;
  isLoading: boolean;
}

export function UnitFilters(_props: UnitFiltersProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ignore = _props;
  // Currently, the backend only officially supports page and pageSize.
  // We provide this component as a placeholder for future filter expansion.
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* 
        Visually reserve disabled or placeholder controls for future backend support.
        These controls must not mutate API requests since they are backend gaps.
      */}
      <div className="text-sm text-neutral-500">
        Filters are currently disabled pending API support.
      </div>
    </div>
  );
}
