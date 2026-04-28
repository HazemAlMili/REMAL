import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AmenityResponse } from "@/lib/types";
import { useEffect } from "react";

const amenitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  icon: z.string().optional(),
});

export type AmenityFormValues = z.infer<typeof amenitySchema>;

interface AmenityFormProps {
  initialData?: AmenityResponse | null;
  onSubmit: (data: AmenityFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AmenityForm({
  initialData,
  onSubmit,
  isLoading,
}: AmenityFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AmenityFormValues>({
    resolver: zodResolver(amenitySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      icon: initialData?.icon ?? "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        icon: initialData.icon ?? "",
      });
    } else {
      reset({ name: "", icon: "" });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Amenity Name
        </label>
        <Input id="name" placeholder="e.g. WiFi, Pool" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="icon" className="text-sm font-medium">
          Icon Class / Name (Optional)
        </label>
        <Input id="icon" placeholder="e.g. icon-wifi" {...register("icon")} />
        {errors.icon && (
          <p className="text-sm text-red-500">{errors.icon.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading} isLoading={isLoading}>
          {initialData ? "Update Amenity" : "Create Amenity"}
        </Button>
      </div>
    </form>
  );
}
