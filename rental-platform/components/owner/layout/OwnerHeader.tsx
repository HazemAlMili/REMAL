"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useUIStore } from "@/lib/stores/ui.store";
import { OwnerNotificationBell } from "./OwnerNotificationBell";

export function OwnerHeader() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearAuth();
      router.replace("/auth/owner/login");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900">Owner Portal</p>
          <p className="truncate text-xs text-neutral-500">
            {user?.identifier ?? "Owner"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <OwnerNotificationBell />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
