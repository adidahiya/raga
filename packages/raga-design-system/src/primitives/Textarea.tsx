import * as React from "react";

import { cn } from "../lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, ...props }, ref) => (
    <textarea
      ref={ref}
      disabled={disabled}
      className={cn(
        "min-h-textarea-min-h w-full px-control-px py-control-py rounded-sm border border-border-default",
        "bg-surface-2 text-text-secondary font-sans text-body",
        "outline-none placeholder:text-text-muted resize-y",
        "focus:focus-ring",
        disabled && "bg-surface-1 opacity-50 pointer-events-none",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
