// ═══════════════════════════════════════════════════════════
// components/public/search/UnitFilters.tsx
// Filter sidebar (desktop) / drawer (mobile)
// ═══════════════════════════════════════════════════════════

"use client";
import { usePublicAreas } from "@/lib/hooks/usePublic";
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

  const areaOptions = [
    { value: "", label: "All Areas" },
    ...(areas?.map((a) => ({ value: a.id, label: a.name })) || []),
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "villa", label: "Villa" },
    { value: "chalet", label: "Chalet" },
    { value: "studio", label: "Studio" },
  ];

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

      {/* Clear Filters */}
      <Button variant="ghost" onClick={onClear} className="w-full">
        Clear All Filters
      </Button>

      {/* ⚠️ P34 Notice — developer-only, hidden in production */}
      {process.env.NODE_ENV === "development" && (
        <p className="rounded bg-amber-50 p-2 text-xs text-amber-600">
          ⚠️ P34: Area/Type/Guests/Price filters not confirmed by backend. Only
          pagination is documented in API Reference.
        </p>
      )}
    </div>
  );
}
