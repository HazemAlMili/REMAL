"use client";

import { useEffect, useState } from "react";
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
import { useRoleTemplates } from "@/lib/hooks/useRbac";
import type { CreateAdminUserRequest } from "@/lib/types/admin-user.types";
import type { AxiosError } from "axios";

const createAdminUserSchema = z.object({
  name: z.string().min(1, "Please enter the admin user's full name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleTemplateId: z.string().uuid("Select an admin role"),
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
  const rolesQuery = useRoleTemplates();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
    setValue,
  } = useForm<CreateAdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleTemplateId: "",
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const activeRoles = (rolesQuery.data ?? []).filter((role) => role.isActive);
  const firstActiveRoleId = activeRoles[0]?.id;
  useEffect(() => {
    if (firstActiveRoleId) {
      setValue("roleTemplateId", firstActiveRoleId, { shouldValidate: false });
    }
  }, [firstActiveRoleId, setValue]);

  const createMutation = useMutation({
    mutationFn: adminUsersService.create,
    onSuccess: () => {
      toastSuccess("Admin user created");
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
            message: "This email is already used by another admin user",
          });
        } else {
          setServerError(errorMessages[0] || "Could not create admin user");
        }
      } else {
        setServerError(error.message || "Could not create admin user");
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

  const roleOptions = activeRoles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create admin user"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Input
          label="Full name"
          placeholder="Full name"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="name@kazabooking.com"
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
          name="roleTemplateId"
          control={control}
          render={({ field }) => (
            <Select
          label="Admin role"
              required
              error={errors.roleTemplateId?.message}
              options={roleOptions}
              value={field.value}
              onChange={field.onChange}
              disabled={rolesQuery.isLoading || roleOptions.length === 0}
            />
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Create admin user
          </Button>
        </div>
      </form>
    </Modal>
  );
}
