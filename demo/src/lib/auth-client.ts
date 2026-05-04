import { AUTH_ROLE_COOKIE, type DemoRole } from '@/lib/auth';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function setDemoRoleCookie(role: DemoRole) {
  document.cookie = `${AUTH_ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function clearDemoRoleCookie() {
  document.cookie = `${AUTH_ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
