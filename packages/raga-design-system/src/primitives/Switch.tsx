import * as RxSwitch from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "../lib/cn";

export type SwitchProps = React.ComponentPropsWithoutRef<typeof RxSwitch.Root>;

export const Switch = React.forwardRef<
  React.ComponentRef<typeof RxSwitch.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <RxSwitch.Root
    ref={ref}
    className={cn(
      "relative inline-flex h-switch-h w-switch-w shrink-0 cursor-pointer items-center rounded-pill",
      "bg-overlay-white-fill border border-border-default transition-colors",
      "data-[state=checked]:bg-accent-500 data-[state=checked]:border-accent-400",
      "focus-visible:outline-none focus-visible:focus-ring",
      "disabled:opacity-40 disabled:pointer-events-none",
      className,
    )}
    {...props}
  >
    <RxSwitch.Thumb
      className={cn(
        "pointer-events-none block h-switch-thumb w-switch-thumb rounded-pill bg-fg-on-accent shadow-switch-thumb",
        "translate-x-px data-[state=checked]:translate-x-switch-thumb transition-transform",
      )}
    />
  </RxSwitch.Root>
));
Switch.displayName = "Switch";
