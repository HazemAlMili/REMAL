import { useQuery } from "@tanstack/react-query";
import { adminUsersService } from "@/lib/api/services";
import { queryKeys } from "@/lib/utils/query-keys";

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers.list(),
    queryFn: () => adminUsersService.getAdminUsers(),
  });
}
