"use client";

import * as React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import {
  useUnitSeasonalPricing,
  useCreateSeasonalPricing,
  useUpdateSeasonalPricing,
  useDeleteSeasonalPricing,
} from "@/lib/hooks/useUnits";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { formatCurrency, formatDateRange } from "@/lib/utils/format";
import {
  SeasonalPricingForm,
  SeasonalPricingFormValues,
} from "../SeasonalPricingForm";
import type { SeasonalPricingResponse } from "@/lib/types";

export interface UnitSeasonalPricingTabProps {
  unitId: string;
  basePricePerNight: number;
}

export function UnitSeasonalPricingTab({
  unitId,
  basePricePerNight,
}: UnitSeasonalPricingTabProps) {
  const { data: pricingRules = [], isLoading } = useUnitSeasonalPricing(unitId);
  const { mutateAsync: createPricing, isPending: isCreating } =
    useCreateSeasonalPricing();
  const { mutateAsync: updatePricing, isPending: isUpdating } =
    useUpdateSeasonalPricing();
  const { mutateAsync: deletePricing, isPending: isDeleting } =
    useDeleteSeasonalPricing();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPricing, setEditingPricing] = React.useState<
    SeasonalPricingResponse | undefined
  >();
  const [deletingPricingId, setDeletingPricingId] = React.useState<
    string | undefined
  >();

  const isFormLoading = isCreating || isUpdating;

  const handleOpenCreate = () => {
    setEditingPricing(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pricing: SeasonalPricingResponse) => {
    setEditingPricing(pricing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isFormLoading) return;
    setIsModalOpen(false);
    setEditingPricing(undefined);
  };

  const handleFormSubmit = async (values: SeasonalPricingFormValues) => {
    try {
      if (editingPricing) {
        await updatePricing({
          id: editingPricing.id,
          unitId,
          data: {
            startDate: values.startDate,
            endDate: values.endDate,
            pricePerNight: values.pricePerNight,
          },
        });
        toastSuccess("Seasonal pricing updated successfully");
      } else {
        await createPricing({
          unitId,
          data: {
            startDate: values.startDate,
            endDate: values.endDate,
            pricePerNight: values.pricePerNight,
          },
        });
        toastSuccess("Seasonal pricing created successfully");
      }
      handleCloseModal();
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to save seasonal pricing");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPricingId) return;
    try {
      await deletePricing({ id: deletingPricingId, unitId });
      toastSuccess("Seasonal pricing deleted successfully");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to delete seasonal pricing");
    } finally {
      setDeletingPricingId(undefined);
    }
  };

  const columns = React.useMemo<ColumnDef<SeasonalPricingResponse>[]>(
    () => [
      {
        id: "dateRange",
        header: "Date Range",
        cell: ({ row }) =>
          formatDateRange(row.original.startDate, row.original.endDate),
      },
      {
        accessorKey: "pricePerNight",
        header: "Price / Night",
        cell: ({ row }) => (
          <span className="font-medium text-neutral-800">
            {formatCurrency(row.original.pricePerNight)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(row.original)}
              disabled={isDeleting}
            >
              <Edit2 className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeletingPricingId(row.original.id)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [isDeleting]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">
            Seasonal Pricing
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Base Unit Price:{" "}
            <strong className="text-neutral-700">
              {formatCurrency(basePricePerNight)}/night
            </strong>
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Seasonal Pricing
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pricingRules}
        isLoading={isLoading}
        emptyMessage="No seasonal pricing rules yet. Click above to add overrides."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingPricing ? "Edit Seasonal Pricing" : "Add Seasonal Pricing"
        }
      >
        <SeasonalPricingForm
          defaultValues={editingPricing}
          onSubmit={handleFormSubmit}
          isLoading={isFormLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPricingId}
        title="Delete Seasonal Pricing"
        description="Are you sure you want to delete this seasonal pricing rule? Dates within this range will revert to the base price."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPricingId(undefined)}
      />
    </div>
  );
}
