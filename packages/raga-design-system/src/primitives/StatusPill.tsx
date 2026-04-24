import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const wrapper = cva(
  "inline-flex items-center gap-pill-gap px-pill-px py-pill-py text-caption font-medium rounded-pill border",
  {
    variants: {
      tone: {
        success: "bg-success/10 border-success/20 text-success",
        warning: "bg-warning/10 border-warning/20 text-warning",
        danger: "bg-danger/10 border-danger/20 text-danger",
        info: "bg-info/10 border-info/20 text-info",
        idle: "bg-idle/15 border-idle/25 text-text-muted",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

const dot = cva("inline-block h-status-dot w-status-dot rounded-pill", {
  variants: {
    tone: {
      success: "bg-success shadow-pill-success",
      warning: "bg-warning shadow-pill-warning",
      danger: "bg-danger shadow-pill-danger",
      info: "bg-info shadow-pill-info",
      idle: "bg-idle",
    },
  },
  defaultVariants: { tone: "info" },
});

export interface StatusPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof wrapper> {
  label: string;
}

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, tone, label, ...props }, ref) => (
    <span ref={ref} className={cn(wrapper({ tone }), className)} {...props}>
      <span className={dot({ tone })} />
      {label}
    </span>
  ),
);
StatusPill.displayName = "StatusPill";
