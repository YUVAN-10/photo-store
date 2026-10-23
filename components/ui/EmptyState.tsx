import React from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-surface/50 border-2 border-dashed border-border rounded-3xl my-6",
        className
      )}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md text-base sm:text-lg mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="lg" onClick={onAction} className="shadow-md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
