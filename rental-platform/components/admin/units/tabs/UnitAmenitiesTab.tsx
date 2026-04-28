"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import {
  useUnitAmenities,
  useReplaceUnitAmenities,
} from "@/lib/hooks/useUnits";
import { useAmenities } from "@/lib/hooks/useAmenities";
import type { AmenityResponse } from "@/lib/types";

export interface UnitAmenitiesTabProps {
  unitId: string;
}

function AmenityChipSkeleton() {
  return <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-200" />;
}

function AmenityChip({
  amenity,
  selected,
  disabled,
  onToggle,
}: {
  amenity: AmenityResponse;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(amenity.id)}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-100"
          : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50",
      ].join(" ")}
    >
      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
      {amenity.icon && (
        <span className="shrink-0 text-base leading-none">{amenity.icon}</span>
      )}
      {amenity.name}
    </button>
  );
}

export function UnitAmenitiesTab({ unitId }: UnitAmenitiesTabProps) {
  const { data: assignedAmenities, isLoading: isLoadingAssigned } =
    useUnitAmenities(unitId);
  const { amenities: catalog, isLoading: isLoadingCatalog } = useAmenities();
  const { mutateAsync: replaceAmenities, isPending: isSaving } =
    useReplaceUnitAmenities();

  // Local selection state — initialized from server data once loaded
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!isLoadingAssigned && assignedAmenities && !initialized) {
      setSelectedIds(new Set(assignedAmenities.map((a) => a.amenityId)));
      setInitialized(true);
    }
  }, [isLoadingAssigned, assignedAmenities, initialized]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await replaceAmenities({
        unitId,
        amenityIds: Array.from(selectedIds),
      });
      toastSuccess("Unit amenities updated successfully");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to update amenities");
    }
  };

  // Active (non-deleted) catalog items only
  const activeCatalog: AmenityResponse[] = catalog.filter((a) => a.isActive);

  const assignedInCatalog = activeCatalog.filter((a) => selectedIds.has(a.id));
  const availableInCatalog = activeCatalog.filter(
    (a) => !selectedIds.has(a.id)
  );

  const isLoading = isLoadingAssigned || isLoadingCatalog;

  return (
    <div className="space-y-8">
      {/* Assigned section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700">
            Assigned Amenities
          </h3>
          <span className="text-xs text-neutral-500">
            {isLoading ? "…" : `${assignedInCatalog.length} selected`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <AmenityChipSkeleton key={i} />
            ))}
          </div>
        ) : assignedInCatalog.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-400">
            No amenities assigned yet. Click an available amenity below to add
            it.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assignedInCatalog.map((amenity) => (
              <AmenityChip
                key={amenity.id}
                amenity={amenity}
                selected
                disabled={isSaving}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Available section */}
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-neutral-700">
            Available Amenities
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Click to add to the unit.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <AmenityChipSkeleton key={i} />
            ))}
          </div>
        ) : availableInCatalog.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-400">
            {activeCatalog.length === 0
              ? "No available amenities in the catalog."
              : "All catalog amenities are assigned to this unit."}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableInCatalog.map((amenity) => (
              <AmenityChip
                key={amenity.id}
                amenity={amenity}
                selected={false}
                disabled={isSaving}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Save action */}
      <div className="flex justify-end border-t border-neutral-200 pt-4">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
