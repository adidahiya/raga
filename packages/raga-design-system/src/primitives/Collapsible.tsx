import * as RxCollapsible from "@radix-ui/react-collapsible";
import * as React from "react";

import { cn } from "../lib/cn";

export const Collapsible = RxCollapsible.Root;
export const CollapsibleTrigger = RxCollapsible.Trigger;

export const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof RxCollapsible.Content>,
  React.ComponentPropsWithoutRef<typeof RxCollapsible.Content>
>(({ className, ...props }, ref) => (
  <RxCollapsible.Content
    ref={ref}
    className={cn("overflow-hidden", className)}
    {...props}
  />
));
CollapsibleContent.displayName = "CollapsibleContent";
