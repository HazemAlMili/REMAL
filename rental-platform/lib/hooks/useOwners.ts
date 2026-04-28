import { useQuery } from "@tanstack/react-query";
import { ownersService } from "../api/services/owners.service";
import { queryKeys } from "./query-keys";
import { OwnerListFilters } from "@/lib/types";

export function useOwnersList(filters?: OwnerListFilters) {
  return useQuery({
    queryKey: queryKeys.owners.list(filters),
    queryFn: () => ownersService.getAll(filters),
  });
}
