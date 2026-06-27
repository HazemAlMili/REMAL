// ═══════════════════════════════════════════════════════════
// lib/utils/return-url.ts
// Cross-origin post-login redirect allowlist.
//
// The public storefront (port 3000) hands login off to this platform with
// `?returnUrl=http://localhost:3000/...`. After a successful client login we
// send the user back there — but ONLY to an allowlisted origin, so the param
// can never be abused as an open redirect.
// ═══════════════════════════════════════════════════════════

const ALLOWED_RETURN_ORIGINS = (
  process.env.NEXT_PUBLIC_ALLOWED_RETURN_ORIGINS ?? "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

/** True only for absolute URLs whose origin is explicitly allowlisted. */
export function isAllowedReturnUrl(
  url: string | null | undefined
): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}`;
    return ALLOWED_RETURN_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}

/** Read a validated returnUrl from the current browser URL, or null. */
export function getReturnUrlFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("returnUrl");
  return isAllowedReturnUrl(value) ? value : null;
}
