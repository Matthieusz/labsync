import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const loaderVariants = cva("animate-spin text-muted-foreground", {
  defaultVariants: {
    size: "default",
  },
  variants: {
    size: {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
  },
});

const containerVariants = cva("flex items-center justify-center", {
  defaultVariants: {
    fullScreen: false,
  },
  variants: {
    fullScreen: {
      false: "h-full pt-8",
      true: "h-screen",
    },
  },
});

interface LoaderProps extends VariantProps<typeof loaderVariants> {
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export default function Loader({
  className,
  fullScreen = false,
  size,
  text,
}: LoaderProps) {
  return (
    <div className={containerVariants({ fullScreen })}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={cn(loaderVariants({ size }), className)} />
        {text ? <p className="text-muted-foreground text-sm">{text}</p> : null}
      </div>
    </div>
  );
}

export { Loader, loaderVariants };
