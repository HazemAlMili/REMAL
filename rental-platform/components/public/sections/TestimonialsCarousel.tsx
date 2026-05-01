// ═══════════════════════════════════════════════════════════
// components/public/sections/TestimonialsCarousel.tsx
// Swiper instance — autoplay, dots, loop — dynamic loaded
// ═══════════════════════════════════════════════════════════

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { TestimonialCard } from "@/components/public/cards/TestimonialCard";
import type { PublishedReviewListItem } from "@/lib/types/public.types";

import "swiper/css";
import "swiper/css/pagination";

interface TestimonialsCarouselProps {
  reviews: PublishedReviewListItem[];
}

export function TestimonialsCarousel({ reviews }: TestimonialsCarouselProps) {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      slidesPerView={1}
      spaceBetween={16}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop={reviews.length >= 3}
      pagination={{
        clickable: true,
        bulletClass:
          "swiper-pagination-bullet !bg-primary-500/30 !w-2.5 !h-2.5",
        bulletActiveClass: "!bg-primary-500 !w-3 !h-3",
      }}
      breakpoints={{
        640: { slidesPerView: 1.5, spaceBetween: 16 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      }}
      className="!pb-12"
    >
      {reviews.map((review) => (
        <SwiperSlide key={review.reviewId} className="!h-auto">
          <TestimonialCard review={review} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
