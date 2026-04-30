"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useOwnerNotificationSummary } from "@/lib/hooks/useNotifications";
import { ROUTES } from "@/lib/constants/routes";

export function OwnerNotificationBell() {
  const router = useRouter();
  const { data, isLoading } = useOwnerNotificationSummary();

  const unreadCount = data?.unreadCount ?? 0;
  const showBadge = !isLoading && unreadCount > 0;
  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount);

  const handleClick = () => {
    router.push(ROUTES.owner.notifications);
  };

  return (
    <button
      onClick={handleClick}
      className="relative rounded-lg p-2 transition-colors hover:bg-neutral-100"
      aria-label={`Notifications${showBadge ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="h-5 w-5 text-neutral-600" />

      {showBadge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badgeText}
        </span>
      )}
    </button>
  );
}
