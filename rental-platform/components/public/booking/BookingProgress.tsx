// ═══════════════════════════════════════════════════════════
// components/public/booking/BookingProgress.tsx
// 3-step progress indicator
// ═══════════════════════════════════════════════════════════

import type { BookingStep } from "@/lib/types/booking.types";

interface BookingProgressProps {
  currentStep: BookingStep;
}

const STEPS = [
  { number: 1, label: "Booking Details" },
  { number: 2, label: "Your Details" },
  { number: 3, label: "Review & Submit" },
] as const;

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div
            className={`
            flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
            ${
              step.number < currentStep
                ? "bg-primary-500 text-white" // Completed
                : step.number === currentStep
                  ? "bg-primary-500 text-white" // Current
                  : "bg-neutral-200 text-neutral-500" // Upcoming
            }
          `}
          >
            {step.number < currentStep ? "✓" : step.number}
          </div>

          {/* Step Label */}
          <span
            className={`
            ml-2 hidden text-sm font-medium sm:inline
            ${step.number === currentStep ? "text-neutral-900" : "text-neutral-500"}
          `}
          >
            {step.label}
          </span>

          {/* Connector Line */}
          {index < STEPS.length - 1 && (
            <div
              className={`
              mx-2 h-0.5 w-8 lg:w-16
              ${step.number < currentStep ? "bg-primary-500" : "bg-neutral-200"}
            `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
