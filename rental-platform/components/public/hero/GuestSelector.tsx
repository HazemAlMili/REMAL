// ═══════════════════════════════════════════════════════════
// components/public/hero/GuestSelector.tsx
// Number input with +/− buttons — styled for dark background
// ═══════════════════════════════════════════════════════════

"use client";
import { Minus, Plus } from "lucide-react";

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number; // default: 1
  max?: number; // default: 20
}

export function GuestSelector({
  value,
  onChange,
  min = 1,
  max = 20,
}: GuestSelectorProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="
          flex h-7 w-7 items-center justify-center
          rounded-full border border-white/20
          text-white/70 transition-colors duration-150
          hover:border-white/40 hover:text-white
          disabled:cursor-not-allowed disabled:opacity-30
        "
        aria-label="Decrease guests"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[2ch] text-center text-sm font-medium tabular-nums text-white">
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="
          flex h-7 w-7 items-center justify-center
          rounded-full border border-white/20
          text-white/70 transition-colors duration-150
          hover:border-white/40 hover:text-white
          disabled:cursor-not-allowed disabled:opacity-30
        "
        aria-label="Increase guests"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
