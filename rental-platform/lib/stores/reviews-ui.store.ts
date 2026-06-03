import { create } from "zustand";
import type { BookingListItemResponse } from "@/lib/types/booking.types";
import type { ClientReviewByBookingResponse } from "@/lib/types/client.types";

interface ReviewsUIState {
  activeTab: "awaiting" | "feedback";
  selectedBooking: BookingListItemResponse | null;
  selectedReview: ClientReviewByBookingResponse | null;
  isModalOpen: boolean;
  reviewMode: "create" | "edit";
  submitError: string | null;

  setActiveTab: (tab: "awaiting" | "feedback") => void;
  openCreateReview: (booking: BookingListItemResponse) => void;
  openEditReview: (booking: BookingListItemResponse, review: ClientReviewByBookingResponse) => void;
  closeReviewModal: () => void;
  setSubmitError: (error: string | null) => void;
}

export const useReviewsUIStore = create<ReviewsUIState>((set) => ({
  activeTab: "awaiting",
  selectedBooking: null,
  selectedReview: null,
  isModalOpen: false,
  reviewMode: "create",
  submitError: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  openCreateReview: (booking) =>
    set({
      selectedBooking: booking,
      selectedReview: null,
      isModalOpen: true,
      reviewMode: "create",
      submitError: null,
    }),

  openEditReview: (booking, review) =>
    set({
      selectedBooking: booking,
      selectedReview: review,
      isModalOpen: true,
      reviewMode: "edit",
      submitError: null,
    }),

  closeReviewModal: () =>
    set({
      selectedBooking: null,
      selectedReview: null,
      isModalOpen: false,
      submitError: null,
    }),

  setSubmitError: (error) => set({ submitError: error }),
}));
