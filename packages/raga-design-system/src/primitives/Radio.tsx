import * as RxRadio from "@radix-ui/react-radio-group";
import * as React from "react";

import { cn } from "../lib/cn";

export const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RxRadio.Root>,
  React.ComponentPropsWithoutRef<typeof RxRadio.Root>
>(({ className, ...props }, ref) => (
  <RxRadio.Root ref={ref} className={cn("flex flex-col gap-control-gap", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export const Radio = React.forwardRef<
  React.ComponentRef<typeof RxRadio.Item>,
  React.ComponentPropsWithoutRef<typeof RxRadio.Item>
>(({ className, ...props }, ref) => (
  <RxRadio.Item
    ref={ref}
    className={cn(
      "inline-flex h-checkbox w-checkbox items-center justify-center rounded-pill",
      "bg-overlay-white-subtle border border-border-default",
      "outline-none transition-colors",
      "data-[state=checked]:border-accent-500",
      "focus-visible:focus-ring",
      "disabled:opacity-40 disabled:pointer-events-none",
      className,
    )}
    {...props}
  >
    <RxRadio.Indicator className="block h-radio-dot w-radio-dot rounded-pill bg-accent-500" />
  </RxRadio.Item>
));
Radio.displayName = "Radio";
