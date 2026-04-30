"use client";

import { OwnerListFilters } from "@/lib/types/owner.types";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";

interface OwnerFiltersProps {
  filters: OwnerListFilters;
  onChange: (filters: OwnerListFilters) => void;
  isLoading: boolean;
}

export function OwnerFilters({
  filters,
  onChange,
  isLoading,
}: OwnerFiltersProps) {
  const handleIncludeInactiveToggle = (checked: boolean) => {
    onChange({ includeInactive: checked, page: 1 });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Switch
          id="include-inactive"
          checked={filters.includeInactive ?? false}
          onCheckedChange={handleIncludeInactiveToggle}
          disabled={isLoading}
        />
        <Label htmlFor="include-inactive" className="text-sm text-neutral-700">
          Include Inactive
        </Label>
      </div>
    </div>
  );
}
