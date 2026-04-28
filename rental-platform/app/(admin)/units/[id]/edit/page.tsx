"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useInternalUnitDetail, useUpdateUnit } from "@/lib/hooks/useUnits";
import { UnitForm, UnitFormValues } from "@/components/admin/units/UnitForm";
import { ROUTES } from "@/lib/constants/routes";

interface EditUnitPageProps {
  params: { id: string };
}

export default function EditUnitPage({ params }: EditUnitPageProps) {
  const { id } = params;
  const router = useRouter();
  const { canManageUnits } = usePermissions();

  const { data: unit, isLoading, isError } = useInternalUnitDetail(id);
  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit();

  React.useEffect(() => {
    if (!canManageUnits) {
      toastError("You do not have permission to manage units.");
      router.replace(ROUTES.admin.units.detail(id));
    }
  }, [canManageUnits, router, id]);

  if (!canManageUnits) return null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <SkeletonTable rows={6} columns={2} />
        </div>
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 pb-12">
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
          title="Unit not found"
          description="This unit could not be loaded for editing."
          action={
            <Button onClick={() => router.push(ROUTES.admin.units.list)}>
              Back to Units
            </Button>
          }
        />
      </div>
    );
  }

  const defaultValues: Partial<UnitFormValues> = {
    ownerId: unit.ownerId,
    areaId: unit.areaId,
    name: unit.name,
    unitType: unit.unitType,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    maxGuests: unit.maxGuests,
    basePricePerNight: unit.basePricePerNight,
    isActive: unit.isActive,
    address: unit.address ?? undefined,
    description: unit.description ?? undefined,
  };

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      await updateUnit({ id, data: values });
      toastSuccess("Unit updated successfully");
      router.push(ROUTES.admin.units.detail(id));
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to update unit");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 w-fit text-neutral-500 hover:text-neutral-900"
          onClick={() => router.push(ROUTES.admin.units.detail(id))}
          disabled={isUpdating}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Unit
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Edit Unit
          </h1>
          <p className="text-sm text-neutral-500">
            Update the core details for{" "}
            <span className="font-medium text-neutral-700">{unit.name}</span>.
            Owner and area assignment cannot be changed here.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <UnitForm
          mode="edit"
          isOwnerAreaEditable={false}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          ownerDisplayName={unit.ownerId}
          areaDisplayName={unit.areaId}
        />
      </div>
    </div>
  );
}
