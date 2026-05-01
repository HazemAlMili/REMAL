"use client";

import { useParams } from "next/navigation";
import {
  useBookingDetail,
  useBookingFinanceSnapshot,
} from "@/lib/hooks/useBookings";
import { BookingHeader } from "@/components/admin/bookings/BookingHeader";
import { BookingClientInfo } from "@/components/admin/bookings/BookingClientInfo";
import { BookingFinancialSummary } from "@/components/admin/bookings/BookingFinancialSummary";
import { BookingLifecycleActions } from "@/components/admin/bookings/BookingLifecycleActions";
import { BookingPayments } from "@/components/admin/bookings/BookingPayments";
import { BookingInvoice } from "@/components/admin/bookings/BookingInvoice";
import { BookingNotes } from "@/components/admin/bookings/BookingNotes";
import { BookingAssignment } from "@/components/admin/bookings/BookingAssignment";
import { BookingStatusHistory } from "@/components/admin/bookings/BookingStatusHistory";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileQuestion, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useBookingDetail(bookingId as string);
  const { data: snapshot, isLoading: snapshotLoading } =
    useBookingFinanceSnapshot(bookingId as string);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    // @ts-expect-error Axios error type mapping
    const isNotFound = error?.response?.status === 404;

    if (isNotFound) {
      return (
        <EmptyState
          icon={<FileQuestion className="h-12 w-12" />}
          title="Booking not found"
          description="This booking may have been removed or the ID is incorrect"
          action={
            <Link
              href={ROUTES.admin.bookings.list}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                "bg-blue-600 text-white hover:bg-blue-700",
                "h-10 px-4 py-2"
              )}
            >
              Back to Bookings
            </Link>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={<AlertCircle className="h-12 w-12" />}
        title="Could not load booking"
        description="An error occurred while fetching booking details"
      />
    );
  }

  if (!booking) return null;

  return (
    <div className="space-y-6">
      <BookingHeader booking={booking} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BookingClientInfo clientId={booking.clientId} />
        {snapshotLoading ? (
          <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-neutral-700">
              Financial Summary
            </h3>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : snapshot ? (
          <BookingFinancialSummary snapshot={snapshot} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-4 text-sm text-red-500">
            Financial data unavailable
          </div>
        )}
      </div>

      {/* Status & Lifecycle Actions */}
      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-700">
          Lifecycle Actions
        </h3>
        <BookingLifecycleActions
          bookingId={booking.id}
          currentStatus={booking.bookingStatus}
        />
      </div>

      {/* Payments */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <BookingPayments bookingId={booking.id} />
      </div>

      {/* Invoice */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <BookingInvoice
          bookingId={booking.id}
          invoiceId={snapshot?.invoiceId || null}
        />
      </div>

      {/* Notes & Assignment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <BookingNotes bookingId={booking.id} />
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <BookingAssignment bookingId={booking.id} />
        </div>
      </div>

      {/* Status History */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <BookingStatusHistory bookingId={booking.id} />
      </div>
    </div>
  );
}
