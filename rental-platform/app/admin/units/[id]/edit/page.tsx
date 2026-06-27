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
          Back to units
        </Button>
        <EmptyState
          title="Unit not found"
          description="This unit may have been removed, or the link may use an incorrect ID."
          action={
            <Button onClick={() => router.push(ROUTES.admin.units.list)}>
              Back to units
            </Button>
          }
        />
      </div>
    );
  }

  const defaultValues: Partial<UnitFormValues> = {
    ownerId: unit.ownerId,
    projectId: unit.projectId,
    name: unit.name,
    unitType: unit.unitType,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    maxGuests: unit.maxGuests,
    basePricePerNight: unit.basePricePerNight,
    isActive: unit.isActive,
    isVisibleInPortfolio: unit.isVisibleInPortfolio,
    address: unit.address ?? undefined,
    description: unit.description ?? undefined,
  };

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      await updateUnit({ id, data: values });
      toastSuccess("Unit updated");
      router.push(ROUTES.admin.units.detail(id));
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Could not update unit");
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
          Back to unit
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Edit unit
          </h1>
          <p className="text-sm text-neutral-500">
            Update core details for{" "}
            <span className="font-medium text-neutral-700">{unit.name}</span>.
            Owner and project assignment cannot be changed here.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <UnitForm
          mode="edit"
          isOwnerProjectEditable={false}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          ownerDisplayName={unit.ownerId}
          projectDisplayName={unit.projectId}
        />
      </div>
    </div>
  );
}
