"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => void;
  isLoading?: boolean;
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  isLoading,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Project name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          placeholder="e.g. Palm Hills"
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Brief description of the project"
          {...register("description")}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? "Saving..." : "Save project"}
        </Button>
      </div>
    </form>
  );
}
