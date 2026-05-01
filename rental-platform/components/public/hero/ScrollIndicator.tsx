// ═══════════════════════════════════════════════════════════
// components/public/hero/ScrollIndicator.tsx
// Animated bouncing arrow at bottom center of hero
// ═══════════════════════════════════════════════════════════

"use client";
import { ChevronDown } from "lucide-react";

export function ScrollIndicator() {
  return (
    <div className="animate-hero-bounce flex flex-col items-center gap-1">
      <span className="font-mono text-xs uppercase tracking-widest text-white/50">
        Scroll
      </span>
      <ChevronDown className="h-5 w-5 text-white/50" />
    </div>
  );
}
