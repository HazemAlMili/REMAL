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
        <h1 className="text-2xl font-bold text-neutral-800">CRM Pipeline</h1>
        {canManageCRM && (
          <Button onClick={() => setIsModalOpen(true)}>New Lead</Button>
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
