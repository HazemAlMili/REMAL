import { useQuery } from "@tanstack/react-query";
import { clientsService } from "@/lib/api/services/clients.service";
import { queryKeys } from "@/lib/utils/query-keys";

export function useClientDetail(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: () => clientsService.getById(clientId),
    enabled: !!clientId,
  });
}
