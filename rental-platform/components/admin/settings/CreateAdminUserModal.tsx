"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { toastSuccess } from "@/lib/utils/toast";
import { adminUsersService } from "@/lib/api/services/admin-users.service";
import { queryKeys } from "@/lib/utils/query-keys";
import { ADMIN_ROLE_LABELS, ADMIN_ROLES } from "@/lib/constants/roles";
import type { CreateAdminUserRequest } from "@/lib/types/admin-user.types";
import type { AxiosError } from "axios";

const createAdminUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SuperAdmin", "Sales", "Finance", "Tech"]),
});

type CreateAdminUserFormValues = z.infer<typeof createAdminUserSchema>;

interface CreateAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAdminUserModal({
  isOpen,
  onClose,
}: CreateAdminUserModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreateAdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Sales",
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: adminUsersService.create,
    onSuccess: () => {
      toastSuccess("Admin user created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.list() });
      reset();
      onClose();
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      if (error.response?.status === 422) {
        const errorMessages = error.response.data?.errors ?? [];
        // Map server errors to form fields
        if (errorMessages.some((msg) => msg.toLowerCase().includes("email"))) {
          setError("email", {
            type: "server",
            message: "Email already in use",
          });
        } else {
          setServerError(errorMessages[0] || "Failed to create admin user");
        }
      } else {
        setServerError(error.message || "Failed to create admin user");
      }
    },
  });

  const onSubmit = (data: CreateAdminUserRequest) => {
    setServerError(null);
    createMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const roleOptions = Object.entries(ADMIN_ROLES).map(([, value]) => ({
    value,
    label: ADMIN_ROLE_LABELS[value as keyof typeof ADMIN_ROLE_LABELS],
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Admin User"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Input
          label="Name"
          placeholder="Full name"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="admin@rentalplatform.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          required
          error={errors.password?.message}
          {...register("password")}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              label="Role"
              required
              error={errors.role?.message}
              options={roleOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Admin User
          </Button>
        </div>
      </form>
    </Modal>
  );
}
