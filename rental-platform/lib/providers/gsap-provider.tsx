// ═══════════════════════════════════════════════════════════
// lib/providers/gsap-provider.tsx
// Registers GSAP plugins + syncs ScrollTrigger with Lenis
// ═══════════════════════════════════════════════════════════

"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync GSAP ScrollTrigger with Lenis smooth scroll
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).__lenis;
    if (!lenis) return;

    // Proxy the scroller so ScrollTrigger reads Lenis scroll position
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ScrollTrigger.scrollerProxy(document.documentElement, undefined as any);
    };
  }, []);

  return <>{children}</>;
}
