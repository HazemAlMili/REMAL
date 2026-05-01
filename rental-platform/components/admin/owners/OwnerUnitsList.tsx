"use client";

import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function OwnerUnitsList() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-700">Units</h3>
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-neutral-400" />}
        title="Backend Gap"
        description="The owner details endpoint does not currently include an embedded units list. This section will be populated once the backend API is updated."
      />
    </div>
  );
}
