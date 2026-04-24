import * as React from "react";

import { cn } from "../lib/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-md border border-border-default bg-surface-2 text-text-primary",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
