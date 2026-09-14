import * as RxContextMenu from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const ContextMenu = RxContextMenu.Root;
export const ContextMenuTrigger = RxContextMenu.Trigger;
export const ContextMenuGroup = RxContextMenu.Group;
export const ContextMenuPortal = RxContextMenu.Portal;
export const ContextMenuSub = RxContextMenu.Sub;
export const ContextMenuRadioGroup = RxContextMenu.RadioGroup;

const itemBaseClasses = cn(
  "relative flex cursor-default select-none items-center gap-control-gap rounded-sm",
  "px-control-px py-select-item-py text-body text-text-secondary outline-none",
  "data-[highlighted]:bg-overlay-white-subtle data-[highlighted]:text-text-primary",
  "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
);

const contentBaseClasses = cn(
  "z-50 min-w-select-min-w overflow-hidden rounded-md p-popover-p",
  "bg-surface-3 border border-border-strong text-text-primary shadow-popover",
  "font-sans",
);

export const ContextMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <RxContextMenu.SubTrigger
    ref={ref}
    className={cn(itemBaseClasses, inset && "pl-select-item-pl", className)}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-icon-sm w-icon-sm text-text-muted" />
  </RxContextMenu.SubTrigger>
));
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export const ContextMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.SubContent>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.SubContent>
>(({ className, ...props }, ref) => (
  <RxContextMenu.SubContent ref={ref} className={cn(contentBaseClasses, className)} {...props} />
));
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.Content>
>(({ className, ...props }, ref) => (
  <RxContextMenu.Portal>
    <RxContextMenu.Content ref={ref} className={cn(contentBaseClasses, className)} {...props} />
  </RxContextMenu.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RxContextMenu.Item
    ref={ref}
    className={cn(itemBaseClasses, inset && "pl-select-item-pl", className)}
    {...props}
  />
));
ContextMenuItem.displayName = "ContextMenuItem";

export const ContextMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <RxContextMenu.CheckboxItem
    ref={ref}
    className={cn(itemBaseClasses, "pl-select-item-pl pr-select-item-pr", className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-icon-md w-icon-md items-center justify-center">
      <RxContextMenu.ItemIndicator>
        <Check className="h-checkmark w-checkmark" strokeWidth={3} />
      </RxContextMenu.ItemIndicator>
    </span>
    {children}
  </RxContextMenu.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export const ContextMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.RadioItem>
>(({ className, children, ...props }, ref) => (
  <RxContextMenu.RadioItem
    ref={ref}
    className={cn(itemBaseClasses, "pl-select-item-pl pr-select-item-pr", className)}
    {...props}
  >
    <span className="absolute left-2 flex h-icon-md w-icon-md items-center justify-center">
      <RxContextMenu.ItemIndicator>
        <Circle className="h-radio-dot w-radio-dot fill-current text-accent-400" />
      </RxContextMenu.ItemIndicator>
    </span>
    {children}
  </RxContextMenu.RadioItem>
));
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export const ContextMenuLabel = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.Label>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RxContextMenu.Label
    ref={ref}
    className={cn(
      "px-control-px py-select-item-py text-caption font-semibold uppercase tracking-label text-text-muted",
      inset && "pl-select-item-pl",
      className,
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenuLabel";

export const ContextMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof RxContextMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof RxContextMenu.Separator>
>(({ className, ...props }, ref) => (
  <RxContextMenu.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-separator-thickness bg-border-default", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export const ContextMenuShortcut = ({
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
ContextMenuShortcut.displayName = "ContextMenuShortcut";
