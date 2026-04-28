"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import {
  DATE_BLOCK_REASONS,
  DATE_BLOCK_REASON_LABELS,
} from "@/lib/constants/date-block-reasons";

const dateBlockSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.enum(["Maintenance", "OwnerUse", "Other"]),
    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional()
      .nullable(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["endDate"],
  });

export type DateBlockFormValues = z.infer<typeof dateBlockSchema>;

export interface DateBlockFormProps {
  defaultValues?: Partial<DateBlockFormValues>;
  onSubmit: (values: DateBlockFormValues) => void;
  isLoading?: boolean;
}

const REASON_OPTIONS = [
  {
    value: DATE_BLOCK_REASONS.Maintenance,
    label: DATE_BLOCK_REASON_LABELS.Maintenance,
  },
  {
    value: DATE_BLOCK_REASONS.OwnerUse,
    label: DATE_BLOCK_REASON_LABELS.OwnerUse,
  },
  { value: DATE_BLOCK_REASONS.Other, label: DATE_BLOCK_REASON_LABELS.Other },
];

export function DateBlockForm({
  defaultValues,
  onSubmit,
  isLoading,
}: DateBlockFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DateBlockFormValues>({
    resolver: zodResolver(dateBlockSchema),
    defaultValues: {
      startDate: defaultValues?.startDate || "",
      endDate: defaultValues?.endDate || "",
      reason: defaultValues?.reason || "Maintenance",
      notes: defaultValues?.notes || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="startDate"
        control={control}
        render={({
          field: { value: startValue, onChange: onStartChange },
          formState: { errors },
        }) => (
          <Controller
            name="endDate"
            control={control}
            render={({ field: { value: endValue, onChange: onEndChange } }) => {
              const range = {
                from: startValue ? new Date(startValue) : null,
                to: endValue ? new Date(endValue) : null,
              };

              return (
                <DateRangePicker
                  label="Blocked Dates"
                  value={range}
                  onChange={(newRange) => {
                    const formatYMD = (d: Date) =>
                      d.toISOString().split("T")[0];
                    if (newRange.from) onStartChange(formatYMD(newRange.from));
                    else onStartChange("");

                    if (newRange.to) onEndChange(formatYMD(newRange.to));
                    else onEndChange("");
                  }}
                  error={errors.startDate?.message || errors.endDate?.message}
                />
              );
            }}
          />
        )}
      />

      <Controller
        name="reason"
        control={control}
        render={({ field: { value, onChange, onBlur } }) => (
          <Select
            label="Reason"
            options={REASON_OPTIONS}
            value={value}
            onChange={(val) => onChange(val)}
            onBlur={onBlur}
            error={errors.reason?.message}
            disabled={isLoading}
          />
        )}
      />

      <Textarea
        label="Notes (Optional)"
        placeholder="Add context about why this date is blocked..."
        {...register("notes")}
        error={errors.notes?.message}
        disabled={isLoading}
        rows={4}
      />

      <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Date Block"}
        </Button>
      </div>
    </form>
  );
}
