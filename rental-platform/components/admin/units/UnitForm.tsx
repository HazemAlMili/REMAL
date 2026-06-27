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
import { Switch } from "@/components/ui/Switch";

const unitFormSchema = z.object({
  ownerId: z.string().min(1, "Owner is required"),
  projectId: z.string().min(1, "Project is required"),
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
  isVisibleInPortfolio: z.boolean().optional(),
  address: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  defaultValues?: Partial<UnitFormValues>;
  onSubmit: (values: UnitFormValues) => void;
  isLoading?: boolean;
  mode: "create" | "edit";
  isOwnerProjectEditable: boolean;
  owners?: SelectOption<string>[];
  projects?: SelectOption<string>[];
  isOwnersLoading?: boolean;
  isProjectsLoading?: boolean;
  /** Read-only display labels used when isOwnerProjectEditable is false */
  ownerDisplayName?: string;
  projectDisplayName?: string;
}

export function UnitForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode,
  isOwnerProjectEditable,
  owners = [],
  projects = [],
  isOwnersLoading = false,
  isProjectsLoading = false,
  ownerDisplayName,
  projectDisplayName,
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
      isVisibleInPortfolio: true,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {isOwnerProjectEditable ? (
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

          {isOwnerProjectEditable ? (
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <Select
                  label="Project"
                  options={projects}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.projectId?.message}
                  disabled={isLoading || isProjectsLoading}
                  placeholder={
                    isProjectsLoading
                      ? "Loading projects..."
                      : "Select a project"
                  }
                />
              )}
            />
          ) : (
            <div className="space-y-1">
              <span className="block text-sm font-medium text-neutral-700">
                Project
              </span>
              <p className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-500">
                {projectDisplayName ?? defaultValues?.projectId ?? "—"}
              </p>
            </div>
          )}

          <Input
            label="Unit name"
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
                label="Unit type"
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
            label="Max guests"
            type="number"
            {...register("maxGuests")}
            error={errors.maxGuests?.message}
            disabled={isLoading}
            min={1}
          />

          <Input
            label="Base price/night (EGP)"
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
          label="Address (optional)"
          {...register("address")}
          error={errors.address?.message}
          disabled={isLoading}
          placeholder="Full address of the unit"
        />

        <Textarea
          label="Description (optional)"
          {...register("description")}
          error={errors.description?.message}
          disabled={isLoading}
          placeholder="Brief description about the property"
          rows={4}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="rounded-[var(--portal-radius-card)] border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-neutral-800"
                    >
                      Active for operations
                    </label>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Allows admin bookings, CRM assignment, owner tracking,
                      and internal availability checks.
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    aria-label="Active for operations"
                    className="mt-0.5"
                  />
                </div>
              </div>
            )}
          />

          <Controller
            control={control}
            name="isVisibleInPortfolio"
            render={({ field }) => (
              <div className="rounded-[var(--portal-radius-card)] border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label
                      htmlFor="isVisibleInPortfolio"
                      className="text-sm font-medium text-neutral-800"
                    >
                      Show in public portfolio
                    </label>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Displays active units on the storefront catalog and
                      featured property sections.
                    </p>
                  </div>
                  <Switch
                    id="isVisibleInPortfolio"
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    aria-label="Show in public portfolio"
                    className="mt-0.5"
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading
            ? mode === "edit"
              ? "Saving..."
              : "Creating unit..."
            : mode === "edit"
              ? "Save changes"
              : "Create unit"}
        </Button>
      </div>
    </form>
  );
}
