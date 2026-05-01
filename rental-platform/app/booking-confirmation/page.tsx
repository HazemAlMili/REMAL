// ═══════════════════════════════════════════════════════════
// app/booking-confirmation/page.tsx
// Standalone success page after CRM lead submission
// Reads lead ID from URL search params
// ═══════════════════════════════════════════════════════════

"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Home, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("id");

  // Display short reference (first 8 chars) for readability, full ID below
  const shortRef = leadId ? leadId.slice(0, 8).toUpperCase() : "N/A";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-20">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Request Submitted!
        </h1>

        {/* Description */}
        <p className="text-base leading-relaxed text-neutral-600">
          Our sales team will contact you within 24 hours to confirm your
          booking request and discuss next steps.
        </p>

        {/* Reference Number */}
        {leadId && (
          <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-card">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Reference Number
            </p>
            <p className="font-mono text-lg font-bold text-neutral-900">
              {shortRef}
            </p>
            <p className="mt-1 break-all font-mono text-xs text-neutral-400">
              {leadId}
            </p>
          </div>
        )}

        {/* What happens next */}
        <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-5 text-left shadow-card">
          <h3 className="font-display text-sm font-semibold text-neutral-900">
            What happens next?
          </h3>
          <ol className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="bg-primary-500/10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-500">
                1
              </span>
              <span>
                Our team reviews your request and checks availability.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary-500/10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-500">
                2
              </span>
              <span>
                A sales representative contacts you to confirm details and
                pricing.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary-500/10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-500">
                3
              </span>
              <span>Once confirmed, a deposit secures your booking.</span>
            </li>
          </ol>
        </div>

        {/* Action Links */}
        <div className="space-y-3 pt-2">
          <Link href="/account/bookings">
            <Button variant="primary" size="lg" className="w-full">
              <User className="mr-2 h-4 w-4" />
              View My Bookings
            </Button>
          </Link>

          <Link href="/units">
            <Button variant="secondary" size="lg" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Browse More Properties
            </Button>
          </Link>
        </div>

        <p className="text-xs text-neutral-400">
          You will receive an email confirmation shortly.
        </p>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="text-neutral-500">Loading...</div>
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
