"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOwnerLogin } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/api-error";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const ownerLoginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

type OwnerLoginFormValues = z.infer<typeof ownerLoginSchema>;

export function OwnerLoginForm() {
  const { ownerLogin, isLoading } = useOwnerLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OwnerLoginFormValues>({
    resolver: zodResolver(ownerLoginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const isPending = isLoading || isSubmitting;

  const onSubmit = async (data: OwnerLoginFormValues) => {
    try {
      await ownerLogin.mutateAsync(data);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setError("root", { message: "Invalid phone number or password" });
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
        label="Phone number"
        type="tel"
        autoComplete="tel"
        placeholder="+20 10 0000 0000"
        disabled={isPending}
        error={errors.phone?.message}
        {...register("phone")}
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
