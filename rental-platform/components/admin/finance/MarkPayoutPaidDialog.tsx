"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";
import {
  markPaidSchema,
  type MarkPaidFormValues,
} from "@/lib/validations/payout.schema";
import { useMarkPayoutPaid, payoutQueryKeys } from "@/lib/hooks/usePayouts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface MarkPayoutPaidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payoutId: string;
  ownerId?: string;
}

export function MarkPayoutPaidDialog({
  isOpen,
  onClose,
  payoutId,
  ownerId,
}: MarkPayoutPaidDialogProps) {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MarkPaidFormValues>({
    resolver: zodResolver(markPaidSchema),
  });

  const markPaidMutation = useMarkPayoutPaid();

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("proofOfPaymentUrl", "");
  };

  const uploadImage = async (file: File): Promise<string> => {
    // TODO: Implement actual file upload
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: MarkPaidFormValues) => {
    try {
      let proofOfPaymentUrl = data.proofOfPaymentUrl;

      if (imageFile) {
        setUploadingImage(true);
        proofOfPaymentUrl = await uploadImage(imageFile);
        setUploadingImage(false);
      }

      markPaidMutation.mutate(
        { id: payoutId, data: { ...data, proofOfPaymentUrl } },
        {
          onSuccess: () => {
            toast.success("Payout marked as paid");
            if (ownerId) {
              queryClient.invalidateQueries({
                queryKey: payoutQueryKeys.byOwner(ownerId),
              });
              queryClient.invalidateQueries({
                queryKey: payoutQueryKeys.summary(ownerId),
              });
            }
            queryClient.invalidateQueries({ queryKey: payoutQueryKeys.all });
            reset();
            setImageFile(null);
            setImagePreview(null);
            onClose();
          },
          onError: (error: unknown) => {
            const err = error as {
              response?: { data?: { message?: string } };
            };
            toast.error(
              err.response?.data?.message || "Could not mark payout as paid"
            );
          },
        }
      );
    } catch {
      toast.error("Could not upload proof of payment");
      setUploadingImage(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Mark payout as paid"
      onConfirm={handleSubmit(onSubmit)}
      isLoading={markPaidMutation.isPending || uploadingImage}
      confirmLabel={uploadingImage ? "Uploading proof..." : "Mark payout paid"}
    >
      <form
        id="mark-paid-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <p className="text-sm text-neutral-600">
          Confirm the transfer to the owner and attach proof if available.
        </p>

        {/* Proof of Payment Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Proof of payment
            <span className="ml-1 text-xs text-neutral-500">
              (Instapay or Vodafone Cash screenshot)
            </span>
          </label>

          {!imagePreview ? (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-4 transition-colors hover:border-primary-400">
              <label className="cursor-pointer text-center">
                <div className="mb-1 text-neutral-400">
                  <svg
                    className="mx-auto h-10 w-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-neutral-600">
                  Upload proof of payment
                </span>
                <p className="mt-1 text-xs text-neutral-400">
                  PNG, JPG up to 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="relative rounded-lg border border-neutral-200 p-2">
              <div className="relative h-32 w-full">
                <Image
                  src={imagePreview}
                  alt="Proof of payment"
                  fill
                  className="rounded object-contain"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-lg transition-colors hover:bg-red-600"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <Textarea
          label="Internal note (optional)"
          placeholder="Add transfer reference or payment method details"
          error={errors.notes?.message}
          rows={2}
          {...register("notes")}
        />
      </form>
    </ConfirmDialog>
  );
}
