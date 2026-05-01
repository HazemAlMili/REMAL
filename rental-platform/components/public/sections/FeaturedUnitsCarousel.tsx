// ═══════════════════════════════════════════════════════════
// components/public/sections/FeaturedUnitsCarousel.tsx
// Swiper instance — only loaded client-side via dynamic()
// ═══════════════════════════════════════════════════════════

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { UnitCard } from "@/components/public/cards/UnitCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicUnitListItem } from "@/lib/types/public.types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface FeaturedUnitsCarouselProps {
  units: PublicUnitListItem[];
}

export function FeaturedUnitsCarousel({ units }: FeaturedUnitsCarouselProps) {
  return (
    <div className="group/carousel relative">
      <Swiper
        modules={[Navigation, FreeMode]}
        slidesPerView={1.2}
        spaceBetween={16}
        freeMode={{ enabled: true, sticky: false }}
        navigation={{
          prevEl: ".swiper-prev-featured",
          nextEl: ".swiper-next-featured",
        }}
        breakpoints={{
          640: { slidesPerView: 1.8, spaceBetween: 16 },
          768: { slidesPerView: 2.5, spaceBetween: 20 },
          1024: { slidesPerView: 3.5, spaceBetween: 20 },
        }}
        className="!px-6"
      >
        {units.map((unit) => (
          <SwiperSlide key={unit.id}>
            <UnitCard unit={unit} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows — desktop only */}
      <button
        className="
          swiper-prev-featured
          absolute left-2 top-1/2 z-10 hidden
          h-10 w-10 -translate-y-1/2 items-center
          justify-center rounded-full bg-white/90
          text-neutral-700 opacity-0 shadow-md
          transition-all duration-200 hover:text-neutral-900
          hover:shadow-lg disabled:cursor-not-allowed
          disabled:opacity-30 group-hover/carousel:opacity-100
          lg:flex
        "
        aria-label="Previous units"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        className="
          swiper-next-featured
          absolute right-2 top-1/2 z-10 hidden
          h-10 w-10 -translate-y-1/2 items-center
          justify-center rounded-full bg-white/90
          text-neutral-700 opacity-0 shadow-md
          transition-all duration-200 hover:text-neutral-900
          hover:shadow-lg disabled:cursor-not-allowed
          disabled:opacity-30 group-hover/carousel:opacity-100
          lg:flex
        "
        aria-label="Next units"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
