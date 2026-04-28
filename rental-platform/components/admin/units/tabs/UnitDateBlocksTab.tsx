"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import {
  useUnitDateBlocks,
  useCreateDateBlock,
  useUpdateDateBlock,
  useDeleteDateBlock,
} from "@/lib/hooks/useUnits";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { DATE_BLOCK_REASON_LABELS } from "@/lib/constants/date-block-reasons";
import { DateBlockForm, DateBlockFormValues } from "../DateBlockForm";
import type { DateBlockResponse } from "@/lib/types";

export interface UnitDateBlocksTabProps {
  unitId: string;
}

function formatDate(isoString: string) {
  try {
    return format(new Date(isoString), "MMM d, yyyy");
  } catch {
    return isoString;
  }
}

export function UnitDateBlocksTab({ unitId }: UnitDateBlocksTabProps) {
  const { data: blocks = [], isLoading } = useUnitDateBlocks(unitId);
  const { mutateAsync: createBlock, isPending: isCreating } =
    useCreateDateBlock();
  const { mutateAsync: updateBlock, isPending: isUpdating } =
    useUpdateDateBlock();
  const { mutateAsync: deleteBlock, isPending: isDeleting } =
    useDeleteDateBlock();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBlock, setEditingBlock] = React.useState<
    DateBlockResponse | undefined
  >();
  const [deletingBlockId, setDeletingBlockId] = React.useState<
    string | undefined
  >();

  const isFormLoading = isCreating || isUpdating;

  const handleOpenCreate = () => {
    setEditingBlock(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (block: DateBlockResponse) => {
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isFormLoading) return;
    setIsModalOpen(false);
    setEditingBlock(undefined);
  };

  const handleFormSubmit = async (values: DateBlockFormValues) => {
    try {
      if (editingBlock) {
        await updateBlock({
          id: editingBlock.id,
          unitId,
          data: {
            startDate: values.startDate,
            endDate: values.endDate,
            reason: values.reason,
            notes: values.notes || undefined,
          },
        });
        toastSuccess("Date block updated successfully");
      } else {
        await createBlock({
          unitId,
          data: {
            startDate: values.startDate,
            endDate: values.endDate,
            reason: values.reason,
            notes: values.notes || undefined,
          },
        });
        toastSuccess("Date block created successfully");
      }
      handleCloseModal();
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to save date block");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBlockId) return;
    try {
      await deleteBlock({ id: deletingBlockId, unitId });
      toastSuccess("Date block deleted successfully");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to delete date block");
    } finally {
      setDeletingBlockId(undefined);
    }
  };

  const columns = React.useMemo<ColumnDef<DateBlockResponse>[]>(
    () => [
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => formatDate(row.original.endDate),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) =>
          DATE_BLOCK_REASON_LABELS[row.original.reason] || row.original.reason,
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <span className="text-neutral-500">{row.original.notes || "—"}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDate(row.original.createdAt),
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
              onClick={() => setDeletingBlockId(row.original.id)}
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">Date Blocks</h2>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Date Block
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={blocks}
        isLoading={isLoading}
        emptyMessage="No date blocks yet. Click above to block dates."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBlock ? "Edit Date Block" : "Add Date Block"}
      >
        <DateBlockForm
          defaultValues={editingBlock}
          onSubmit={handleFormSubmit}
          isLoading={isFormLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBlockId}
        title="Delete Date Block"
        description="Are you sure you want to delete this date block? This unit will become available for booking during these dates."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingBlockId(undefined)}
      />
    </div>
  );
}
