import { useInternalUnitDetail } from "@/lib/hooks/useUnits";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, getNights } from "@/lib/utils/format";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { ArrowLeft } from "lucide-react";
import type { BookingDetailsResponse } from "@/lib/types/booking.types";

interface BookingHeaderProps {
  booking: BookingDetailsResponse;
}

export function BookingHeader({ booking }: BookingHeaderProps) {
  const { data: unit, isLoading: isUnitLoading } = useInternalUnitDetail(booking.unitId);
  const nights = getNights(booking.checkInDate, booking.checkOutDate);

  return (
    <div className="space-y-4">
      <Link
        href={ROUTES.admin.bookings.list}
        className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 transition"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Bookings
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">
              Booking {booking?.id?.split("-")[0]?.toUpperCase()}
            </h1>
            <StatusBadge status={booking.bookingStatus} />
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {booking.source}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center mt-2 text-sm text-neutral-500 gap-x-4 gap-y-2">
            <div>
              {formatDate(booking.checkInDate)} — {formatDate(booking.checkOutDate)}
              <span className="mx-2 text-neutral-300">•</span>
              {nights} night{nights !== 1 ? "s" : ""}
            </div>
            
            {isUnitLoading ? (
              <div className="flex items-center">
                <span className="mx-2 hidden md:inline text-neutral-300">|</span>
                <Skeleton className="h-4 w-32" />
              </div>
            ) : unit ? (
              <div className="flex items-center">
                <span className="mx-2 hidden md:inline text-neutral-300">|</span>
                <Link
                  href={ROUTES.admin.units.detail(unit.id)}
                  className="font-medium text-neutral-700 hover:text-black hover:underline mr-2"
                >
                  Unit {unit.name}
                </Link>
                <span className="text-xs px-2 py-[2px] bg-neutral-100 rounded-full border border-neutral-200">
                  {unit.unitType}
                </span>
                <span className="text-xs ml-2 text-neutral-400">
                  ({unit.areaId})
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
