// ═══════════════════════════════════════════════════════════
// components/public/layout/NotificationBell.tsx
// Bell icon + unread count + dropdown in PublicNav
// Only shown when subjectType === 'Client'
// ═══════════════════════════════════════════════════════════

"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const { subjectType } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Only show bell for clients
  if (subjectType !== "Client") return null;

  // ⚠️ BACKEND GAP: Summary endpoint not documented yet.
  // When available: const { data: summary } = useClientNotificationSummary()
  const unreadCount = 0; // Placeholder until endpoint is available

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative rounded-lg p-2 transition-colors hover:bg-neutral-100"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5 text-neutral-600" />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 p-4">
            <h3 className="font-display text-sm font-semibold text-neutral-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  // Mark all as read (when endpoint available)
                  // markAllReadMutation.mutate(notificationIds)
                }}
                className="text-xs text-primary-500 hover:text-primary-600"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {/* ⚠️ BACKEND GAP: No client notifications endpoint.
                    Show placeholder until endpoint is documented. */}
            <div className="p-6 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-500">
                {unreadCount === 0
                  ? "No new notifications"
                  : `${unreadCount} unread notifications`}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 p-3">
            <Link
              href="/account/notifications"
              className="block text-center text-sm text-primary-500 hover:text-primary-600"
              onClick={() => setIsDropdownOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
