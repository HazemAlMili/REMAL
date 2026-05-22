import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  BOOKING_VALID_TRANSITIONS,
  BookingStatus,
} from "@/lib/constants/booking-statuses";
import { LifecycleActionDialog } from "./LifecycleActionDialog";
import {
  useConfirmBooking,
  useBookedBooking,
  useRelevantBooking,
  useNoAnswerBooking,
  useNotRelevantBooking,
  useCancelBooking,
  useCompleteBooking,
  useCheckInBooking,
  useLeftEarlyBooking,
} from "@/lib/hooks/useBookings";
import {
  CheckCircle,
  XCircle,
  CheckSquare,
  LogIn,
  LogOut,
  Calendar,
  ThumbsUp,
  PhoneOff,
  ThumbsDown,
} from "lucide-react";

interface BookingLifecycleActionsProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

type ActionType =
  | "confirm"
  | "booked"
  | "relevant"
  | "noAnswer"
  | "notRelevant"
  | "cancel"
  | "complete"
  | "checkIn"
  | "leftEarly"
  | null;

export function BookingLifecycleActions({
  bookingId,
  currentStatus,
}: BookingLifecycleActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const confirmMutation = useConfirmBooking(bookingId);
  const bookedMutation = useBookedBooking(bookingId);
  const relevantMutation = useRelevantBooking(bookingId);
  const noAnswerMutation = useNoAnswerBooking(bookingId);
  const notRelevantMutation = useNotRelevantBooking(bookingId);
  const cancelMutation = useCancelBooking(bookingId);
  const completeMutation = useCompleteBooking(bookingId);
  const checkInMutation = useCheckInBooking(bookingId);
  const leftEarlyMutation = useLeftEarlyBooking(bookingId);

  const getValidTransitions = () => {
    return BOOKING_VALID_TRANSITIONS[currentStatus] || [];
  };

  const validTransitions = getValidTransitions();

  const handleActionComplete = (notes?: string) => {
    const data = notes ? { notes } : undefined;

    switch (activeAction) {
      case "confirm":
        confirmMutation.mutate(data, {
          onSuccess: () => {
            setActiveAction(null);
          },
        });
        break;
      case "booked":
        bookedMutation.mutate(data, {
          onSuccess: () => {
            setActiveAction(null);
          },
        });
        break;
      case "relevant":
        relevantMutation.mutate(data, {
          onSuccess: () => setActiveAction(null),
        });
        break;
      case "noAnswer":
        noAnswerMutation.mutate(data, {
          onSuccess: () => setActiveAction(null),
        });
        break;
      case "notRelevant":
        notRelevantMutation.mutate(data, {
          onSuccess: () => setActiveAction(null),
        });
        break;
      case "cancel":
        cancelMutation.mutate(data, { onSuccess: () => setActiveAction(null) });
        break;
      case "complete":
        completeMutation.mutate(data, {
          onSuccess: () => setActiveAction(null),
        });
        break;
      case "checkIn":
        checkInMutation.mutate(data, {
          onSuccess: () => setActiveAction(null),
        });
        break;
      case "leftEarly":
        leftEarlyMutation.mutate(data, {
          onSuccess: () => setActiveAction(null),
        });
        break;
    }
  };

  const getDialogConfig = () => {
    switch (activeAction) {
      case "relevant":
        return {
          title: "Mark as Relevant",
          description:
            "Mark this booking as relevant. This indicates the lead is worth pursuing.",
          actionLabel: "Mark as Relevant",
          isPending: relevantMutation.isPending,
        };
      case "noAnswer":
        return {
          title: "Mark as No Answer",
          description:
            "Mark this booking as no answer. This indicates the client is not responding to contact attempts.",
          actionLabel: "Mark as No Answer",
          isPending: noAnswerMutation.isPending,
        };
      case "notRelevant":
        return {
          title: "Mark as Not Relevant",
          description:
            "Mark this booking as not relevant. This indicates the lead is not worth pursuing further.",
          actionLabel: "Mark as Not Relevant",
          isPending: notRelevantMutation.isPending,
        };
      case "booked":
        return {
          title: "Mark as Booked",
          description:
            "Mark this booking as booked. This indicates the client has committed to the booking and you're ready to confirm it.",
          actionLabel: "Mark as Booked",
          isPending: bookedMutation.isPending,
        };
      case "confirm":
        return {
          title: "Confirm Booking",
          description:
            "Are you sure you want to confirm this booking? This will generate the invoice and send a confirmation to the client.",
          actionLabel: "Confirm Booking",
          isPending: confirmMutation.isPending,
        };
      case "checkIn":
        return {
          title: "Check In Client",
          description:
            "Mark the client as checked in. Use this when the client arrives and takes possession of the unit.",
          actionLabel: "Check In",
          isPending: checkInMutation.isPending,
        };
      case "complete":
        return {
          title: "Complete Booking",
          description:
            "Mark the booking as completed. Use this when the client has checked out normally at the end of their stay.",
          actionLabel: "Complete Booking",
          isPending: completeMutation.isPending,
        };
      case "leftEarly":
        return {
          title: "Left Early",
          description:
            "Record that the client left before the scheduled checkout date. This may affect billing and availability.",
          actionLabel: "Mark Left Early",
          isPending: leftEarlyMutation.isPending,
          requireNotes: true,
        };
      case "cancel":
        return {
          title: "Cancel Booking",
          description:
            "Are you sure you want to cancel this booking? This action is permanent. The unit will be freed up for these dates.",
          actionLabel: "Cancel Booking",
          isPending: cancelMutation.isPending,
          requireNotes: true,
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {validTransitions.includes("Relevant") && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setActiveAction("relevant")}
            className="shadow-md hover:shadow-lg"
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            👍 Mark as Relevant
          </Button>
        )}
        {validTransitions.includes("NoAnswer") && (
          <Button
            variant="warning"
            size="lg"
            onClick={() => setActiveAction("noAnswer")}
            className="shadow-md hover:shadow-lg"
          >
            <PhoneOff className="mr-2 h-5 w-5" />
            📵 No Answer
          </Button>
        )}
        {validTransitions.includes("NotRelevant") && (
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setActiveAction("notRelevant")}
            className="shadow-md hover:shadow-lg"
          >
            <ThumbsDown className="mr-2 h-5 w-5" />
            👎 Not Relevant
          </Button>
        )}
        {validTransitions.includes("Booked") && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setActiveAction("booked")}
            className="shadow-md hover:shadow-lg"
          >
            <Calendar className="mr-2 h-5 w-5" />
            📅 Mark as Booked
          </Button>
        )}
        {validTransitions.includes("Confirmed") && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setActiveAction("confirm")}
            className="shadow-md hover:shadow-lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />✓ Confirm Booking
          </Button>
        )}
        {validTransitions.includes("CheckIn") && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setActiveAction("checkIn")}
            className="shadow-md hover:shadow-lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            🚪 Check In Client
          </Button>
        )}
        {validTransitions.includes("Completed") && (
          <Button
            variant="success"
            size="lg"
            onClick={() => setActiveAction("complete")}
            className="shadow-md hover:shadow-lg"
          >
            <CheckSquare className="mr-2 h-5 w-5" />☑ Complete Booking
          </Button>
        )}
        {validTransitions.includes("LeftEarly") && (
          <Button
            variant="warning"
            size="lg"
            onClick={() => setActiveAction("leftEarly")}
            className="shadow-md hover:shadow-lg"
          >
            <LogOut className="mr-2 h-5 w-5" />⏰ Left Early
          </Button>
        )}
        {validTransitions.includes("Cancelled") && (
          <Button
            variant="danger"
            size="lg"
            onClick={() => setActiveAction("cancel")}
            className="shadow-md hover:shadow-lg"
          >
            <XCircle className="mr-2 h-5 w-5" />✗ Cancel Booking
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

      {validTransitions.length === 0 && (
        <div className="rounded-md bg-neutral-100 p-4 text-center text-sm text-neutral-600">
          <p className="font-semibold">No actions available</p>
          <p className="mt-1 text-xs">
            This booking is in a terminal state ({currentStatus})
          </p>
        </div>
      )}
    </div>
  );
}
