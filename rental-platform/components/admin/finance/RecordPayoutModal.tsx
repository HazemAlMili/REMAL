"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  createPayoutSchema,
  type CreatePayoutFormValues,
} from "@/lib/validations/payout.schema";
import { useCreatePayout } from "@/lib/hooks/usePayouts";
import { useBookingsList } from "@/lib/hooks/useBookings";
import { useOwners } from "@/lib/hooks/useOwners";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { payoutQueryKeys } from "@/lib/hooks/usePayouts";
import { formatCurrency } from "@/lib/utils/format";

interface RecordPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
}

export function RecordPayoutModal({
  isOpen,
  onClose,
  ownerId,
}: RecordPayoutModalProps) {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch confirmed/completed bookings for the owner
  // Note: We fetch Confirmed bookings. Completed bookings should also be eligible.
  // TODO: Backend should support multiple status filters or we need two separate queries
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useBookingsList({
    bookingStatus: "Confirmed",
    ownerId: ownerId,
    pageSize: 100,
  });

  // Fetch owner details to get commission rate
  const { data: ownersData } = useOwners({ pageSize: 100 });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreatePayoutFormValues>({
    resolver: zodResolver(createPayoutSchema),
    defaultValues: {
      bookingId: "",
      commissionRate: undefined,
      proofOfPaymentUrl: "",
      notes: "",
    },
  });

  const createMutation = useCreatePayout();
  const watchedBookingId = watch("bookingId");

  // Auto-populate commission rate when booking is selected
  useEffect(() => {
    if (watchedBookingId && bookingsData?.items) {
      const selectedBooking = bookingsData.items.find(
        (b) => b.id === watchedBookingId
      );
      if (selectedBooking && ownersData?.items) {
        const owner = ownersData.items.find(
          (o) => o.id === selectedBooking.ownerId
        );
        if (owner) {
          setValue("commissionRate", owner.commissionRate);
        }
      }
    }
  }, [watchedBookingId, bookingsData, ownersData, setValue]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("proofOfPaymentUrl", "");
  };

  // Upload image to server (placeholder - implement based on your file upload strategy)
  const uploadImage = async (file: File): Promise<string> => {
    // TODO: Implement actual file upload to your storage service
    // For now, we'll use a base64 data URL as a placeholder
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: CreatePayoutFormValues) => {
    try {
      let proofOfPaymentUrl = data.proofOfPaymentUrl;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        proofOfPaymentUrl = await uploadImage(imageFile);
        setUploadingImage(false);
      }

      createMutation.mutate(
        { ...data, proofOfPaymentUrl },
        {
          onSuccess: () => {
            toast.success("Payout record created successfully");
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
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(
              err.response?.data?.message || "Failed to create payout"
            );
          },
        }
      );
    } catch {
      toast.error("Failed to upload proof of payment");
      setUploadingImage(false);
    }
  };

  // Get selected booking details for display
  const selectedBooking = bookingsData?.items.find(
    (b) => b.id === watchedBookingId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Owner Payout"
      size="lg"
    >
      {!ownerId ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            Owner Not Selected
          </h3>
          <p className="text-sm text-neutral-600">
            Please select an owner from the dropdown first, then try creating a
            payout.
          </p>
          <div className="mt-6">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : bookingsError ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            Failed to Load Bookings
          </h3>
          <p className="text-sm text-neutral-600">
            Unable to fetch bookings for this owner. Please try again or contact
            support if the problem persists.
          </p>
          <div className="mt-6">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Booking Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Select Booking <span className="text-red-500">*</span>
            </label>
            <Controller
              name="bookingId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="focus:ring-primary-500/20 w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2"
                  disabled={bookingsLoading}
                >
                  <option value="">
                    {bookingsLoading
                      ? "Loading bookings..."
                      : "Select a confirmed booking..."}
                  </option>
                  {bookingsData?.items.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.unitName} - {booking.clientName} (
                      {formatCurrency(booking.finalAmount)}) -{" "}
                      {booking.checkInDate}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.bookingId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.bookingId.message}
              </p>
            )}
          </div>

          {/* Booking Details Display */}
          {selectedBooking && (
            <div className="rounded-lg bg-neutral-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-neutral-700">
                Booking Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neutral-500">Unit:</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {selectedBooking.unitName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Client:</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {selectedBooking.clientName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Check-in:</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {selectedBooking.checkInDate}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Check-out:</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {selectedBooking.checkOutDate}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Gross Amount:</span>
                  <span className="ml-2 font-medium text-neutral-900">
                    {formatCurrency(selectedBooking.finalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Commission Rate */}
          <Input
            label="Commission Rate (%)"
            type="number"
            step="0.01"
            placeholder="e.g. 20 for 20%"
            error={errors.commissionRate?.message}
            helperText="Auto-filled from owner profile. Adjust if needed."
            {...register("commissionRate", { valueAsNumber: true })}
          />

          {/* Calculated Amounts Display */}
          {selectedBooking && watch("commissionRate") !== undefined && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <h4 className="mb-3 text-sm font-semibold text-neutral-700">
                Payout Calculation
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">
                    Gross Booking Amount:
                  </span>
                  <span className="font-medium text-neutral-900">
                    {formatCurrency(selectedBooking.finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">
                    Commission ({watch("commissionRate")}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -{" "}
                    {formatCurrency(
                      (selectedBooking.finalAmount * watch("commissionRate")) /
                        100
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2">
                  <span className="font-semibold text-neutral-900">
                    Owner Payout Amount:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      selectedBooking.finalAmount -
                        (selectedBooking.finalAmount *
                          watch("commissionRate")) /
                          100
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Proof of Payment Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Proof of Payment
              <span className="ml-1 text-xs text-neutral-500">
                (Instapay/Vodafone Cash screenshot)
              </span>
            </label>

            {!imagePreview ? (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 transition-colors hover:border-primary-400">
                <label className="cursor-pointer text-center">
                  <div className="mb-2 text-neutral-400">
                    <svg
                      className="mx-auto h-12 w-12"
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
                    Click to upload proof of payment
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
              <div className="relative rounded-lg border border-neutral-200 p-4">
                <div className="relative h-48 w-full">
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
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                >
                  <svg
                    className="h-4 w-4"
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

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Optional notes (e.g., transfer reference number, payment method details)..."
            error={errors.notes?.message}
            rows={3}
            {...register("notes")}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || uploadingImage}
              disabled={!watchedBookingId}
            >
              {uploadingImage ? "Uploading..." : "Create Payout Record"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
