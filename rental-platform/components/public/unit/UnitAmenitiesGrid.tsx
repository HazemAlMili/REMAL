// ═══════════════════════════════════════════════════════════
// components/public/unit/UnitAmenitiesGrid.tsx
// Icon + name grid for unit amenities
// ═══════════════════════════════════════════════════════════

import type { UnitAmenity } from "@/lib/types/public.types";

interface UnitAmenitiesGridProps {
  amenities: UnitAmenity[];
}

export function UnitAmenitiesGrid({ amenities }: UnitAmenitiesGridProps) {
  if (amenities.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-semibold text-neutral-900">
        Amenities
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {amenities.map((amenity) => (
          <div
            key={amenity.amenityId}
            className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3"
          >
            {amenity.icon && <span className="text-lg">{amenity.icon}</span>}
            <span className="text-sm text-neutral-700">{amenity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
