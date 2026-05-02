import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

export const iconButtonVariants = cva(
  cn(
    "inline-flex items-center justify-center",
    "transition-colors outline-none select-none rounded-sm",
    "focus-visible:focus-ring",
    "disabled:pointer-events-none",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-accent-500 text-fg-on-accent border border-accent-400",
          "shadow-icon-pill-glow",
          "hover:bg-accent-400 active:bg-accent-600",
          "disabled:bg-accent-500/40 disabled:border-accent-400/40 disabled:text-fg-on-accent/70 disabled:shadow-none",
        ),
        secondary: cn(
          "bg-overlay-white-soft text-text-primary border border-border-default",
          "hover:bg-overlay-white-fill active:bg-overlay-white-subtle",
          "disabled:bg-overlay-white-subtle disabled:text-text-disabled disabled:border-border-subtle",
        ),
        ghost: cn(
          "bg-transparent text-text-secondary border border-transparent",
          "hover:bg-overlay-white-subtle hover:text-text-primary hover:border-border-default",
          "active:border-border-default",
          "disabled:text-text-disabled",
        ),
        danger: cn(
          "bg-danger text-fg-on-danger border border-danger",
          "hover:bg-danger-hover",
          "disabled:bg-danger/40 disabled:border-danger/40 disabled:text-fg-on-danger/70",
        ),
        warm: cn(
          "bg-accent2-500 text-fg-on-warm border border-accent2-300",
          "hover:bg-accent2-300",
          "disabled:bg-accent2-500/40 disabled:border-accent2-300/40 disabled:text-fg-on-warm/70",
        ),
      },
      size: {
        sm: "h-control-sm w-control-sm",
        md: "h-control-md w-control-md",
        lg: "h-control-lg w-control-lg",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
