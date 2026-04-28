"use client";

import { Pencil, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { UnitDetailsResponse, UnitType } from "@/lib/types";

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  villa: "Villa",
  chalet: "Chalet",
  studio: "Studio",
};

export interface UnitDetailHeaderProps {
  unit: UnitDetailsResponse;
  onEdit: () => void;
  onChangeStatus: () => void;
  isLoading?: boolean;
}

export function UnitDetailHeader({
  unit,
  onEdit,
  onChangeStatus,
  isLoading = false,
}: UnitDetailHeaderProps) {
  const { canManageUnits } = usePermissions();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left: title + meta badges */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            {unit.name}
          </h1>
          <Badge variant="info">
            {UNIT_TYPE_LABELS[unit.unitType] ?? unit.unitType}
          </Badge>
          <Badge variant={unit.isActive ? "success" : "neutral"}>
            {unit.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-500">
          <span>
            Owner ID:{" "}
            <span className="font-medium text-neutral-700">{unit.ownerId}</span>
          </span>
          <span>
            Area ID:{" "}
            <span className="font-medium text-neutral-700">{unit.areaId}</span>
          </span>
          <span>
            SAR{" "}
            <span className="font-medium text-neutral-700">
              {new Intl.NumberFormat("en-US").format(unit.basePricePerNight)}
            </span>{" "}
            / night
          </span>
          <span>
            {unit.bedrooms} bed · {unit.bathrooms} bath · {unit.maxGuests}{" "}
            guests
          </span>
        </div>
      </div>

      {/* Right: action buttons */}
      {canManageUnits && (
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isLoading}
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit Unit
          </Button>

          <Button
            variant={unit.isActive ? "danger" : "primary"}
            size="sm"
            onClick={onChangeStatus}
            disabled={isLoading}
          >
            {unit.isActive ? (
              <>
                <PowerOff className="mr-1.5 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-1.5 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
