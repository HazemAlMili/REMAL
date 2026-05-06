import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsService } from "@/lib/api/services/clients.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { toastSuccess } from "@/lib/utils/toast";
import type { ClientListFilters, UpdateClientStatusRequest } from "@/lib/types";

export function useClients(filters?: ClientListFilters) {
  return useQuery({
    queryKey: queryKeys.clients.list(filters),
    queryFn: () => clientsService.getAll(filters),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => clientsService.getById(id),
    enabled: !!id,
  });
}

// Alias for backward compatibility
export function useClientDetail(id: string) {
  return useClient(id);
}

export function useUpdateClientStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientStatusRequest) =>
      clientsService.updateStatus(id, data),
    onSuccess: (client) => {
      toastSuccess(client.isActive ? "Client reactivated" : "Client deactivated");
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.detail(id),
      });
    },
  });
}
