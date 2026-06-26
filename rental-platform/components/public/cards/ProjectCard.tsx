// ═══════════════════════════════════════════════════════════
// components/public/cards/AreaCard.tsx
// Individual area card — image bg + gradient + hover effects
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants/routes";
import type { AreaResponse } from "@/lib/types/area.types";

const AREA_IMAGE_FALLBACK = "/images/areas/default-area.jpg";

interface AreaCardProps {
  area: AreaResponse;
}

export function AreaCard({ area }: AreaCardProps) {
  const [imgError, setImgError] = useState(false);

  const imageSrc = imgError
    ? AREA_IMAGE_FALLBACK
    : `/images/areas/${area.id}.jpg`;

  return (
    <Link
      href={`${ROUTES.unitsList}?areaId=${area.id}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl motion-safe:opacity-0"
    >
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={area.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        quality={80}
        onError={() => setImgError(true)}
      />

      {/* Gradient Overlay — darkens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-colors duration-300 group-hover:from-black/80 group-hover:via-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 transition-transform duration-300 group-hover:-translate-y-1 lg:p-6">
        <h3 className="font-display text-xl font-bold leading-tight text-white lg:text-2xl">
          {area.name}
        </h3>
        {area.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/70">
            {area.description}
          </p>
        )}
      </div>
    </Link>
  );
}
