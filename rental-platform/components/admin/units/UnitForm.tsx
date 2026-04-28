"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectOption } from "@/components/ui/Select";
import { Combobox } from "@/components/ui/Combobox";

const unitFormSchema = z.object({
  ownerId: z.string().min(1, "Owner is required"),
  areaId: z.string().min(1, "Area is required"),
  name: z.string().min(1, "Unit name is required").max(100),
  unitType: z.enum(["villa", "chalet", "studio"]),
  bedrooms: z.coerce
    .number({ invalid_type_error: "Bedrooms are required" })
    .min(0, "Min 0 bedrooms"),
  bathrooms: z.coerce
    .number({ invalid_type_error: "Bathrooms are required" })
    .min(0, "Min 0 bathrooms"),
  maxGuests: z.coerce
    .number({ invalid_type_error: "Max guests is required" })
    .min(1, "Min 1 guest"),
  basePricePerNight: z.coerce
    .number({ invalid_type_error: "Price is required" })
    .min(0, "Price cannot be negative"),
  isActive: z.boolean().optional(),
  address: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  defaultValues?: Partial<UnitFormValues>;
  onSubmit: (values: UnitFormValues) => void;
  isLoading?: boolean;
  mode: "create" | "edit";
  isOwnerAreaEditable: boolean;
  owners?: SelectOption<string>[];
  areas?: SelectOption<string>[];
  isOwnersLoading?: boolean;
  isAreasLoading?: boolean;
  /** Read-only display labels used when isOwnerAreaEditable is false */
  ownerDisplayName?: string;
  areaDisplayName?: string;
}

export function UnitForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode,
  isOwnerAreaEditable,
  owners = [],
  areas = [],
  isOwnersLoading = false,
  isAreasLoading = false,
  ownerDisplayName,
  areaDisplayName,
}: UnitFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {isOwnerAreaEditable ? (
            <Controller
              control={control}
              name="ownerId"
              render={({ field }) => (
                <Combobox
                  label="Owner"
                  options={owners}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.ownerId?.message}
                  disabled={isLoading || isOwnersLoading}
                  placeholder={
                    isOwnersLoading ? "Loading owners..." : "Select an owner"
                  }
                />
              )}
            />
          ) : (
            <div className="space-y-1">
              <span className="block text-sm font-medium text-neutral-700">
                Owner
              </span>
              <p className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-500">
                {ownerDisplayName ?? defaultValues?.ownerId ?? "—"}
              </p>
            </div>
          )}

          {isOwnerAreaEditable ? (
            <Controller
              control={control}
              name="areaId"
              render={({ field }) => (
                <Select
                  label="Area"
                  options={areas}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.areaId?.message}
                  disabled={isLoading || isAreasLoading}
                  placeholder={
                    isAreasLoading ? "Loading areas..." : "Select an area"
                  }
                />
              )}
            />
          ) : (
            <div className="space-y-1">
              <span className="block text-sm font-medium text-neutral-700">
                Area
              </span>
              <p className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-500">
                {areaDisplayName ?? defaultValues?.areaId ?? "—"}
              </p>
            </div>
          )}

          <Input
            label="Unit Name"
            {...register("name")}
            error={errors.name?.message}
            disabled={isLoading}
            placeholder="e.g. Sunset Villa"
          />

          <Controller
            control={control}
            name="unitType"
            render={({ field }) => (
              <Select
                label="Unit Type"
                options={[
                  { label: "Villa", value: "villa" },
                  { label: "Chalet", value: "chalet" },
                  { label: "Studio", value: "studio" },
                ]}
                value={field.value || ""}
                onChange={field.onChange}
                error={errors.unitType?.message}
                disabled={isLoading}
                placeholder="Select unit type"
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Bedrooms"
            type="number"
            {...register("bedrooms")}
            error={errors.bedrooms?.message}
            disabled={isLoading}
            min={0}
          />

          <Input
            label="Bathrooms"
            type="number"
            {...register("bathrooms")}
            error={errors.bathrooms?.message}
            disabled={isLoading}
            min={0}
            step="any"
          />

          <Input
            label="Max Guests"
            type="number"
            {...register("maxGuests")}
            error={errors.maxGuests?.message}
            disabled={isLoading}
            min={1}
          />

          <Input
            label="Base Price / Night (SAR)"
            type="number"
            {...register("basePricePerNight")}
            error={errors.basePricePerNight?.message}
            disabled={isLoading}
            min={0}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Address (Optional)"
          {...register("address")}
          error={errors.address?.message}
          disabled={isLoading}
          placeholder="Full address of the unit"
        />

        <Textarea
          label="Description (Optional)"
          {...register("description")}
          error={errors.description?.message}
          disabled={isLoading}
          placeholder="Brief description about the property"
          rows={4}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            disabled={isLoading}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-neutral-700"
          >
            Active Status (Visible to users)
          </label>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading
            ? mode === "edit"
              ? "Saving..."
              : "Creating Unit..."
            : mode === "edit"
              ? "Save Changes"
              : "Create Unit"}
        </Button>
      </div>
    </form>
  );
}
