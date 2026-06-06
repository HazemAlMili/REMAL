"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

/**
 * Default minimum time the splash stays up so the handoff is actually seen.
 * Sized to comfortably outlast the global page-transition fade in
 * `app/template.tsx` (~400ms), leaving a clear, fully-opaque window.
 */
export const PORTAL_SPLASH_MIN_MS = 1100;

/**
 * Holds the loading handoff visible for a minimum duration after a shell
 * mounts. After sign-in the access token is already in memory, so auth
 * resolves within a frame and the splash would never paint; this gate gives
 * it a deliberate, seen entrance. It only runs on shell mount (login / cold
 * load), never on in-app navigation, so it adds no friction to the task.
 *
 * Returns `true` once the minimum has elapsed AND the surface is ready.
 */
export function usePortalReady(isReady: boolean, ms = PORTAL_SPLASH_MIN_MS) {
  const [minElapsed, setMinElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return isReady && minElapsed;
}

interface PortalSplashProps {
  /** Reassuring status line, e.g. "Loading your dashboard". */
  label?: string;
  /** Optional scope/utility classes (e.g. "portal-admin" for the cool token ramp). */
  className?: string;
}

/**
 * PortalSplash — the branded loading handoff shown after sign-in while a
 * portal authenticates (refresh token) and bootstraps the user's workspace.
 *
 * Shared by the Admin, Owner, and Client shells so the moment reads the same
 * everywhere and carries the sign-in lockup straight into the app. Motion is
 * state-conveying (an indeterminate sweep + a calm breathing mark); under
 * `prefers-reduced-motion` it resolves to a static, readable state via
 * globals.css.
 *
 * Rendered through a portal to `document.body` once mounted, so it sits above
 * the app and escapes the global page-transition wrapper in `app/template.tsx`
 * (a framer-motion `opacity:0 → 1` fade). As a DOM descendant it would inherit
 * that wrapper's opacity and stay invisible during the load; the portal lifts
 * it out so the handoff is reliably seen.
 */
export function PortalSplash({
  label = "Loading your workspace",
  className,
}: PortalSplashProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const overlay = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-neutral-50",
        className
      )}
    >
      <div className="portal-splash flex flex-col items-center gap-5">
        {/* Brand lockup — continuity from the sign-in screen */}
        <div className="flex items-center gap-2.5" aria-hidden="true">
          <div className="portal-splash-mark grid h-11 w-11 place-items-center rounded-xl bg-primary-500 text-xl font-bold tracking-tight text-white">
            R
          </div>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Remal
          </span>
        </div>

        {/* Indeterminate progress */}
        <div
          className="h-[3px] w-44 overflow-hidden rounded-full bg-neutral-200"
          aria-hidden="true"
        >
          <div className="portal-splash-bar h-full w-2/5 rounded-full bg-primary-500" />
        </div>

        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  );

  // Before mount (SSR / first client paint) render inline; once mounted, portal
  // to <body> so the template's fading wrapper can't hide it.
  if (!mounted) return overlay;
  return createPortal(overlay, document.body);
}
