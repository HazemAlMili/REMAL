// ═══════════════════════════════════════════════════════════
// app/units/[id]/book/page.tsx
// Booking form page — multi-step orchestrator
// ═══════════════════════════════════════════════════════════

"use client";
import { use, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  usePublicUnitDetail,
  usePublicUnitImages,
} from "@/lib/hooks/usePublic";
import { BookingProgress } from "@/components/public/booking/BookingProgress";
import { BookingStep1Details } from "@/components/public/booking/BookingStep1Details";
import { BookingStep2Contact } from "@/components/public/booking/BookingStep2Contact";
import { BookingStep3Review } from "@/components/public/booking/BookingStep3Review";
import { BookingUnitSummary } from "@/components/public/booking/BookingUnitSummary";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import type { BookingStep } from "@/lib/types/booking.types";
import type { PricingCalculateResponse } from "@/lib/types/public.types";

function BookingPageContent({ unitId }: { unitId: string }) {
  const searchParams = useSearchParams();

  // Pre-populate from URL params (passed from unit detail page)
  const initialStartDate = searchParams.get("startDate") || null;
  const initialEndDate = searchParams.get("endDate") || null;
  const initialGuestCount = Number(searchParams.get("guests")) || 1;

  // Page-level booking state (shared across steps)
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [startDate, setStartDate] = useState<string | null>(initialStartDate);
  const [endDate, setEndDate] = useState<string | null>(initialEndDate);
  const [guestCount, setGuestCount] = useState(initialGuestCount);

  // Contact info from Step 2 (will be used in Step 3)
  const [clientId, setClientId] = useState<string | undefined>();
  const [contactName, setContactName] = useState<string | undefined>();
  const [contactPhone, setContactPhone] = useState<string | undefined>();
  const [contactEmail, setContactEmail] = useState<string | null | undefined>();

  // Pricing data from Step 1 (needed for Step 3 review)
  const [pricingData, setPricingData] =
    useState<PricingCalculateResponse | null>(null);

  // Fetch unit data
  const {
    data: unit,
    isLoading: unitLoading,
    isError,
  } = usePublicUnitDetail(unitId);
  const { data: images } = usePublicUnitImages(unitId);

  // Handlers
  const handleDatesChange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleGuestChange = (count: number) => {
    setGuestCount(count);
  };

  const handleContinue = () => {
    if (currentStep < 3) setCurrentStep((currentStep + 1) as BookingStep);
  };

  const handleContactSet = (data: {
    clientId: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string | null;
  }) => {
    setClientId(data.clientId);
    setContactName(data.contactName);
    setContactPhone(data.contactPhone);
    setContactEmail(data.contactEmail);
  };

  const handlePricingChange = (pricing: PricingCalculateResponse | null) => {
    setPricingData(pricing);
  };

  // Loading State
  if (unitLoading) {
    return (
      <div className="mx-auto max-w-container px-6 py-8">
        <Skeleton className="mb-8 h-8 w-64" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-[400px] w-[380px] shrink-0 rounded-2xl" />
        </div>
      </div>
    );
  }

  // 404 / Error State
  if (isError || !unit) {
    return (
      <div className="mx-auto max-w-container px-6 py-20">
        <EmptyState
          title="Property not found"
          description="This property may no longer be available."
          action={
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/units")}
            >
              Browse properties
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-container px-6 py-8">
        {/* Back Link */}
        <Link
          href={`/units/${unitId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {unit.name}
        </Link>

        {/* Progress Indicator */}
        <BookingProgress currentStep={currentStep} />

        {/* Main Layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column: Form Steps */}
          <div className="max-w-2xl flex-1">
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-card lg:p-8">
              <h1 className="mb-6 font-display text-2xl font-bold text-neutral-900">
                {currentStep === 1 && "Booking Details"}
                {currentStep === 2 && "Your Details"}
                {currentStep === 3 && "Review & Submit"}
              </h1>

              {/* Step 1 */}
              {currentStep === 1 && (
                <BookingStep1Details
                  unit={unit}
                  startDate={startDate}
                  endDate={endDate}
                  guestCount={guestCount}
                  onDatesChange={handleDatesChange}
                  onGuestChange={handleGuestChange}
                  onPricingChange={handlePricingChange}
                  onContinue={handleContinue}
                />
              )}

              {/* Step 2 — Contact & Auth */}
              {currentStep === 2 && (
                <BookingStep2Contact
                  onContactSet={handleContactSet}
                  onContinue={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {/* Step 3 — Review & Submit */}
              {currentStep === 3 && unit && pricingData && (
                <BookingStep3Review
                  unit={unit}
                  images={images || []}
                  startDate={startDate || ""}
                  endDate={endDate || ""}
                  guestCount={guestCount}
                  clientId={clientId}
                  contactName={contactName}
                  contactPhone={contactPhone}
                  contactEmail={contactEmail}
                  pricing={pricingData}
                  onBack={() => setCurrentStep(2)}
                />
              )}

              {/* Fallback if pricing not available (edge case) */}
              {currentStep === 3 && (!pricingData || !unit) && (
                <div className="py-8 text-center text-neutral-500">
                  <p>Loading booking details...</p>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="mt-2 text-sm text-primary-500"
                  >
                    ← Back to Step 1
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Unit Summary */}
          <div className="w-full shrink-0 lg:w-[380px]">
            <div className="sticky top-24">
              <BookingUnitSummary unit={unit} images={images || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: unitId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container px-6 py-8">
          <Skeleton className="mb-8 h-8 w-64" />
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-[400px] w-[380px] shrink-0 rounded-2xl" />
          </div>
        </div>
      }
    >
      <BookingPageContent unitId={unitId} />
    </Suspense>
  );
}
