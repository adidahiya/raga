import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const spinnerVariants = cva(
  cn(
    "inline-block rounded-pill border-2 border-current border-t-transparent",
    "motion-safe:animate-spin motion-reduce:opacity-60",
  ),
  {
    variants: {
      size: {
        xs: "h-icon-xs w-icon-xs border",
        sm: "h-icon-sm w-icon-sm border",
        md: "h-icon-md w-icon-md border-2",
        lg: "h-icon-lg w-icon-lg border-2",
        xl: "h-control-md w-control-md border-[3px]",
      },
      color: {
        accent: "text-accent-400",
        muted: "text-text-muted",
        primary: "text-text-primary",
        onAccent: "text-fg-on-accent",
        success: "text-success",
        warning: "text-warning",
        danger: "text-danger",
        info: "text-info",
      },
    },
    defaultVariants: { size: "md", color: "accent" },
  },
);

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label for the spinner. Defaults to "Loading". */
  label?: string;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, color, label = "Loading", ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(spinnerVariants({ size, color }), className)}
      {...props}
    />
  ),
);
Spinner.displayName = "Spinner";
