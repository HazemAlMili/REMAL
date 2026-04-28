"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Star, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import {
  usePublicUnitImages,
  useAddUnitImage,
  useReorderUnitImages,
  useSetUnitCoverImage,
  useDeleteUnitImage,
} from "@/lib/hooks/useUnits";
import type { UnitImageResponse } from "@/lib/types";

const addImageSchema = z.object({
  fileKey: z.string().min(1, "fileKey is required"),
  isCover: z.boolean().optional(),
});
type AddImageValues = z.infer<typeof addImageSchema>;

export interface UnitImagesTabProps {
  unitId: string;
}

export function UnitImagesTab({ unitId }: UnitImagesTabProps) {
  const { data: images = [], isLoading } = usePublicUnitImages(unitId);
  const { mutateAsync: addImage, isPending: isAdding } = useAddUnitImage();
  const { mutateAsync: reorderImages, isPending: isReordering } =
    useReorderUnitImages();
  const { mutateAsync: setCover, isPending: isSettingCover } =
    useSetUnitCoverImage();
  const { mutateAsync: deleteImage, isPending: isDeleting } =
    useDeleteUnitImage();

  const [deleteTarget, setDeleteTarget] =
    React.useState<UnitImageResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddImageValues>({
    resolver: zodResolver(addImageSchema),
    defaultValues: { fileKey: "", isCover: false },
  });

  // Sort images by displayOrder for rendering
  const sorted = React.useMemo(
    () => [...images].sort((a, b) => a.displayOrder - b.displayOrder),
    [images]
  );

  const isMutating = isAdding || isReordering || isSettingCover || isDeleting;

  const handleAdd = async (values: AddImageValues) => {
    try {
      await addImage({
        unitId,
        data: { fileKey: values.fileKey, isCover: values.isCover },
      });
      toastSuccess("Image added successfully");
      reset();
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to add image");
    }
  };

  const handleSetCover = async (imageId: string) => {
    try {
      await setCover({ unitId, imageId });
      toastSuccess("Cover image updated");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to set cover image");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const reordered = [...sorted];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= reordered.length) return;
    const temp = reordered[index]!;
    reordered[index] = reordered[swapIndex]!;
    reordered[swapIndex] = temp;
    const items = reordered.map((img, i) => ({
      imageId: img.id,
      displayOrder: i + 1,
    }));
    try {
      await reorderImages({ unitId, data: { items } });
      toastSuccess("Images reordered");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to reorder images");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteImage({ unitId, imageId: deleteTarget.id });
      toastSuccess("Image removed");
    } catch (e: unknown) {
      toastError((e as Error)?.message || "Failed to remove image");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add image form */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">
          Add Image Reference
        </h3>
        <p className="mb-4 text-xs text-neutral-500">
          Enter the storage key for the image. File upload is handled separately
          outside this interface.
        </p>
        <form
          onSubmit={handleSubmit(handleAdd)}
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="flex-1">
            <Input
              label="File Key"
              placeholder="e.g. units/abc123/photo-1.jpg"
              {...register("fileKey")}
              error={errors.fileKey?.message}
              disabled={isAdding}
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1.5 pb-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                {...register("isCover")}
                disabled={isAdding}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600"
              />
              Set as cover
            </label>
            <Button
              type="submit"
              disabled={isAdding}
              size="sm"
              className="mb-0.5 shrink-0"
            >
              {isAdding ? "Adding..." : "Add Image"}
            </Button>
          </div>
        </form>
      </div>

      {/* Gallery */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-xl bg-neutral-200"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Add the first image reference above."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full">
                <Image
                  src={`/api/images/${image.fileKey}`}
                  alt={`Unit image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    // Fallback: hide broken image, show placeholder bg
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
                {/* Cover badge */}
                {image.isCover && (
                  <div className="absolute left-2 top-2">
                    <Badge variant="warning" size="sm">
                      Cover
                    </Badge>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-1 border-t border-neutral-200 bg-white p-1.5">
                {/* Reorder arrows */}
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0 || isMutating}
                    onClick={() => handleMove(index, "up")}
                    className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === sorted.length - 1 || isMutating}
                    onClick={() => handleMove(index, "down")}
                    className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Cover + Delete */}
                <div className="flex gap-0.5">
                  {!image.isCover && (
                    <button
                      type="button"
                      title="Set as cover"
                      disabled={isMutating}
                      onClick={() => handleSetCover(image.id)}
                      className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Remove image"
                    disabled={isMutating}
                    onClick={() => setDeleteTarget(image)}
                    className="rounded p-1 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Image"
        description={`Are you sure you want to remove this image (${deleteTarget?.fileKey ?? ""})? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
