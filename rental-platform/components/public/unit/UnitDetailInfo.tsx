// ═══════════════════════════════════════════════════════════
// components/public/unit/UnitDetailInfo.tsx
// Unit name, area, type, capacity, bedrooms, bathrooms, description
// ═══════════════════════════════════════════════════════════

"use client";
import { useFadeUp } from "@/lib/hooks/animations";
import { BedDouble, Bath, Users, MapPin } from "lucide-react";
import type { PublicUnitDetail } from "@/lib/types/public.types";

const UNIT_TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  chalet: "Chalet",
  studio: "Studio",
};

interface UnitDetailInfoProps {
  unit: PublicUnitDetail;
  areaName?: string;
}

export function UnitDetailInfo({ unit, areaName }: UnitDetailInfoProps) {
  const ref = useFadeUp<HTMLDivElement>();

  return (
    <div ref={ref} className="space-y-6 motion-safe:opacity-0">
      {/* Title + Badges */}
      <div>
        <h1 className="mb-3 font-display text-3xl font-bold text-neutral-900 lg:text-4xl">
          {unit.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
            {UNIT_TYPE_LABELS[unit.unitType] ?? unit.unitType}
          </span>
          {areaName && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-600">
              <MapPin className="h-4 w-4" />
              <span>{areaName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Stats */}
      <div className="flex flex-wrap gap-6 text-neutral-700">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-500" />
          <span className="text-sm font-medium">
            Up to {unit.maxGuests} guests
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BedDouble className="h-5 w-5 text-primary-500" />
          <span className="text-sm font-medium">{unit.bedrooms} bedrooms</span>
        </div>
        <div className="flex items-center gap-2">
          <Bath className="h-5 w-5 text-primary-500" />
          <span className="text-sm font-medium">
            {unit.bathrooms} bathrooms
          </span>
        </div>
      </div>

      {/* Description */}
      {unit.description && (
        <div>
          <h2 className="mb-2 font-display text-xl font-semibold text-neutral-900">
            About this property
          </h2>
          <p className="whitespace-pre-line leading-relaxed text-neutral-600">
            {unit.description}
          </p>
        </div>
      )}

      {/* Address */}
      {unit.address && (
        <div className="flex items-start gap-2 text-neutral-600">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="text-sm">{unit.address}</span>
        </div>
      )}
    </div>
  );
}
