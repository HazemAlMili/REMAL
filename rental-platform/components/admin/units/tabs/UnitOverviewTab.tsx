"use client";

import { UnitDetailsResponse, UnitType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  villa: "Villa",
  chalet: "Chalet",
  studio: "Studio",
};

interface OverviewFieldProps {
  label: string;
  value: React.ReactNode;
}

function OverviewField({ label, value }: OverviewFieldProps) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="text-sm text-neutral-900">{value ?? "—"}</dd>
    </div>
  );
}

export interface UnitOverviewTabProps {
  unit: UnitDetailsResponse;
}

export function UnitOverviewTab({ unit }: UnitOverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Core identity */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-neutral-700">
          Core details
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewField label="Unit name" value={unit.name} />
          <OverviewField
            label="Unit type"
            value={UNIT_TYPE_LABELS[unit.unitType] ?? unit.unitType}
          />
          <OverviewField
            label="Status"
            value={unit.isActive ? "Active" : "Inactive"}
          />
          <OverviewField label="Owner ID" value={unit.ownerId} />
          <OverviewField label="Area ID" value={unit.areaId} />
          <OverviewField
            label="Base price/night"
            value={formatCurrency(unit.basePricePerNight)}
          />
        </dl>
      </section>

      {/* Capacity */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-neutral-700">
          Capacity
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
          <OverviewField label="Bedrooms" value={unit.bedrooms} />
          <OverviewField label="Bathrooms" value={unit.bathrooms} />
          <OverviewField label="Max guests" value={unit.maxGuests} />
        </dl>
      </section>

      {/* Location */}
      {unit.address && (
        <section>
          <h2 className="mb-4 text-sm font-semibold text-neutral-700">
            Location
          </h2>
          <dl>
            <OverviewField label="Address" value={unit.address} />
          </dl>
        </section>
      )}

      {/* Description */}
      {unit.description && (
        <section>
          <h2 className="mb-4 text-sm font-semibold text-neutral-700">
            Description
          </h2>
          <p className="text-sm leading-relaxed text-neutral-700">
            {unit.description}
          </p>
        </section>
      )}

      {/* Timestamps */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-neutral-700">
          Record info
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <OverviewField
            label="Created at"
            value={new Date(unit.createdAt).toLocaleString()}
          />
          <OverviewField
            label="Last updated"
            value={new Date(unit.updatedAt).toLocaleString()}
          />
        </dl>
      </section>
    </div>
  );
}
