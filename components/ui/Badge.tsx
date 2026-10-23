import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "muted" | "outline";
}

export function Badge({ className, variant = "muted", children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary/15 text-primary border-primary/20",
    secondary: "bg-secondary/15 text-secondary border-secondary/20",
    muted: "bg-muted text-foreground/80 border-transparent",
    outline: "border border-border text-foreground/90",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
