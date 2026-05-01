// ═══════════════════════════════════════════════════════════
// lib/hooks/animations/useHeroTimeline.ts
// One-shot hero entrance timeline — fires on mount,
// NOT scroll-triggered. Used only by HeroSection (FE-7-LP-01).
// ═══════════════════════════════════════════════════════════

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface HeroTimelineRefs {
  nav?: HTMLElement | null;
  heading?: HTMLElement | null;
  tagline?: HTMLElement | null;
  coords?: HTMLElement | null;
  search?: HTMLElement | null;
  scroll?: HTMLElement | null;
}

interface HeroTimelineOptions {
  initialDelay?: number; // seconds before timeline starts — default: 0.3
}

export function useHeroTimeline(
  refs: HeroTimelineRefs,
  options: HeroTimelineOptions = {}
) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(() => {
    if (prefersReduced) return;

    const tl = gsap.timeline({ delay: options.initialDelay ?? 0.3 });

    // 1. Nav fades in
    if (refs.nav) {
      tl.fromTo(refs.nav, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    }

    // 2. Heading words reveal (word-by-word stagger)
    //    Consumer should pass the heading container — SplitType is handled
    //    separately in HeroSection using useTextReveal or inline GSAP
    if (refs.heading) {
      tl.fromTo(
        refs.heading,
        { opacity: 0, yPercent: 110 },
        { opacity: 1, yPercent: 0, duration: 0.7, ease: "power3.out" },
        "-=0.2"
      );
    }

    // 3. Tagline slides up
    if (refs.tagline) {
      tl.fromTo(
        refs.tagline,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.3"
      );
    }

    // 4. Coordinates label fades in
    if (refs.coords) {
      tl.fromTo(
        refs.coords,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.4"
      );
    }

    // 5. Search bar fades up
    if (refs.search) {
      tl.fromTo(
        refs.search,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      );
    }

    // 6. Scroll indicator bounces in
    if (refs.scroll) {
      tl.fromTo(
        refs.scroll,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        "-=0.2"
      );
    }
  }, [
    refs.nav,
    refs.heading,
    refs.tagline,
    refs.coords,
    refs.search,
    refs.scroll,
  ]);
}
