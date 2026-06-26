"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useProjectsList } from "@/lib/hooks/useProjects";
import { useOwners } from "@/lib/hooks/useOwners";
import { useCreateUnit } from "@/lib/hooks/useUnits";
import { ProjectResponse, OwnerListItemResponse } from "@/lib/types";

import { UnitForm, UnitFormValues } from "@/components/admin/units/UnitForm";
import { ROUTES } from "@/lib/constants/routes";

export default function CreateUnitPage() {
  const router = useRouter();
  const { canManageUnits } = usePermissions();

  const { data: projectsData, isLoading: isProjectsLoading } =
    useProjectsList(false); // only active projects
  const { data: ownersData, isLoading: isOwnersLoading } = useOwners({
    page: 1,
    pageSize: 100, // Just sufficient to populate a usable dropdown based on business logic constraints
  });
  const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnit();

  // Redirect instantly if not allowed to be here to prevent API calls leaking
  React.useEffect(() => {
    if (!canManageUnits) {
      toastError("You do not have permission to manage units.");
      router.replace(ROUTES.admin.units.list);
    }
  }, [canManageUnits, router]);

  // Format select options
  const ownerOptions = React.useMemo(() => {
    return (ownersData?.items || []).map((owner: OwnerListItemResponse) => ({
      label: owner.name,
      value: owner.id,
    }));
  }, [ownersData]);

  const projectOptions = React.useMemo(() => {
    return (projectsData || []).map((project: ProjectResponse) => ({
      label: project.name,
      value: project.id,
    }));
  }, [projectsData]);

  if (!canManageUnits) return null;

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      const result = await createUnit({
        ...values,
        // The numbers from Zod are confirmed safe, just passing along to the service layer.
      });
      toastSuccess("Unit created");
      router.push(ROUTES.admin.units.detail(result.id));
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Could not create unit");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 w-fit text-neutral-500 hover:text-neutral-900"
          onClick={() => router.push(ROUTES.admin.units.list)}
          disabled={isCreating}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to units
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Create unit
          </h1>
          <p className="text-sm text-neutral-500">
            Add the core unit details first. Images, amenities, pricing, and
            availability can be added after creation.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <UnitForm
          onSubmit={handleSubmit}
          isLoading={isCreating}
          mode="create"
          isOwnerProjectEditable={true}
          owners={ownerOptions}
          projects={projectOptions}
          isOwnersLoading={isOwnersLoading}
          isProjectsLoading={isProjectsLoading}
        />
      </div>
    </div>
  );
}
