import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-control-gap whitespace-nowrap font-sans font-medium",
    "transition-colors outline-none select-none",
    "focus-visible:focus-ring",
    "disabled:pointer-events-none disabled:opacity-40",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-accent-500 text-fg-on-accent border border-accent-400 shadow-button-primary",
          "hover:bg-accent-400 active:bg-accent-600",
        ),
        secondary: cn(
          "bg-overlay-white-soft text-text-primary border border-border-default",
          "hover:bg-overlay-white-fill active:bg-overlay-white-subtle",
        ),
        ghost: cn(
          "bg-transparent text-text-secondary border border-transparent",
          "hover:bg-overlay-white-subtle hover:text-text-primary",
        ),
        danger: cn(
          "bg-danger text-fg-on-danger border border-danger shadow-button-danger",
          "hover:bg-danger-hover",
        ),
        warm: cn(
          "bg-accent2-500 text-fg-on-warm border border-accent2-300 shadow-button-warm",
          "hover:bg-accent2-300",
        ),
      },
      size: {
        sm: "h-control-sm px-button-px-sm text-body-sm rounded-sm",
        md: "h-control-md px-button-px-md text-body rounded-sm",
        lg: "h-control-lg px-button-px-lg text-body rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
