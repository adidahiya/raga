import * as RxProgress from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const progressVariants = cva(
  cn(
    "relative w-full overflow-hidden rounded-pill",
    "bg-overlay-white-soft",
  ),
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-slider-track-h",
        lg: "h-2",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const indicatorVariants = cva("h-full w-full transition-transform duration-200", {
  variants: {
    color: {
      accent: "bg-accent-500",
      warm: "bg-accent2-500",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      info: "bg-info",
    },
  },
  defaultVariants: { color: "accent" },
});

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RxProgress.Root>, "value" | "color">,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  /** 0-100 value; pass `null` for indeterminate. */
  value?: number | null;
  /** Custom max value, defaults to 100. */
  max?: number;
  /** Show a striped/animated indicator (used to indicate "running"). */
  striped?: boolean;
  /** Animate the stripes. Implies `striped`. */
  animated?: boolean;
}

export const Progress = React.forwardRef<
  React.ComponentRef<typeof RxProgress.Root>,
  ProgressProps
>(
  (
    {
      className,
      size,
      color,
      value = 0,
      max = 100,
      striped = false,
      animated = false,
      ...props
    },
    ref,
  ) => {
    const isIndeterminate = value === null;
    const safeValue = value ?? 0;
    const pct = Math.max(0, Math.min(100, (safeValue / max) * 100));
    const showStripes = striped || (animated && !isIndeterminate);
    return (
      <RxProgress.Root
        ref={ref}
        value={value ?? null}
        max={max}
        className={cn(progressVariants({ size }), className)}
        {...props}
      >
        <RxProgress.Indicator
          className={cn(
            indicatorVariants({ color }),
            isIndeterminate && "w-1/3 origin-left motion-safe:animate-[progress-indeterminate_1.5s_ease-in-out_infinite]",
            showStripes &&
              "bg-[length:24px_24px] bg-[linear-gradient(45deg,var(--overlay-white-fill)_25%,transparent_25%,transparent_50%,var(--overlay-white-fill)_50%,var(--overlay-white-fill)_75%,transparent_75%,transparent)]",
            showStripes && "motion-safe:animate-[progress-stripes_1s_linear_infinite]",
          )}
          style={
            isIndeterminate ? undefined : { transform: `translateX(-${(100 - pct).toString()}%)` }
          }
        />
      </RxProgress.Root>
    );
  },
);
Progress.displayName = "Progress";
