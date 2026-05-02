import { Tooltip, TooltipContent, TooltipTrigger } from "@adahiya/raga-design-system";
import * as React from "react";

interface SimpleTooltipProps {
  label: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  disabled?: boolean;
  children: React.ReactElement;
}

/**
 * Thin wrapper around the design-system Tooltip primitives that mimics the
 * `<Tooltip label={...}>{child}</Tooltip>` shape used by Mantine. Returns
 * `children` directly when `disabled` is true or `label` is empty.
 */
export default function SimpleTooltip({
  label,
  side = "top",
  sideOffset,
  disabled,
  children,
}: SimpleTooltipProps) {
  if (disabled || label === undefined || label === null || label === "") {
    return children;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
