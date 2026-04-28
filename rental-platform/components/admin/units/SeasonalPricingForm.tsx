"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const seasonalPricingSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    pricePerNight: z.coerce
      .number({
        invalid_type_error: "Price must be a number",
        required_error: "Price is required",
      })
      .min(0, "Price cannot be negative"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type SeasonalPricingFormValues = z.infer<typeof seasonalPricingSchema>;

export interface SeasonalPricingFormProps {
  defaultValues?: Partial<SeasonalPricingFormValues>;
  onSubmit: (values: SeasonalPricingFormValues) => void;
  isLoading?: boolean;
}

export function SeasonalPricingForm({
  defaultValues,
  onSubmit,
  isLoading,
}: SeasonalPricingFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SeasonalPricingFormValues>({
    resolver: zodResolver(seasonalPricingSchema),
    defaultValues: {
      startDate: defaultValues?.startDate || "",
      endDate: defaultValues?.endDate || "",
      pricePerNight: defaultValues?.pricePerNight ?? ("" as unknown as number),
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
                  label="Seasonal Pricing Dates"
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

      <div>
        <Input
          type="number"
          step="0.01"
          label="Price per Night (EGP)"
          placeholder="e.g. 5000"
          {...register("pricePerNight")}
          error={errors.pricePerNight?.message}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Seasonal Pricing"}
        </Button>
      </div>
    </form>
  );
}
