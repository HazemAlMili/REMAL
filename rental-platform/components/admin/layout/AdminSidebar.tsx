"use client";

import { useUIStore } from "@/lib/stores/ui.store";
import { AdminNav } from "./AdminNav";
import { cn } from "@/lib/utils/cn";

export function AdminSidebar() {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ease-in-out",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-neutral-200 px-4",
          isSidebarOpen ? "justify-start" : "justify-center"
        )}
      >
        {isSidebarOpen ? (
          <div className="flex w-full items-center justify-between">
            <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
              Remal
            </span>
          </div>
        ) : (
          <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
            R
          </span>
        )}
      </div>

      <AdminNav isCollapsed={!isSidebarOpen} />
    </aside>
  );
}
