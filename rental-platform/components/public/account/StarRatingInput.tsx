// ═══════════════════════════════════════════════════════════
// components/public/account/StarRatingInput.tsx
// Interactive 1–5 star selector — NOT a number input
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number; // Current rating (0 = none selected)
  onChange: (rating: number) => void;
  error?: string;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  error,
  disabled = false,
}: StarRatingInputProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700">
        Rating <span className="text-error">*</span>
      </label>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHoveredStar(star)}
            onMouseLeave={() => !disabled && setHoveredStar(0)}
            className={`
              transition-colors duration-150 focus:outline-none
              ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            `}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`
                h-8 w-8 transition-colors duration-150
                ${
                  (hoveredStar || value) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "fill-none text-neutral-300"
                }
              `}
            />
          </button>
        ))}

        {/* Rating number display */}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-neutral-600">
            {value} / 5
          </span>
        )}
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
