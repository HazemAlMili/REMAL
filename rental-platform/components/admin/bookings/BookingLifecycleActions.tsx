import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BOOKING_VALID_TRANSITIONS, BookingStatus } from "@/lib/constants/booking-statuses";
import { LifecycleActionDialog } from "./LifecycleActionDialog";
import {
  useConfirmBooking,
  useCancelBooking,
  useCompleteBooking,
  useCheckInBooking,
  useLeftEarlyBooking,
} from "@/lib/hooks/useBookings";
import { CheckCircle, XCircle, LogIn, LogOut, CheckSquare } from "lucide-react";

interface BookingLifecycleActionsProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

type ActionType = "confirm" | "cancel" | "checkIn" | "complete" | "leftEarly" | null;

export function BookingLifecycleActions({ bookingId, currentStatus }: BookingLifecycleActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const confirmMutation = useConfirmBooking(bookingId);
  const cancelMutation = useCancelBooking(bookingId);
  const checkInMutation = useCheckInBooking(bookingId);
  const completeMutation = useCompleteBooking(bookingId);
  const leftEarlyMutation = useLeftEarlyBooking(bookingId);

  const getValidTransitions = () => {
    return BOOKING_VALID_TRANSITIONS[currentStatus] || [];
  };

  const validTransitions = getValidTransitions();

  if (validTransitions.length === 0) {
    return null; // No available actions
  }

  const handleActionComplete = (notes?: string) => {
    const data = notes ? { notes } : undefined;
    
    switch (activeAction) {
      case "confirm":
        confirmMutation.mutate(data, { onSuccess: () => setActiveAction(null) });
        break;
      case "cancel":
        cancelMutation.mutate(data, { onSuccess: () => setActiveAction(null) });
        break;
      case "checkIn":
        checkInMutation.mutate(data, { onSuccess: () => setActiveAction(null) });
        break;
      case "complete":
        completeMutation.mutate(data, { onSuccess: () => setActiveAction(null) });
        break;
      case "leftEarly":
        leftEarlyMutation.mutate(data, { onSuccess: () => setActiveAction(null) });
        break;
    }
  };

  const getDialogConfig = () => {
    switch (activeAction) {
      case "confirm":
        return {
          title: "Confirm Booking",
          description: "Are you sure you want to confirm this booking? This will generate the invoice and send a confirmation to the client.",
          actionLabel: "Confirm Booking",
          isPending: confirmMutation.isPending,
        };
      case "cancel":
        return {
          title: "Cancel Booking",
          description: "Are you sure you want to cancel this booking? This action is permanent. The unit will be freed up for these dates.",
          actionLabel: "Cancel Booking",
          isPending: cancelMutation.isPending,
          requireNotes: true,
        };
      case "checkIn":
        return {
          title: "Check-In Client",
          description: "Confirm that the client has checked into the unit.",
          actionLabel: "Check In",
          isPending: checkInMutation.isPending,
        };
      case "complete":
        return {
          title: "Complete Booking",
          description: "Mark the booking as completed. Use this when the client has checked out normally at the end of their stay.",
          actionLabel: "Complete Booking",
          isPending: completeMutation.isPending,
        };
      case "leftEarly":
        return {
          title: "Left Early",
          description: "Mark that the client has left the unit earlier than the checkout date.",
          actionLabel: "Record Early Departure",
          isPending: leftEarlyMutation.isPending,
        };
      default:
        return {
          title: "",
          description: "",
          actionLabel: "",
          isPending: false,
        };
    }
  };

  const dialogConfig = getDialogConfig();

  return (
    <div className="flex flex-wrap gap-2">
      {validTransitions.includes("Confirmed") && (
        <Button variant="primary" size="sm" onClick={() => setActiveAction("confirm")}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Confirm Booking
        </Button>
      )}
      {validTransitions.includes("CheckIn") && (
        <Button variant="primary" size="sm" onClick={() => setActiveAction("checkIn")}>
          <LogIn className="mr-2 h-4 w-4" />
          Check In
        </Button>
      )}
      {validTransitions.includes("Completed") && (
        <Button variant="primary" size="sm" onClick={() => setActiveAction("complete")}>
          <CheckSquare className="mr-2 h-4 w-4" />
          Complete Booking
        </Button>
      )}
      {validTransitions.includes("LeftEarly") && (
        <Button variant="outline" size="sm" onClick={() => setActiveAction("leftEarly")}>
          <LogOut className="mr-2 h-4 w-4" />
          Left Early
        </Button>
      )}
      {validTransitions.includes("Cancelled") && (
        <Button variant="danger" size="sm" onClick={() => setActiveAction("cancel")}>
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Booking
        </Button>
      )}

      {activeAction && (
        <LifecycleActionDialog
          open={!!activeAction}
          onOpenChange={(open) => !open && setActiveAction(null)}
          onConfirm={handleActionComplete}
          {...dialogConfig}
        />
      )}
    </div>
  );
}




