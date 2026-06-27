"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { platformAuthUrl } from "@/lib/auth/platform";

/**
 * The storefront no longer owns client auth. This page is a thin redirect that
 * hands the visitor off to the Kaza platform login, carrying a returnUrl so the
 * platform can send them back here after a successful sign-in.
 */
export default function ClientLoginRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnTo =
      params.get("returnTo") ||
      (document.referrer && document.referrer.startsWith(window.location.origin)
        ? document.referrer
        : window.location.origin);
    window.location.replace(platformAuthUrl("login", returnTo));
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="font-bold">جارٍ تحويلك إلى تسجيل الدخول…</span>
    </div>
  );
}
