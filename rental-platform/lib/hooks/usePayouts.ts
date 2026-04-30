import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutsService } from "@/lib/api/services/payouts.service";
import type {
  CreateOwnerPayoutRequest,
  SetOwnerPayoutScheduledRequest,
  MarkOwnerPayoutPaidRequest,
  CancelOwnerPayoutRequest,
} from "@/lib/types/finance.types";

export const payoutQueryKeys = {
  all: ["ownerPayouts"] as const,
  byOwner: (ownerId: string) =>
    [...payoutQueryKeys.all, "byOwner", ownerId] as const,
  byBooking: (bookingId: string) =>
    [...payoutQueryKeys.all, "byBooking", bookingId] as const,
  summary: (ownerId: string) =>
    [...payoutQueryKeys.all, "summary", ownerId] as const,
};

export function useOwnerPayouts(ownerId: string) {
  return useQuery({
    queryKey: payoutQueryKeys.byOwner(ownerId),
    queryFn: () => payoutsService.getByOwner(ownerId),
    enabled: !!ownerId,
  });
}

export function useBookingPayout(bookingId: string) {
  return useQuery({
    queryKey: payoutQueryKeys.byBooking(bookingId),
    queryFn: () => payoutsService.getByBooking(bookingId),
    enabled: !!bookingId,
  });
}

export function useOwnerPayoutSummary(ownerId: string) {
  return useQuery({
    queryKey: payoutQueryKeys.summary(ownerId),
    queryFn: () => payoutsService.getSummary(ownerId),
    enabled: !!ownerId,
  });
}

export function useCreatePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOwnerPayoutRequest) => payoutsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutQueryKeys.all });
    },
  });
}

export function useSchedulePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: SetOwnerPayoutScheduledRequest;
    }) => payoutsService.schedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutQueryKeys.all });
    },
  });
}

export function useMarkPayoutPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: MarkOwnerPayoutPaidRequest;
    }) => payoutsService.markPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutQueryKeys.all });
    },
  });
}

export function useCancelPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CancelOwnerPayoutRequest;
    }) => payoutsService.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutQueryKeys.all });
    },
  });
}
