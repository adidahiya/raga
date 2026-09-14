import * as RxDropdown from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { TOKENS } from "../tokens/tokens";

export const DropdownMenu = RxDropdown.Root;
export const DropdownMenuTrigger = RxDropdown.Trigger;
export const DropdownMenuGroup = RxDropdown.Group;
export const DropdownMenuPortal = RxDropdown.Portal;
export const DropdownMenuSub = RxDropdown.Sub;
export const DropdownMenuRadioGroup = RxDropdown.RadioGroup;

const itemBaseClasses = cn(
  "relative flex cursor-default select-none items-center gap-control-gap rounded-sm",
  "px-control-px py-select-item-py text-body text-text-secondary outline-none",
  "data-[highlighted]:bg-overlay-white-subtle data-[highlighted]:text-text-primary",
  "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
);

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <RxDropdown.SubTrigger
    ref={ref}
    className={cn(itemBaseClasses, inset && "pl-select-item-pl", className)}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-icon-sm w-icon-sm text-text-muted" />
  </RxDropdown.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const contentBaseClasses = cn(
  "z-50 min-w-select-min-w overflow-hidden rounded-md p-popover-p",
  "bg-surface-3 border border-border-strong text-text-primary shadow-popover",
  "font-sans",
);

export const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.SubContent>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.SubContent>
>(({ className, ...props }, ref) => (
  <RxDropdown.SubContent ref={ref} className={cn(contentBaseClasses, className)} {...props} />
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.Content>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.Content>
>(({ className, sideOffset = TOKENS.size.popoverOffset, ...props }, ref) => (
  <RxDropdown.Portal>
    <RxDropdown.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(contentBaseClasses, className)}
      {...props}
    />
  </RxDropdown.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.Item>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RxDropdown.Item
    ref={ref}
    className={cn(itemBaseClasses, inset && "pl-select-item-pl", className)}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <RxDropdown.CheckboxItem
    ref={ref}
    className={cn(
      itemBaseClasses,
      "pl-select-item-pl pr-select-item-pr",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-icon-md w-icon-md items-center justify-center">
      <RxDropdown.ItemIndicator>
        <Check className="h-checkmark w-checkmark" strokeWidth={3} />
      </RxDropdown.ItemIndicator>
    </span>
    {children}
  </RxDropdown.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.RadioItem>
>(({ className, children, ...props }, ref) => (
  <RxDropdown.RadioItem
    ref={ref}
    className={cn(itemBaseClasses, "pl-select-item-pl pr-select-item-pr", className)}
    {...props}
  >
    <span className="absolute left-2 flex h-icon-md w-icon-md items-center justify-center">
      <RxDropdown.ItemIndicator>
        <Circle className="h-radio-dot w-radio-dot fill-current text-accent-400" />
      </RxDropdown.ItemIndicator>
    </span>
    {children}
  </RxDropdown.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.Label>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RxDropdown.Label
    ref={ref}
    className={cn(
      "px-control-px py-select-item-py text-caption font-semibold uppercase tracking-label text-text-muted",
      inset && "pl-select-item-pl",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof RxDropdown.Separator>,
  React.ComponentPropsWithoutRef<typeof RxDropdown.Separator>
>(({ className, ...props }, ref) => (
  <RxDropdown.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-separator-thickness bg-border-default", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto pl-4 text-caption font-mono tracking-label text-text-muted",
      className,
    )}
    {...props}
  />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
