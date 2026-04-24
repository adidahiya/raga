import * as RxSeparator from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "../lib/cn";

export const Separator = React.forwardRef<
  React.ComponentRef<typeof RxSeparator.Root>,
  React.ComponentPropsWithoutRef<typeof RxSeparator.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <RxSeparator.Root
    ref={ref}
    orientation={orientation}
    decorative={decorative}
    className={cn(
      "bg-border-default shrink-0",
      orientation === "horizontal" ? "h-separator-thickness w-full" : "h-full w-separator-thickness",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";
