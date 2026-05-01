// ═══════════════════════════════════════════════════════════
// components/public/booking/BookingUnitSummary.tsx
// Unit summary card — shown alongside booking form
// ═══════════════════════════════════════════════════════════

import Image from "next/image";
import { getImageUrl } from "@/lib/utils/image";
import { formatCurrency } from "@/lib/utils/format";
import { Users, BedDouble, Bath } from "lucide-react";
import type { PublicUnitDetail, UnitImage } from "@/lib/types/public.types";

const UNIT_TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  chalet: "Chalet",
  studio: "Studio",
};

interface BookingUnitSummaryProps {
  unit: PublicUnitDetail;
  images: UnitImage[];
}

export function BookingUnitSummary({ unit, images }: BookingUnitSummaryProps) {
  const coverImage = images.find((img) => img.isCover) || images[0]; // P02: isCover, NOT isPrimary

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-card">
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 w-full">
          <Image
            src={getImageUrl(coverImage.fileKey)} // P02: fileKey
            alt={unit.name}
            fill
            className="object-cover"
            sizes="400px"
          />
        </div>
      )}

      {/* Unit Info */}
      <div className="space-y-3 p-4">
        <h3 className="line-clamp-1 font-display text-lg font-semibold text-neutral-900">
          {unit.name} {/* P01: name, NOT unitName */}
        </h3>

        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
          {UNIT_TYPE_LABELS[unit.unitType] ?? unit.unitType}{" "}
          {/* P01: unitType, NOT type */}
        </span>

        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-primary-500" />
            <span>{unit.maxGuests} guests</span>{" "}
            {/* P01: maxGuests, NOT capacity */}
          </div>
          <div className="flex items-center gap-1">
            <BedDouble className="h-4 w-4 text-primary-500" />
            <span>{unit.bedrooms} bed</span> {/* P01: bedrooms */}
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-primary-500" />
            <span>{unit.bathrooms} bath</span> {/* P01: bathrooms */}
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-3">
          <span className="font-display text-xl font-bold text-neutral-900">
            {formatCurrency(unit.basePricePerNight)}
          </span>
          <span className="text-sm text-neutral-500"> / night</span>
        </div>
      </div>
    </div>
  );
}
