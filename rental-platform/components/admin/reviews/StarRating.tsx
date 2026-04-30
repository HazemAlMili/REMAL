"use client";

import { Star } from "lucide-react";

export interface StarRatingProps {
  rating: number; // 1-5
  size?: "sm" | "md";
  readOnly: true; // always read-only in admin context
}

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
      role="img"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={iconSize}
          className={
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-neutral-200 text-neutral-200"
          }
        />
      ))}
    </div>
  );
}
