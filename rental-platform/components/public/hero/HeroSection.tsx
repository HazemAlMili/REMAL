// ═══════════════════════════════════════════════════════════
// components/public/hero/HeroSection.tsx
// Full-viewport cinematic hero — entrance timeline + text reveal
// ═══════════════════════════════════════════════════════════

"use client";
import { useRef } from "react";
import { useHeroTimeline, useTextReveal } from "@/lib/hooks/animations";
import { HeroCarousel } from "./HeroCarousel";
import { ScrollIndicator } from "./ScrollIndicator";
import { HeroSearchBar } from "./HeroSearchBar";

// Hero images — static brand assets, NOT from API
const HERO_IMAGES = [
  "/images/hero/hero-1.jpg",
  "/images/hero/hero-2.jpg",
  "/images/hero/hero-3.jpg",
  "/images/hero/hero-4.jpg",
];

export function HeroSection() {
  // Refs for timeline elements
  const navRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // SplitType word reveal on heading
  const headingRef = useTextReveal<HTMLHeadingElement>({
    type: "words",
    stagger: 0.08,
    duration: 0.7,
  });

  // 6-element entrance timeline (fires on mount, NOT scroll-triggered)
  useHeroTimeline({
    nav: navRef.current,
    heading: headingRef.current,
    tagline: taglineRef.current,
    coords: coordsRef.current,
    search: searchRef.current,
    scroll: scrollRef.current,
  });

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image Carousel */}
      <HeroCarousel images={HERO_IMAGES} />

      {/* Gradient Overlay — Clone.md Section 4.2 spec */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,11,10,0.15) 0%, rgba(13,11,10,0.65) 100%)",
        }}
      />

      {/* Content Layer */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        {/* Coordinates Label */}
        <span
          ref={coordsRef}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-white/60 motion-safe:opacity-0 lg:text-sm"
        >
          30.0626° N, 31.2497° E
        </span>

        {/* Heading — SplitType word-by-word reveal */}
        <h1
          ref={headingRef}
          className="max-w-4xl font-display text-4xl font-bold leading-tight motion-safe:opacity-0 md:text-5xl lg:text-7xl"
        >
          Discover Your Perfect Escape
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="mt-4 max-w-xl text-base leading-relaxed text-white/80 motion-safe:opacity-0 lg:mt-6 lg:text-lg"
        >
          Premium vacation rentals in Egypt&apos;s finest coastal and resort
          destinations
        </p>

        {/* Search Bar Slot — FE-7-LP-02 renders here */}
        <div
          ref={searchRef}
          className="mt-8 w-full max-w-3xl motion-safe:opacity-0 lg:mt-10"
        >
          <HeroSearchBar />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 motion-safe:opacity-0"
      >
        <ScrollIndicator />
      </div>
    </section>
  );
}
