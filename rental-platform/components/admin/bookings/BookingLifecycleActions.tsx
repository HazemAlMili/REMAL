import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/lib/hooks/usePermissions";
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
  const { canManageBookings } = usePermissions();

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

  // Lifecycle endpoints (BookingLifecycleController) require SalesOrSuperAdmin;
  // roles without it (e.g. Finance) must not see actions that always 403.
  if (!canManageBookings) {
    return null;
  }

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
            "Keep this lead active in the sales workflow because the client is a realistic fit.",
          actionLabel: "Mark as Relevant",
          isPending: relevantMutation.isPending,
        };
      case "noAnswer":
        return {
          title: "Mark as No Answer",
          description:
            "Use this when the client has not responded after contact attempts. The lead can move back to Relevant later.",
          actionLabel: "Mark as No Answer",
          isPending: noAnswerMutation.isPending,
        };
      case "notRelevant":
        return {
          title: "Mark as Not Relevant",
          description:
            "Close this lead because it should not be pursued further.",
          actionLabel: "Mark as Not Relevant",
          isPending: notRelevantMutation.isPending,
        };
      case "booked":
        return {
          title: "Mark as Booked",
          description:
            "Use this when the client has committed and the booking is ready for final confirmation.",
          actionLabel: "Mark as Booked",
          isPending: bookedMutation.isPending,
        };
      case "confirm":
        return {
          title: "Confirm Booking",
          description:
            "Confirm this booking? The system will generate an invoice and send the client a confirmation.",
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
            "Cancel this booking? This cannot be undone, and the unit will become available for these dates.",
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
      <div className="flex flex-wrap gap-2.5">
        {validTransitions.includes("Relevant") && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setActiveAction("relevant")}
            leftIcon={<ThumbsUp className="h-4 w-4" />}
          >
            Mark as relevant
          </Button>
        )}
        {validTransitions.includes("NoAnswer") && (
          <Button
            variant="warning"
            size="md"
            onClick={() => setActiveAction("noAnswer")}
            leftIcon={<PhoneOff className="h-4 w-4" />}
          >
            No answer
          </Button>
        )}
        {validTransitions.includes("NotRelevant") && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => setActiveAction("notRelevant")}
            leftIcon={<ThumbsDown className="h-4 w-4" />}
          >
            Not relevant
          </Button>
        )}
        {validTransitions.includes("Booked") && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setActiveAction("booked")}
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            Mark as booked
          </Button>
        )}
        {validTransitions.includes("Confirmed") && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveAction("confirm")}
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            Confirm booking
          </Button>
        )}
        {validTransitions.includes("CheckIn") && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveAction("checkIn")}
            leftIcon={<LogIn className="h-4 w-4" />}
          >
            Check in client
          </Button>
        )}
        {validTransitions.includes("Completed") && (
          <Button
            variant="success"
            size="md"
            onClick={() => setActiveAction("complete")}
            leftIcon={<CheckSquare className="h-4 w-4" />}
          >
            Complete booking
          </Button>
        )}
        {validTransitions.includes("LeftEarly") && (
          <Button
            variant="warning"
            size="md"
            onClick={() => setActiveAction("leftEarly")}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Left early
          </Button>
        )}
        {validTransitions.includes("Cancelled") && (
          <Button
            variant="danger"
            size="md"
            onClick={() => setActiveAction("cancel")}
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            Cancel booking
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
            This booking is already in a final state: {currentStatus}.
          </p>
        </div>
      )}
    </div>
  );
}
