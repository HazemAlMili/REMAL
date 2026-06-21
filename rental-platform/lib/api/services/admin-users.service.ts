import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AdminUserResponse,
  AdminUserListFilters,
  PaginatedAdminUsers,
  CreateAdminUserRequest,
  AdminDirectoryUser,
} from "@/lib/types";

export const adminUsersService = {
  getDirectory: (): Promise<AdminDirectoryUser[]> =>
    api.get(endpoints.adminDirectory),

  getAll: (filters?: AdminUserListFilters): Promise<PaginatedAdminUsers> =>
    api.get(endpoints.adminUsers.list, { params: filters }),

  create: (data: CreateAdminUserRequest): Promise<AdminUserResponse> =>
    api.post(endpoints.adminUsers.create, data),

  changeRole: (id: string, roleTemplateId: string): Promise<AdminUserResponse> =>
    api.patch(endpoints.adminUsers.role(id), { roleTemplateId }),

  toggleStatus: (id: string, isActive: boolean): Promise<AdminUserResponse> =>
    api.patch(endpoints.adminUsers.status(id), { isActive }),
};
