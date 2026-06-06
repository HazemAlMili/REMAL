"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useAdminNotificationSummary } from "@/lib/hooks/useNotifications";
import { ROUTES } from "@/lib/constants/routes";

export function NotificationBell() {
  const router = useRouter();
  const { data, isLoading } = useAdminNotificationSummary();
  const prevUnreadCount = useRef<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const unreadCount = data?.unreadCount ?? 0;
  const showBadge = !isLoading && unreadCount > 0;
  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount);

  // Detect count increase → trigger pulse animation
  useEffect(() => {
    // First load - initialize
    if (prevUnreadCount.current === null) {
      prevUnreadCount.current = unreadCount;
      return undefined;
    }

    // Count increased - trigger pulse
    if (unreadCount > prevUnreadCount.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      prevUnreadCount.current = unreadCount;
      return () => clearTimeout(timer);
    }

    // Count stayed same or decreased - just update
    prevUnreadCount.current = unreadCount;
    return undefined;
  }, [unreadCount]);

  const handleClick = () => {
    router.push(ROUTES.admin.notifications);
  };

  return (
    <button
      onClick={handleClick}
      className="relative grid h-9 w-9 place-items-center rounded-[4px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      aria-label={`Notifications${showBadge ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="h-5 w-5" />

      {showBadge && (
        <span
          className={`
            absolute -end-0.5 -top-0.5
            flex h-[18px] min-w-[18px] items-center justify-center
            rounded-full bg-error px-1
            text-[10px] font-bold tabular-nums text-white
            ${isPulsing ? "animate-pulse" : ""}
          `}
        >
          {badgeText}
        </span>
      )}
    </button>
  );
}
