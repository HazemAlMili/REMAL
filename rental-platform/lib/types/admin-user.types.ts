import type { AdminRole } from "./auth.types";
import type { PaginationMeta } from "./common.types";

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListFilters {
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAdminUsers {
  items: AdminUserResponse[];
  pagination: PaginationMeta;
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

export interface UpdateAdminUserRoleRequest {
  role: AdminRole;
}

export interface UpdateAdminUserStatusRequest {
  isActive: boolean;
}
