// ═══════════════════════════════════════════════════════════
// components/public/cards/UnitCard.tsx
// Reusable unit card — used in carousel AND listing grid
// ═══════════════════════════════════════════════════════════

"use client";
import Link from "next/link";
import Image from "next/image";
import { useUnitImages } from "@/lib/hooks/usePublic";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/format";
import { getCoverImageUrl } from "@/lib/utils/image";
import { Users } from "lucide-react";
import type { PublicUnitListItem } from "@/lib/types/public.types";

const UNIT_TYPE_LABELS: Record<string, string> = {
  villa: "Villa",
  chalet: "Chalet",
  studio: "Studio",
};

interface UnitCardProps {
  unit: PublicUnitListItem;
  className?: string;
}

export function UnitCard({ unit, className = "" }: UnitCardProps) {
  // Fetch images for this unit — cached per unitId
  const { data: images } = useUnitImages(unit.id);
  const coverUrl = getCoverImageUrl(images);

  return (
    <Link
      href={ROUTES.unitDetail(unit.id)}
      className={`
        group block overflow-hidden rounded-2xl bg-white
        shadow-card
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-card-hover
        ${className}
      `}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={coverUrl}
          alt={unit.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          quality={80}
        />

        {/* Type Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-800">
            {UNIT_TYPE_LABELS[unit.unitType] ?? unit.unitType}
          </span>
        </div>

        {/* Hover CTA Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
          <span
            className="
            translate-y-2 rounded-xl bg-primary-500
            px-5 py-2.5 text-sm
            font-medium text-white opacity-0
            transition-all duration-300
            group-hover:translate-y-0 group-hover:opacity-100
          "
          >
            View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5">
        {/* Unit Name */}
        <h3 className="truncate font-display text-lg font-semibold leading-tight text-neutral-900">
          {unit.name}
        </h3>

        {/* Capacity */}
        <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
          <Users className="h-4 w-4" />
          <span>Up to {unit.maxGuests} guests</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-lg font-bold text-neutral-900">
            {formatCurrency(unit.basePricePerNight)}
          </span>
          <span className="text-sm text-neutral-500">/ night</span>
        </div>
      </div>
    </Link>
  );
}
