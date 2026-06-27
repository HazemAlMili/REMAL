"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { platformAuthUrl } from "@/lib/auth/platform";

/**
 * Redirect stub — registration happens on the Kaza platform. We carry a
 * returnUrl so the new client is sent back to the storefront once signed up.
 */
export default function ClientRegisterRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnTo =
      params.get("returnTo") ||
      (document.referrer && document.referrer.startsWith(window.location.origin)
        ? document.referrer
        : window.location.origin);
    window.location.replace(platformAuthUrl("register", returnTo));
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="font-bold">جارٍ تحويلك إلى إنشاء الحساب…</span>
    </div>
  );
}
