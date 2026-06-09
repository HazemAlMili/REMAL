"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/Button";
import { PipelineColumnSkeleton } from "@/components/admin/crm/PipelineColumnSkeleton";
import { CreateLeadModal } from "@/components/admin/crm/CreateLeadModal";

const PipelineBoard = dynamic(
  () => import("@/components/admin/crm/PipelineBoard"),
  {
    loading: () => (
      <div className="flex h-full flex-row gap-4 overflow-x-auto pb-4">
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
        <PipelineColumnSkeleton />
      </div>
    ),
  }
);

export default function CrmPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { canViewCRM, canManageCRM } = usePermissions();

  if (!canViewCRM) {
    redirect(ROUTES.admin.dashboard);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Leads pipeline
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Move client enquiries through sales stages and capture the next
            action for each lead.
          </p>
        </div>
        {canManageCRM && (
          <Button onClick={() => setIsModalOpen(true)}>Create lead</Button>
        )}
      </div>

      <PipelineBoard />

      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
