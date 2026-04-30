import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersService } from "@/lib/api/services/admin-users.service";
import { queryKeys } from "@/lib/utils/query-keys";
import type { AdminUserListFilters, AdminRole } from "@/lib/types";

export function useAdminUsers(filters?: AdminUserListFilters) {
  return useQuery({
    queryKey: queryKeys.adminUsers.list(filters),
    queryFn: () => adminUsersService.getAll(filters),
  });
}

export function useChangeAdminRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminRole }) =>
      adminUsersService.changeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useToggleAdminStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUsersService.toggleStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}
