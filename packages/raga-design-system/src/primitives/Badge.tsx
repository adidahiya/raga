import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-pill-gap px-pill-px py-pill-py text-caption font-mono rounded-sm border",
  {
    variants: {
      variant: {
        neutral: "bg-overlay-white-subtle text-text-secondary border-border-default",
        accent: "bg-accent-500/10 text-accent-300 border-accent-500/25",
        warm: "bg-accent2-500/10 text-accent2-300 border-accent2-500/25",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";
