// ═══════════════════════════════════════════════════════════
// components/public/sections/HowItWorksSection.tsx
// 4-step process section with staggered entrance
// ═══════════════════════════════════════════════════════════

"use client";
import { useFadeUp, useStaggerCards } from "@/lib/hooks/animations";
import { ProcessStep } from "./ProcessStep";
import { Search, MessageSquare, ShieldCheck, KeyRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProcessStepData {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const PROCESS_STEPS: ProcessStepData[] = [
  {
    number: 1,
    title: "Browse",
    description:
      "Explore our curated selection of premium properties across Egypt's finest destinations",
    icon: Search,
  },
  {
    number: 2,
    title: "Inquire",
    description:
      "Submit your preferred dates and our dedicated sales team will confirm availability and pricing",
    icon: MessageSquare,
  },
  {
    number: 3,
    title: "Confirm",
    description:
      "Secure your booking with a deposit and receive instant confirmation via email",
    icon: ShieldCheck,
  },
  {
    number: 4,
    title: "Check In",
    description:
      "Arrive at your property and enjoy a seamless check-in experience",
    icon: KeyRound,
  },
];

export function HowItWorksSection() {
  const headingRef = useFadeUp<HTMLDivElement>();
  const gridRef = useStaggerCards<HTMLDivElement>({ stagger: 0.15, y: 30 });

  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-container px-6">
        {/* Section Header */}
        <div
          ref={headingRef}
          className="mb-12 text-center motion-safe:opacity-0 lg:mb-16"
        >
          <span className="font-body text-sm font-medium uppercase tracking-wider text-primary-500">
            Simple Process
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 lg:text-lg">
            From browsing to check-in, our team handles everything so you can
            focus on enjoying your stay.
          </p>
        </div>

        {/* Steps Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        >
          {PROCESS_STEPS.map((step) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
