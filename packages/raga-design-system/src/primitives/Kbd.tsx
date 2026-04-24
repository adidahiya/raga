import * as React from "react";

import { cn } from "../lib/cn";

export type KbdProps = React.HTMLAttributes<HTMLElement>;

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "pointer-events-none inline-flex h-kbd-h min-w-kbd-min-w select-none items-center justify-center gap-1",
        "px-kbd-px font-mono text-micro font-medium rounded-xs",
        "bg-overlay-white-subtle text-text-muted border border-border-default",
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";
