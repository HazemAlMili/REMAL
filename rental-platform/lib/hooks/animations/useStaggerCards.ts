// ═══════════════════════════════════════════════════════════
// lib/hooks/animations/useStaggerCards.ts
// Staggered children entrance — used for card grids (areas,
// how-it-works steps, featured units when NOT in Swiper)
// ═══════════════════════════════════════════════════════════

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface StaggerCardsOptions {
  stagger?: number; // seconds between each child — default: 0.12
  duration?: number; // seconds — default: 0.6
  y?: number; // pixels — default: 30
  ease?: string; // GSAP ease — default: 'power2.out'
  delay?: number; // seconds — default: 0
}

export function useStaggerCards<T extends HTMLElement = HTMLDivElement>(
  options: StaggerCardsOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;

    const children = Array.from(ref.current.children);
    if (children.length === 0) return;

    gsap.fromTo(
      children,
      { opacity: 0, y: options.y ?? 30 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration ?? 0.6,
        delay: options.delay ?? 0,
        stagger: options.stagger ?? 0.12,
        ease: options.ease ?? "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      }
    );
  }, []);

  return ref;
}
