"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClientRegister } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/api-error";
import { ROUTES } from "@/lib/constants/routes";
import { registerSchema } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const clientRegisterSchema = registerSchema
  .extend({
    name: registerSchema.shape.name.min(2, "Name must be at least 2 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>;

export function ClientRegisterForm() {
  const router = useRouter();
  const { register: registerClient, isLoading } = useClientRegister();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegisterFormValues>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isPending = isLoading || isSubmitting;

  const onSubmit = async (data: ClientRegisterFormValues) => {
    try {
      await registerClient({
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });
      // Redirect is handled inside the hook on success
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          // Try to map errors to fields — show generically if not parseable
          const messages = err.errors;
          const phoneError = messages.find((m) =>
            m.toLowerCase().includes("phone")
          );
          const emailError = messages.find((m) =>
            m.toLowerCase().includes("email")
          );

          if (phoneError) {
            setError("phone", {
              message: "This phone number is already registered",
            });
          } else if (emailError) {
            setError("email", { message: "This email is already registered" });
          } else {
            setError("root", {
              message: messages.join(", ") || "Validation failed",
            });
          }
        } else if (err.status === 401) {
          // Register succeeded but auto-login failed
          setError("root", {
            message:
              "Account created but login failed. Please sign in manually.",
          });
          router.push(ROUTES.auth.clientLogin);
        }
      }
      // 500 / network errors handled by Axios interceptor
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Ahmed Hassan"
        disabled={isPending}
        error={errors.name?.message}
        {...register("name")}
      />

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
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        disabled={isPending}
        error={errors.email?.message}
        helperText="Optional"
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        disabled={isPending}
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        disabled={isPending}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {errors.root && (
        <div className="border-error/20 bg-error/5 rounded-md border p-3 text-sm text-error">
          {errors.root.message}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth isLoading={isPending}>
        Create Account
      </Button>
    </form>
  );
}
