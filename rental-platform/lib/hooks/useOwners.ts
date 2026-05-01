import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownersService } from "../api/services/owners.service";
import { queryKeys } from "./query-keys";
import {
  OwnerListFilters,
  UpdateOwnerRequest,
  OwnerStatus,
} from "@/lib/types/owner.types";

export function useOwners(filters?: OwnerListFilters) {
  return useQuery({
    queryKey: queryKeys.owners.list(filters),
    queryFn: () => ownersService.getAll(filters),
  });
}

export function useOwner(id: string) {
  return useQuery({
    queryKey: queryKeys.owners.detail(id),
    queryFn: () => ownersService.getById(id),
    enabled: !!id,
  });
}

export function useOwnerFinancialSummary(id: string) {
  return useQuery({
    queryKey: queryKeys.owners.payoutSummary(id),
    queryFn: () => ownersService.getOwnerPayoutSummary(id),
    enabled: !!id,
  });
}

export function useCreateOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ownersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
    },
  });
}

export function useUpdateOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOwnerRequest }) =>
      ownersService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.owners.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
    },
  });
}

export function useUpdateOwnerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OwnerStatus }) =>
      ownersService.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.owners.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
    },
  });
}
