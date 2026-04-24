import * as React from "react";

import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leadingIcon, trailing, disabled, ...props }, ref) => (
    <div
      className={cn(
        "flex h-control-md items-center gap-2 px-control-px rounded-sm border border-border-default",
        "bg-surface-2 text-text-primary font-sans text-body",
        "focus-within:focus-ring",
        disabled && "bg-surface-1 opacity-50 pointer-events-none",
        className,
      )}
    >
      {leadingIcon ? <span className="text-text-muted shrink-0">{leadingIcon}</span> : null}
      <input
        ref={ref}
        disabled={disabled}
        className="flex-1 bg-transparent outline-none placeholder:text-text-muted"
        {...props}
      />
      {trailing}
    </div>
  ),
);
Input.displayName = "Input";
