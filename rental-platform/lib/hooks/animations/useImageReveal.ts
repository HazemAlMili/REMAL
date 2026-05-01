// ═══════════════════════════════════════════════════════════
// lib/hooks/animations/useImageReveal.ts
// Clip-path reveal from bottom — used for hero images, brand
// story images, and any visual that should "unveil" on scroll
// ═══════════════════════════════════════════════════════════

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface ImageRevealOptions {
  duration?: number; // seconds — default: 1.2
  ease?: string; // GSAP ease — default: 'power3.inOut'
  delay?: number; // seconds — default: 0
  direction?: "bottom" | "left" | "right"; // default: 'bottom'
}

export function useImageReveal<T extends HTMLElement = HTMLDivElement>(
  options: ImageRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;

    const direction = options.direction ?? "bottom";

    // Clip-path start state: fully clipped (hidden)
    const clipFrom: Record<string, string> = {
      bottom: "inset(100% 0% 0% 0%)",
      left: "inset(0% 100% 0% 0%)",
      right: "inset(0% 0% 0% 100%)",
    };

    gsap.fromTo(
      ref.current,
      { clipPath: clipFrom[direction], opacity: 0 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: options.duration ?? 1.2,
        delay: options.delay ?? 0,
        ease: options.ease ?? "power3.inOut",
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
