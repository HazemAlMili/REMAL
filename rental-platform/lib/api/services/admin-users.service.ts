import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { AdminUserResponse } from "@/lib/types";

export const adminUsersService = {
  getAdminUsers: (): Promise<AdminUserResponse[]> =>
    api.get(endpoints.adminUsers.list),
};
