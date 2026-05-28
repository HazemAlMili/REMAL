import type { OwnerPortalBookingResponse } from "@/lib/types/owner-portal.types";
import { formatCurrency } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface OwnerBookingRowProps {
  booking: OwnerPortalBookingResponse;
  onClick: () => void;
}

export function OwnerBookingRow({ booking, onClick }: OwnerBookingRowProps) {
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-neutral-200 transition-colors hover:bg-neutral-50"
    >
      <td className="px-4 py-3 text-sm">
        <span className="font-mono text-xs text-neutral-600">
          {booking.bookingId.slice(0, 8)}...
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className="font-mono text-xs text-neutral-600">
          {booking.unitId.slice(0, 8)}...
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-neutral-900">
        {formatDate(checkInDate)}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-900">
        {formatDate(checkOutDate)}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-900">
        {booking.guestCount}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={booking.bookingStatus} />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-neutral-900">
        {formatCurrency(booking.finalAmount)}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-500">{booking.source}</td>
    </tr>
  );
}
