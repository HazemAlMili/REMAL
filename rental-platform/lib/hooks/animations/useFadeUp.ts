// ═══════════════════════════════════════════════════════════
// lib/hooks/animations/useFadeUp.ts
// Fade + translate-up on scroll enter — used by paragraphs,
// CTAs, and any element that should slide up into view
// ═══════════════════════════════════════════════════════════

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface FadeUpOptions {
  delay?: number; // seconds — default: 0
  duration?: number; // seconds — default: 0.8
  y?: number; // pixels — default: 40
  ease?: string; // GSAP ease — default: 'power2.out'
  stagger?: number; // seconds — for multiple children (e.g., card grids)
}

export function useFadeUp<T extends HTMLElement = HTMLDivElement>(
  options: FadeUpOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;

    const target = options.stagger
      ? Array.from(ref.current.children)
      : ref.current;

    gsap.fromTo(
      target,
      { opacity: 0, y: options.y ?? 40 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration ?? 0.8,
        delay: options.delay ?? 0,
        ease: options.ease ?? "power2.out",
        stagger: options.stagger,
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
