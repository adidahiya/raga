import * as RxTooltip from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "../lib/cn";
import { TOKENS } from "../tokens/tokens";

export const TooltipProvider = RxTooltip.Provider;
export const Tooltip = RxTooltip.Root;
export const TooltipTrigger = RxTooltip.Trigger;

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof RxTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof RxTooltip.Content>
>(({ className, sideOffset = TOKENS.size.tooltipOffset, ...props }, ref) => (
  <RxTooltip.Portal>
    <RxTooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 px-tooltip-px py-tooltip-py rounded-sm text-caption font-sans",
        "bg-surface-4 text-text-primary border border-border-strong",
        "shadow-tooltip",
        className,
      )}
      {...props}
    />
  </RxTooltip.Portal>
));
TooltipContent.displayName = "TooltipContent";
