// ═══════════════════════════════════════════════════════════
// components/public/cards/StarRating.tsx
// Reusable star display (1–5, filled/empty)
// ═══════════════════════════════════════════════════════════

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // 1–5
  size?: number; // icon size in pixels — default 16
  className?: string;
}

export function StarRating({
  rating,
  size = 16,
  className = "",
}: StarRatingProps) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
          }
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}
