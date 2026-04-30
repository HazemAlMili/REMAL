"use client";

import { useUIStore } from "@/lib/stores/ui.store";
import { OwnerNav } from "./OwnerNav";

export function OwnerSidebar() {
  const { isSidebarOpen } = useUIStore();

  const collapsed = !isSidebarOpen;

  return (
    <aside
      className={[
        "hidden border-r border-neutral-200 bg-white transition-all duration-200 lg:flex lg:flex-col",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      <div className="flex h-16 items-center border-b border-neutral-200 px-4">
        <div className="text-sm font-semibold text-neutral-900">
          {collapsed ? "O" : "Owner Portal"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <OwnerNav collapsed={collapsed} />
      </div>

      <div className="border-t border-neutral-200 p-4">
        <p className="text-xs text-neutral-500">
          {collapsed ? "View-only" : "View-only access to your portfolio"}
        </p>
      </div>
    </aside>
  );
}
