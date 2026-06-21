export interface PermissionDescriptor {
  key: string;
  module: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  module: string;
  permissions: PermissionDescriptor[];
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: string[];
  assignedUserCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserOverrides {
  adminUserId: string;
  effective: string[];
  inherited: string[];
  grants: string[];
  denies: string[];
}

export interface SaveRoleTemplateRequest {
  name: string;
  description?: string | null;
  permissionKeys: string[];
}

export interface UpdateUserOverridesRequest {
  grants: string[];
  denies: string[];
}
