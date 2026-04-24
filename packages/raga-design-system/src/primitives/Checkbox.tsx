import * as RxCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof RxCheckbox.Root>;

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof RxCheckbox.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => (
  <RxCheckbox.Root
    ref={ref}
    className={cn(
      "inline-flex h-checkbox w-checkbox items-center justify-center rounded-xs",
      "bg-overlay-white-subtle border border-border-default",
      "outline-none transition-colors",
      "data-[state=checked]:bg-accent-500 data-[state=checked]:border-accent-400",
      "focus-visible:focus-ring",
      "disabled:opacity-40 disabled:pointer-events-none",
      className,
    )}
    {...props}
  >
    <RxCheckbox.Indicator className="text-fg-on-accent flex items-center justify-center">
      <Check className="h-checkmark w-checkmark" strokeWidth={3} />
    </RxCheckbox.Indicator>
  </RxCheckbox.Root>
));
Checkbox.displayName = "Checkbox";
