"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/api-error";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const { adminLogin, isLoading } = useAdminLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isPending = isLoading || isSubmitting;

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      await adminLogin.mutateAsync(data);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setError("root", { message: "Invalid email or password" });
        } else if (error.hasFieldErrors()) {
          setError("root", {
            message: error.errors.join(", ") || "Validation error",
          });
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="admin@remal.com"
        disabled={isPending}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        disabled={isPending}
        error={errors.password?.message}
        {...register("password")}
      />

      {errors.root && (
        <div className="border-error/20 bg-error/5 rounded-md border p-3 text-sm text-error">
          {errors.root.message}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth isLoading={isPending}>
        Sign In
      </Button>
    </form>
  );
}
