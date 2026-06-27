"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { useUnits } from "@/lib/hooks/useCatalog";
import { getImageUrls } from "@/lib/utils/image";
import { formatCurrency } from "@/lib/utils/format";
import type { UnitListItem } from "@/lib/api/types";

/**
 * Live "وحدات مختارة وجاهزة للحجز" grid — pulls the first 6 active units from
 * GET /api/units. Replaces the old hardcoded MOCK_UNITS array.
 */
export function FeaturedUnits() {
  const { data: units, isLoading, error } = useUnits({ page: 1, pageSize: 6 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse text-right">
            <div className="aspect-[4/3] rounded-[1.5rem] bg-gray-200 mb-5" />
            <div className="ml-auto mb-2 h-5 w-2/3 rounded-full bg-gray-200" />
            <div className="ml-auto h-4 w-1/3 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="font-medium text-gray-500">{error}</p>;
  }

  if (!units || units.length === 0) {
    return <p className="font-medium text-gray-500">لا توجد وحدات متاحة حالياً.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} />
      ))}
    </div>
  );
}

function UnitCard({ unit }: { unit: UnitListItem }) {
  const images = getImageUrls(unit.images);
  const [idx, setIdx] = useState(0);
  const hasImages = images.length > 0;

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((p) => Math.min(p + 1, images.length - 1));
  };
  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((p) => Math.max(p - 1, 0));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
    >
      <Link href={`/units/${unit.id}`} className="group block text-right">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] mb-5 bg-gray-100 group-hover:-translate-y-1 group-hover:shadow-premium transition-all duration-300 shadow-soft">
          {hasImages ? (
            <>
              <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(${idx * 100}%)` }}
              >
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-full h-full object-cover shrink-0"
                    alt={unit.name}
                  />
                ))}
              </div>
              {images.length > 1 && (
                <>
                  {idx > 0 && (
                    <button
                      onClick={prev}
                      aria-label="السابق"
                      className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-brand-950 shadow-md opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      onClick={next}
                      aria-label="التالي"
                      className="absolute top-1/2 -translate-y-1/2 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-brand-950 shadow-md opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                      <ArrowRight size={16} className="rotate-180" />
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            // Graceful fallback when a unit has no images attached yet.
            <div className="w-full h-full bg-gradient-to-br from-brand-100 via-brand-50 to-gray-100 flex items-center justify-center">
              <span className="text-brand-300 font-black text-2xl tracking-tighter">
                Kaza Booking
              </span>
            </div>
          )}

          <div className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-full text-gray-500">
            <Heart size={16} />
          </div>
        </div>

        <div className="px-1 space-y-1">
          <h3 dir="auto" className="font-black text-lg text-brand-950 truncate">
            {unit.name}
          </h3>
          <p dir="auto" className="text-gray-400 text-xs font-bold">
            {unit.unitType} — {unit.projectName}
          </p>
          <div className="pt-2">
            <span className="text-brand-950 font-black text-lg tabular-nums">
              {formatCurrency(unit.basePricePerNight)}
            </span>
            <span className="text-gray-400 text-xs font-bold">
              {" "}
              / ليلة أو حسب التاريخ
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
