"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAreasList } from "@/lib/hooks/useAreas";
import type { UnitListFilters, UnitType } from "@/lib/types";

interface UnitFiltersProps {
  filters: UnitListFilters;
  onChange: (filters: UnitListFilters) => void;
  isLoading: boolean;
}

const UNIT_TYPE_OPTIONS: Array<{ value: "" | UnitType; label: string }> = [
  { value: "", label: "All types" },
  { value: "villa", label: "Villa" },
  { value: "chalet", label: "Chalet" },
  { value: "studio", label: "Studio" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function UnitFilters({ filters, onChange, isLoading }: UnitFiltersProps) {
  const { data: areas = [] } = useAreasList(true);
  const [search, setSearch] = React.useState(filters.search ?? "");

  React.useEffect(() => {
    setSearch(filters.search ?? "");
  }, [filters.search]);

  const emit = React.useCallback(
    (next: Partial<UnitListFilters>) => {
      onChange({
        ...filters,
        ...next,
        page: 1,
      });
    },
    [filters, onChange]
  );

  const areaOptions = React.useMemo(
    () => [
      { value: "", label: "All areas" },
      ...areas.map((area) => ({ value: area.id, label: area.name })),
    ],
    [areas]
  );

  const applySearch = () => {
    emit({ search: search.trim() || undefined });
  };

  const clearFilters = () => {
    setSearch("");
    onChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_160px_160px_auto] md:items-end">
      <Input
        label="Search"
        placeholder="Name, area, owner, address"
        value={search}
        disabled={isLoading}
        leftAddon={<Search className="h-4 w-4" />}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") applySearch();
        }}
      />

      <Select
        label="Area"
        value={filters.areaId ?? ""}
        options={areaOptions}
        disabled={isLoading}
        onChange={(value) => emit({ areaId: value ? String(value) : undefined })}
      />

      <Select
        label="Type"
        value={filters.unitType ?? ""}
        options={UNIT_TYPE_OPTIONS}
        disabled={isLoading}
        onChange={(value) =>
          emit({ unitType: value ? (String(value) as UnitType) : undefined })
        }
      />

      <Select
        label="Status"
        value={
          typeof filters.isActive === "boolean" ? String(filters.isActive) : ""
        }
        options={STATUS_OPTIONS}
        disabled={isLoading}
        onChange={(value) =>
          emit({
            isActive:
              value === "true" ? true : value === "false" ? false : undefined,
          })
        }
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={applySearch}
        >
          Search
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={clearFilters}
          leftIcon={<X className="h-4 w-4" />}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
