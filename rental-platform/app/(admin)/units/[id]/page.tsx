"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import {
  useInternalUnitDetail,
  useUpdateUnitStatus,
} from "@/lib/hooks/useUnits";
import { UnitDetailHeader } from "@/components/admin/units/UnitDetailHeader";
import {
  UnitDetailTabs,
  UnitTab,
} from "@/components/admin/units/UnitDetailTabs";
import { ROUTES } from "@/lib/constants/routes";

interface UnitDetailPageProps {
  params: { id: string };
}

export default function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { id } = params;
  const router = useRouter();

  const { data: unit, isLoading, isError } = useInternalUnitDetail(id);
  const { mutateAsync: updateStatus, isPending: isStatusPending } =
    useUpdateUnitStatus();

  const [activeTab, setActiveTab] = React.useState<UnitTab>("overview");
  const [statusConfirmOpen, setStatusConfirmOpen] = React.useState(false);

  const handleConfirmStatusChange = async () => {
    if (!unit) return;
    try {
      await updateStatus({ id, isActive: !unit.isActive });
      toastSuccess(
        unit.isActive
          ? "Unit deactivated successfully"
          : "Unit activated successfully"
      );
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to update unit status");
    } finally {
      setStatusConfirmOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-neutral-100" />
        </div>
        {/* Tab skeleton */}
        <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-100" />
        {/* Content skeleton */}
        <SkeletonTable rows={5} columns={3} />
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 w-fit text-neutral-500"
          onClick={() => router.push(ROUTES.admin.units.list)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Units
        </Button>
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-red-400" />}
          title="Unit not found"
          description="The unit you are looking for does not exist or has been removed."
          action={
            <Button onClick={() => router.push(ROUTES.admin.units.list)}>
              Back to Units
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 w-fit text-neutral-500 hover:text-neutral-900"
        onClick={() => router.push(ROUTES.admin.units.list)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Units
      </Button>

      {/* Header */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <UnitDetailHeader
          unit={unit}
          onEdit={() => router.push(ROUTES.admin.units.edit(id))}
          onChangeStatus={() => setStatusConfirmOpen(true)}
          isLoading={isStatusPending}
        />
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <UnitDetailTabs
          unitId={id}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unit={unit}
        />
      </div>

      {/* Status change confirmation */}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        title={unit.isActive ? "Deactivate Unit" : "Activate Unit"}
        description={`Are you sure you want to ${
          unit.isActive ? "deactivate" : "activate"
        } "${unit.name}"? ${
          unit.isActive
            ? "The unit will no longer be visible to guests."
            : "The unit will become visible to guests."
        }`}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusConfirmOpen(false)}
      />
    </div>
  );
}
