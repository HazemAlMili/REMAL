/**
 * Cookie name constants — shared between middleware (Edge) and client code.
 * The refresh token cookie is set by the backend as HttpOnly; the frontend
 * only checks for its *presence* (middleware) or relies on `withCredentials`
 * to send it automatically (Axios).
 *
 * If the backend changes the cookie name, update it here in one place.
 */
export const COOKIE_NAMES = {
  refreshToken: 'refresh_token',
} as const
