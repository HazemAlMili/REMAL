import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  PermissionGroup,
  RoleTemplate,
  SaveRoleTemplateRequest,
  UpdateUserOverridesRequest,
  UserOverrides,
} from "@/lib/types/rbac.types";

export const securityService = {
  getPermissions: (): Promise<PermissionGroup[]> =>
    api.get(endpoints.security.permissions),

  getRoles: (): Promise<RoleTemplate[]> => api.get(endpoints.security.roles),

  createRole: (request: SaveRoleTemplateRequest): Promise<RoleTemplate> =>
    api.post(endpoints.security.roles, request),

  updateRole: (
    id: string,
    request: SaveRoleTemplateRequest
  ): Promise<RoleTemplate> => api.put(endpoints.security.role(id), request),

  deleteRole: (id: string): Promise<void> =>
    api.delete(endpoints.security.role(id)),

  getUserOverrides: (id: string): Promise<UserOverrides> =>
    api.get(endpoints.security.userOverrides(id)),

  updateUserOverrides: (
    id: string,
    request: UpdateUserOverridesRequest
  ): Promise<UserOverrides> =>
    api.put(endpoints.security.userOverrides(id), request),
};
