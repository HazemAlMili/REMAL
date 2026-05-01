// ═══════════════════════════════════════════════════════════
// components/public/sections/ProcessStep.tsx
// Individual step card — number circle + heading + description
// ═══════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ProcessStep({
  number,
  title,
  description,
  icon: Icon,
}: ProcessStepProps) {
  return (
    <div className="flex flex-col items-center px-4 text-center">
      {/* Numbered Circle with Icon */}
      <div className="relative mb-6">
        <div className="bg-primary-500/10 flex h-16 w-16 items-center justify-center rounded-full lg:h-20 lg:w-20">
          <Icon className="h-7 w-7 text-primary-500 lg:h-8 lg:w-8" />
        </div>
        {/* Step Number Badge */}
        <span
          className="
          absolute -right-1 -top-1
          flex h-7 w-7
          items-center justify-center
          rounded-full bg-primary-500
          text-xs font-bold text-white
          shadow-sm
        "
        >
          {number}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-display text-lg font-semibold text-neutral-900 lg:text-xl">
        {title}
      </h3>

      {/* Description */}
      <p className="max-w-xs text-sm leading-relaxed text-neutral-600 lg:text-base">
        {description}
      </p>
    </div>
  );
}
