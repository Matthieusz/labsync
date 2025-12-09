import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormErrorProps = {
  message?: string;
  className?: string;
};

export function FormError({ message, className }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return <p className={cn("text-destructive text-sm", className)}>{message}</p>;
}

type FormBlockErrorProps = {
  message?: string;
  className?: string;
};

export function FormBlockError({ message, className }: FormBlockErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3",
        className
      )}
    >
      <p className="text-destructive text-sm">{message}</p>
    </div>
  );
}

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className
      )}
    >
      {icon ? <div className="mb-4 text-muted-foreground">{icon}</div> : null}
      <h3 className="font-medium text-lg">{title}</h3>
      {description ? (
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
