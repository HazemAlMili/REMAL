import { ROUTES } from '@/lib/constants/routes';

export type DemoRole = 'admin' | 'owner' | 'client';

export const AUTH_ROLE_COOKIE = 'kaza_booking_role';

export const ROLE_HOME_ROUTES: Record<DemoRole, string> = {
  admin: ROUTES.adminDashboard,
  owner: ROUTES.ownerDashboard,
  client: ROUTES.home,
};

export const ROLE_LOGIN_ROUTES: Record<DemoRole, string> = {
  admin: ROUTES.authAdminLogin,
  owner: ROUTES.authOwnerLogin,
  client: ROUTES.authClientLogin,
};

export function isDemoRole(value: string | undefined): value is DemoRole {
  return value === 'admin' || value === 'owner' || value === 'client';
}
