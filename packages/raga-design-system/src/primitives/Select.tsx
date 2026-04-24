import * as RxSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { TOKENS } from "../tokens/tokens";

export const Select = RxSelect.Root;
export const SelectValue = RxSelect.Value;
export const SelectGroup = RxSelect.Group;

export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof RxSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RxSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RxSelect.Trigger
    ref={ref}
    className={cn(
      "flex h-control-md w-full items-center justify-between gap-2 px-control-px rounded-sm",
      "bg-surface-2 text-text-primary border border-border-default font-sans text-body",
      "outline-none transition-colors",
      "focus:focus-ring",
      "disabled:bg-surface-1 disabled:opacity-50 disabled:pointer-events-none",
      "data-[placeholder]:text-text-muted",
      className,
    )}
    {...props}
  >
    {children}
    <RxSelect.Icon asChild>
      <ChevronDown className="h-icon-md w-icon-md text-text-muted" />
    </RxSelect.Icon>
  </RxSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
  React.ComponentRef<typeof RxSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RxSelect.Content>
>(({ className, position = "popper", ...props }, ref) => (
  <RxSelect.Portal>
    <RxSelect.Content
      ref={ref}
      position={position}
      sideOffset={TOKENS.size.popoverOffset}
      className={cn(
        "z-50 min-w-select-min-w overflow-hidden rounded-md p-popover-p",
        "bg-surface-3 border border-border-strong text-text-primary",
        "shadow-popover",
        className,
      )}
      {...props}
    />
  </RxSelect.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
  React.ComponentRef<typeof RxSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RxSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RxSelect.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-control-gap rounded-sm py-select-item-py pl-select-item-pl pr-select-item-pr",
      "text-body text-text-secondary outline-none",
      "data-[highlighted]:bg-overlay-white-subtle data-[highlighted]:text-text-primary",
      "data-[state=checked]:text-accent-100",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-icon-md w-icon-md items-center justify-center">
      <RxSelect.ItemIndicator>
        <Check className="h-checkmark w-checkmark" />
      </RxSelect.ItemIndicator>
    </span>
    <RxSelect.ItemText>{children}</RxSelect.ItemText>
  </RxSelect.Item>
));
SelectItem.displayName = "SelectItem";
