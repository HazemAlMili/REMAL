import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/lib/api/services/payments.service";
import { queryKeys } from "@/lib/utils/query-keys";
import type { PaymentListFilters } from "@/lib/types/finance.types";
import type {
  MarkPaymentFailedRequest,
  CancelPaymentRequest,
} from "@/lib/types/booking.types";

export function usePaymentsList(filters?: PaymentListFilters) {
  return useQuery({
    queryKey: queryKeys.payments.list(filters),
    queryFn: () => paymentsService.getAll(filters),
  });
}

export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentsService.getById(id),
    enabled: !!id,
  });
}

export function useMarkPaymentPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsService.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useMarkPaymentFailed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: MarkPaymentFailedRequest;
    }) => paymentsService.markFailed(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CancelPaymentRequest;
    }) => paymentsService.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
