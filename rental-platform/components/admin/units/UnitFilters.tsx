"use client";

import * as React from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAreasList } from "@/lib/hooks/useAreas";
import { useAmenities } from "@/lib/hooks/useAmenities";
import type { UnitListFilters, UnitType } from "@/lib/types";

interface UnitFiltersProps {
  filters: UnitListFilters;
  onChange: (filters: UnitListFilters) => void;
  isFetching: boolean;
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

const SEARCH_DEBOUNCE_MS = 350;

export function UnitFilters({
  filters,
  onChange,
  isFetching,
}: UnitFiltersProps) {
  const { data: areas = [] } = useAreasList(true);
  const { amenities, isLoading: isLoadingAmenities } = useAmenities();
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

  const amenityOptions = React.useMemo(
    () => [
      { value: "", label: "All amenities" },
      ...amenities
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((amenity) => ({
          value: amenity.id,
          label: amenity.isActive ? amenity.name : `${amenity.name} (inactive)`,
        })),
    ],
    [amenities]
  );

  React.useEffect(() => {
    const normalizedSearch = search.trim() || undefined;
    if (normalizedSearch === filters.search) return;

    const timeoutId = window.setTimeout(() => {
      emit({ search: normalizedSearch });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [emit, filters.search, search]);

  const clearFilters = () => {
    setSearch("");
    onChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_140px_180px_140px_auto] xl:items-end">
      <Input
        label="Search"
        placeholder="Name, area, owner, address, amenity"
        value={search}
        leftAddon={<Search className="h-4 w-4" />}
        rightAddon={
          isFetching ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin"
              aria-label="Updating results"
            />
          ) : undefined
        }
        onChange={(event) => setSearch(event.target.value)}
      />

      <Select
        label="Area"
        value={filters.areaId ?? ""}
        options={areaOptions}
        onChange={(value) =>
          emit({ areaId: value ? String(value) : undefined })
        }
      />

      <Select
        label="Type"
        value={filters.unitType ?? ""}
        options={UNIT_TYPE_OPTIONS}
        onChange={(value) =>
          emit({ unitType: value ? (String(value) as UnitType) : undefined })
        }
      />

      <Select
        label="Amenity"
        value={filters.amenityId ?? ""}
        options={amenityOptions}
        disabled={isLoadingAmenities}
        onChange={(value) =>
          emit({ amenityId: value ? String(value) : undefined })
        }
      />

      <Select
        label="Status"
        value={
          typeof filters.isActive === "boolean" ? String(filters.isActive) : ""
        }
        options={STATUS_OPTIONS}
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
          variant="ghost"
          disabled={
            !filters.areaId &&
            !filters.unitType &&
            !filters.amenityId &&
            typeof filters.isActive !== "boolean" &&
            !search
          }
          onClick={clearFilters}
          leftIcon={<X className="h-4 w-4" />}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
