// ═══════════════════════════════════════════════════════════
// components/public/search/UnitFilters.tsx
// Filter sidebar (desktop) / drawer (mobile)
// ═══════════════════════════════════════════════════════════

"use client";
import { usePublicAmenities, usePublicAreas } from "@/lib/hooks/usePublic";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { PublicUnitFilters } from "@/lib/types/public.types";

interface UnitFiltersProps {
  filters: PublicUnitFilters;
  onChange: (filters: Partial<PublicUnitFilters>) => void;
  onClear: () => void;
}

export function UnitFilters({ filters, onChange, onClear }: UnitFiltersProps) {
  const { data: areas } = usePublicAreas();
  const { data: amenities } = usePublicAmenities();

  const areaOptions = [
    { value: "", label: "All Areas" },
    ...(areas?.map((a) => ({ value: a.id, label: a.name })) || []),
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "chalet", label: "Chalet" },
    { value: "studio", label: "Studio" },
  ];

  const selectedAmenityIds = filters.amenityIds ?? [];

  function handleAmenityToggle(amenityId: string, checked: boolean) {
    const nextAmenityIds = checked
      ? [...selectedAmenityIds, amenityId]
      : selectedAmenityIds.filter((id) => id !== amenityId);

    onChange({
      amenityIds: nextAmenityIds.length > 0 ? nextAmenityIds : undefined,
      page: 1,
    });
  }

  return (
    <div className="space-y-6">
      {/* Area Filter */}
      <Select
        label="Area"
        options={areaOptions}
        value={filters.areaId || ""}
        onChange={(val) =>
          onChange({ areaId: String(val) || undefined, page: 1 })
        }
      />

      {/* Unit Type Filter */}
      <Select
        label="Property Type"
        options={typeOptions}
        value={filters.unitType || ""}
        onChange={(val) =>
          onChange({ unitType: String(val) || undefined, page: 1 })
        }
      />

      {/* Guest Count */}
      <Input
        label="Min Guests"
        type="number"
        min={1}
        max={20}
        value={filters.minGuests || ""}
        onChange={(e) =>
          onChange({ minGuests: Number(e.target.value) || undefined, page: 1 })
        }
        placeholder="Any"
      />

      {/* Price Range — simplified as two inputs for MVP */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min Price"
          type="number"
          min={0}
          value={filters.minPrice || ""}
          onChange={(e) =>
            onChange({
              minPrice: Number(e.target.value) || undefined,
              page: 1,
            })
          }
          placeholder="No min"
        />
        <Input
          label="Max Price"
          type="number"
          min={0}
          value={filters.maxPrice || ""}
          onChange={(e) =>
            onChange({
              maxPrice: Number(e.target.value) || undefined,
              page: 1,
            })
          }
          placeholder="No max"
        />
      </div>

      {/* Amenities */}
      {amenities && amenities.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-neutral-700">
            Amenities
          </legend>
          <div className="space-y-2">
            {amenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={selectedAmenityIds.includes(amenity.id)}
                  onChange={(event) =>
                    handleAmenityToggle(amenity.id, event.target.checked)
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span>{amenity.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Clear Filters */}
      <Button variant="ghost" onClick={onClear} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );
}
