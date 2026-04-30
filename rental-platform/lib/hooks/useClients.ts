import { useQuery } from "@tanstack/react-query";
import { clientsService } from "@/lib/api/services/clients.service";
import { queryKeys } from "@/lib/utils/query-keys";
import type { ClientListFilters } from "@/lib/types";

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
