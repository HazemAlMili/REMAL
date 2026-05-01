// ═══════════════════════════════════════════════════════════
// lib/hooks/animations/useTextReveal.ts
// SplitType character/word stagger reveal — used for section
// headings that "type in" word-by-word or char-by-char
// ═══════════════════════════════════════════════════════════

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";

interface TextRevealOptions {
  type?: "words" | "chars"; // default: 'words'
  stagger?: number; // seconds — default: 0.05
  duration?: number; // seconds — default: 0.7
  ease?: string; // GSAP ease — default: 'power3.out'
  delay?: number; // seconds — default: 0
}

export function useTextReveal<T extends HTMLElement = HTMLHeadingElement>(
  options: TextRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;

    const split = new SplitType(ref.current, {
      types: options.type ?? "words",
    });
    const targets = options.type === "chars" ? split.chars : split.words;

    gsap.fromTo(
      targets,
      { opacity: 0, yPercent: 120, rotateX: -15 },
      {
        opacity: 1,
        yPercent: 0,
        rotateX: 0,
        duration: options.duration ?? 0.7,
        delay: options.delay ?? 0,
        stagger: options.stagger ?? 0.05,
        ease: options.ease ?? "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          once: true,
        },
      }
    );

    // SplitType modifies the DOM — ALWAYS revert on cleanup
    return () => split.revert();
  }, []);

  return ref;
}
