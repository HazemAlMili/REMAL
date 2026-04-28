import type { AdminRole } from "./auth.types";

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
}
