// ═══════════════════════════════════════════════════════════
// app/account/bookings/page.tsx
// Client booking history — currently shows empty/placeholder state
// due to backend gap (no client bookings endpoint)
// ═══════════════════════════════════════════════════════════

"use client";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";

export default function ClientBookingsPage() {
  // ⚠️ BACKEND GAP: No GET /api/client/bookings endpoint documented.
  // GET /api/internal/bookings requires admin auth — cannot be used here.
  // The page structure is built but data integration is BLOCKED.
  //
  // When the backend adds a client bookings endpoint:
  // 1. Add useClientBookings() hook in lib/hooks/useClient.ts
  // 2. Call it here to fetch bookings
  // 3. Pass bookings to ClientBookingTable / ClientBookingCard
  // 4. Use P10-corrected field names: id, bookingStatus, guestCount, finalAmount, etc.

  const bookings: never[] = []; // Empty until backend endpoint is available

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          My Bookings
        </h1>
      </div>

      {/* Empty State — No bookings yet OR backend gap */}
      {bookings.length === 0 && (
        <EmptyState
          title="No bookings yet"
          description="When you submit booking requests, they'll appear here so you can track their status."
          icon={<CalendarCheck className="h-12 w-12" />}
          action={
            <Link href="/units">
              <Button>Browse Properties</Button>
            </Link>
          }
        />
      )}

      {/* ⚠️ DEVELOPMENT NOTE — Remove when backend endpoint is added */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-800">
            ⚠️ Backend Endpoint Pending
          </p>
          <p className="mt-1 text-amber-700">
            Client bookings require a documented{" "}
            <code className="rounded bg-amber-100 px-1">
              GET /api/client/bookings
            </code>{" "}
            endpoint. The admin endpoint (
            <code className="rounded bg-amber-100 px-1">
              GET /api/internal/bookings
            </code>
            ) requires admin authentication and cannot be used for client
            accounts.
          </p>
          <p className="mt-2 text-amber-700">
            When the endpoint is added, use P10-corrected field names:{" "}
            <code className="rounded bg-amber-100 px-1">id</code> (not
            bookingId),{" "}
            <code className="rounded bg-amber-100 px-1">bookingStatus</code>{" "}
            (not status),{" "}
            <code className="rounded bg-amber-100 px-1">guestCount</code> (not
            numberOfGuests),{" "}
            <code className="rounded bg-amber-100 px-1">finalAmount</code> (not
            totalAmount).
          </p>
        </div>
      )}

      {/* Booking List — Will render when data is available */}
      {bookings.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-card md:block">
            {/* <ClientBookingTable ... /> */}
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {/* {bookings.map(booking => <ClientBookingCard key={booking.id} booking={booking} />)} */}
          </div>
        </>
      )}
    </div>
  );
}
