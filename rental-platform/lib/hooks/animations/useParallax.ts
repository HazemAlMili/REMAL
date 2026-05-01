// ═══════════════════════════════════════════════════════════
// lib/hooks/animations/useParallax.ts
// Background parallax scrub — used for brand story image,
// newsletter CTA background, and any section with depth
// ═══════════════════════════════════════════════════════════

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.3 // 0 = no parallax, 1 = full scroll distance
) {
  const ref = useRef<T>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Skip parallax on touch devices (parallax + touch = janky UX)
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  useGSAP(() => {
    if (!ref.current || prefersReduced || isTouchDevice) return;

    gsap.to(ref.current, {
      yPercent: -100 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return ref;
}
