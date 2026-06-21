import type { AdminRole } from "./auth.types";
import type { PaginationMeta } from "./common.types";

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: AdminRole | null;
  roleTemplateId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListFilters {
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AdminDirectoryUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  isActive: boolean;
}

export interface PaginatedAdminUsers {
  items: AdminUserResponse[];
  pagination: PaginationMeta;
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password: string;
  roleTemplateId: string;
}

export interface UpdateAdminUserRoleRequest {
  roleTemplateId: string;
}

export interface UpdateAdminUserStatusRequest {
  isActive: boolean;
}
