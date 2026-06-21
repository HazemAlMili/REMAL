import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { securityService } from "@/lib/api/services/security.service";
import { queryKeys } from "@/lib/utils/query-keys";
import type {
  SaveRoleTemplateRequest,
  UpdateUserOverridesRequest,
} from "@/lib/types/rbac.types";

export function usePermissionRegistry() {
  return useQuery({
    queryKey: queryKeys.security.permissions(),
    queryFn: securityService.getPermissions,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRoleTemplates() {
  return useQuery({
    queryKey: queryKeys.security.roles(),
    queryFn: securityService.getRoles,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: securityService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.roles() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: SaveRoleTemplateRequest }) =>
      securityService.updateRole(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.roles() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: securityService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.roles() });
    },
  });
}

export function useUserOverrides(adminUserId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.security.userOverrides(adminUserId),
    queryFn: () => securityService.getUserOverrides(adminUserId),
    enabled: enabled && Boolean(adminUserId),
  });
}

export function useUpdateUserOverrides() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      adminUserId,
      request,
    }: {
      adminUserId: string;
      request: UpdateUserOverridesRequest;
    }) => securityService.updateUserOverrides(adminUserId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.security.userOverrides(variables.adminUserId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}
