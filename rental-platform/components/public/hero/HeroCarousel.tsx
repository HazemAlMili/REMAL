// ═══════════════════════════════════════════════════════════
// components/public/hero/HeroCarousel.tsx
// Background image carousel — CSS opacity crossfade, 7s auto-advance
// ═══════════════════════════════════════════════════════════

"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const HERO_SLIDE_INTERVAL = 7000; // ms — time per image
const HERO_TRANSITION_DURATION = 1200; // ms — crossfade duration

interface HeroCarouselProps {
  images: string[];
}

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Check reduced motion preference
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Auto-advance carousel
  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (prefersReduced || images.length <= 1) return;

    const timer = setInterval(advance, HERO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, prefersReduced, images.length]);

  return (
    <div className="absolute inset-0">
      {images.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            opacity: index === activeIndex ? 1 : 0,
            transition: prefersReduced
              ? "none"
              : `opacity ${HERO_TRANSITION_DURATION}ms ease-in-out`,
            zIndex: index === activeIndex ? 1 : 0,
          }}
        >
          <Image
            src={src}
            alt={`Hero image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0} // LCP optimization — first image loads eagerly
            sizes="100vw"
            quality={85}
          />
        </div>
      ))}
    </div>
  );
}
