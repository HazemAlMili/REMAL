// ──────────────────────────────────────────────────────────────────────────────
// Owner Portal Hooks
// From REMAL_API_Reference.md Sections 34-39
// Owner Portal uses /api/owner/* endpoints (NOT /api/internal/*)
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ownerPortalService } from "../api/services/owner-portal.service";
import { queryKeys } from "./query-keys";
import type {
  OwnerPortalUnitListFilters,
  OwnerPortalBookingListFilters,
  OwnerPortalFinanceListFilters,
  CreateReviewReplyRequest,
  UpdateReviewReplyRequest,
} from "../types/owner-portal.types";

// ── Dashboard ──

export function useOwnerDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.ownerPortal.dashboardSummary(),
    queryFn: () => ownerPortalService.getDashboardSummary(),
  });
}

// ── Profile ──

export function useOwnerProfile() {
  return useQuery({
    queryKey: queryKeys.ownerPortal.profile(),
    queryFn: () => ownerPortalService.getProfile(),
    retry: false, // Don't retry if endpoint is not implemented
  });
}

// ── Units ──

export function useOwnerUnits(filters?: OwnerPortalUnitListFilters) {
  return useQuery({
    queryKey: queryKeys.ownerPortal.units.list(filters),
    queryFn: () => ownerPortalService.getUnits(filters),
  });
}

export function useOwnerUnit(unitId: string) {
  return useQuery({
    queryKey: queryKeys.ownerPortal.units.detail(unitId),
    queryFn: () => ownerPortalService.getUnitById(unitId),
    enabled: !!unitId,
  });
}

// ── Unit Availability ──

export function useOwnerUnitAvailability(unitId: string, month: Date) {
  const startDate = format(startOfMonth(month), "yyyy-MM-dd");
  const endDate = format(endOfMonth(month), "yyyy-MM-dd");

  return useQuery({
    queryKey: queryKeys.ownerPortal.unitAvailability(
      unitId,
      startDate,
      endDate
    ),
    queryFn: () =>
      ownerPortalService.checkUnitAvailability(unitId, { startDate, endDate }),
    enabled: !!unitId,
    staleTime: 0, // Always fresh per requirements
  });
}

// ── Bookings ──

export function useOwnerBookings(filters?: OwnerPortalBookingListFilters) {
  return useQuery({
    queryKey: queryKeys.ownerPortal.bookings.list(filters),
    queryFn: () => ownerPortalService.getBookings(filters),
  });
}

export function useOwnerBooking(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.ownerPortal.bookings.detail(bookingId),
    queryFn: () => ownerPortalService.getBookingById(bookingId),
    enabled: !!bookingId,
  });
}

// ── Finance ──

export function useOwnerFinanceRows(filters?: OwnerPortalFinanceListFilters) {
  return useQuery({
    queryKey: queryKeys.ownerPortal.finance.list(filters),
    queryFn: () => ownerPortalService.getFinanceRows(filters),
  });
}

export function useOwnerFinanceSummary() {
  return useQuery({
    queryKey: queryKeys.ownerPortal.finance.summary(),
    queryFn: () => ownerPortalService.getFinanceSummary(),
  });
}

// ── Review Replies ──

export function useCreateReviewReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: CreateReviewReplyRequest;
    }) => ownerPortalService.createReviewReply(reviewId, data),
    onSuccess: () => {
      // Invalidate relevant queries when a reply is created
      queryClient.invalidateQueries({
        queryKey: queryKeys.ownerPortal.reviews.all,
      });
    },
  });
}

export function useUpdateReviewReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: UpdateReviewReplyRequest;
    }) => ownerPortalService.updateReviewReply(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ownerPortal.reviews.all,
      });
    },
  });
}

export function useDeleteReviewReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) =>
      ownerPortalService.deleteReviewReply(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ownerPortal.reviews.all,
      });
    },
  });
}
