"use client";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-200",
  secondary:
    "bg-neutral-800 text-white hover:bg-neutral-900 active:bg-neutral-900 disabled:bg-neutral-300",
  outline:
    "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50",
  ghost:
    "text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-50",
  danger:
    "bg-error text-white hover:opacity-90 active:opacity-80 disabled:opacity-50",
  success:
    "bg-success text-white hover:opacity-90 active:opacity-80 disabled:opacity-50",
  warning:
    "bg-warning text-neutral-900 hover:opacity-90 active:opacity-80 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8  px-3  text-xs  gap-1.5",
  md: "h-10 px-4  text-sm  gap-2",
  lg: "h-12 px-6  text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium",
          "transition-colors duration-150 ease-out-quart",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2
            className="animate-spin"
            size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
