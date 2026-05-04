import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass';
}

export function Card({ className, padding = 'md', variant = 'default', children, ...props }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  const variants = {
    default: "bg-surface shadow-soft hover:shadow-float border border-gray-100/50",
    glass: "glass-panel"
  };

  return (
    <div
      className={cn(
        "rounded-3xl transition-all duration-300",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
