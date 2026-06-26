"use client";

import { Pencil, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { formatCurrency } from "@/lib/utils/format";
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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      {/* Left: title + meta badges */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            {unit.name}
          </h1>
          <Badge variant="info">
            {UNIT_TYPE_LABELS[unit.unitType] ??
              `${String(unit.unitType).charAt(0).toUpperCase()}${String(unit.unitType).slice(1)}`}
          </Badge>
          <Badge variant={unit.isActive ? "success" : "neutral"}>
            {unit.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 text-sm">
          <span>
            <span className="font-semibold tabular-nums text-neutral-900">
              {formatCurrency(unit.basePricePerNight)}
            </span>
            <span className="text-neutral-500"> / night</span>
          </span>
          <span className="text-neutral-600">
            {unit.bedrooms} bed · {unit.bathrooms} bath · {unit.maxGuests}{" "}
            guests
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
          <span>
            Unit ID{" "}
            <span className="select-all font-mono text-neutral-700">
              {unit.id}
            </span>
          </span>
          <span>
            Owner ID{" "}
            <span className="select-all font-mono text-neutral-700">
              {unit.ownerId}
            </span>
          </span>
          <span>
            Project ID{" "}
            <span className="select-all font-mono text-neutral-700">
              {unit.projectId}
            </span>
          </span>
        </div>
      </div>

      {/* Right: action buttons */}
      {canManageUnits && (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isLoading}
            leftIcon={<Pencil className="h-3.5 w-3.5" />}
          >
            Edit unit
          </Button>

          <Button
            variant={unit.isActive ? "danger" : "primary"}
            size="sm"
            onClick={onChangeStatus}
            disabled={isLoading}
            leftIcon={
              unit.isActive ? (
                <PowerOff className="h-3.5 w-3.5" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )
            }
          >
            {unit.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      )}
    </div>
  );
}
