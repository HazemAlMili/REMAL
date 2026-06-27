/**
 * The storefront does not own authentication — it hands login/registration off
 * to the Kaza platform (rental-platform), which issues the session cookie. After
 * a successful login the platform redirects back to `returnTo` on the storefront,
 * where AuthProvider bootstraps the session from the refresh cookie.
 */
const PLATFORM_URL = (process.env.NEXT_PUBLIC_PLATFORM_URL ?? "").replace(
  /\/+$/,
  ""
);

export function platformAuthUrl(
  kind: "login" | "register",
  returnTo?: string
): string {
  const base = `${PLATFORM_URL}/auth/client/${kind}`;
  const target =
    returnTo ??
    (typeof window !== "undefined" ? window.location.href : "");
  if (!target) return base;
  return `${base}?returnUrl=${encodeURIComponent(target)}`;
}
