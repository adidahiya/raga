import * as React from "react";
import { toast as sonnerToast,Toaster as SonnerToaster } from "sonner";

import { cn } from "../lib/cn";

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * Toast surface. Drop one near the root of the app. Use `toast`/`toast.success`
 * etc. anywhere to push notifications.
 *
 * Theming uses the `data-theme` attribute set on `<html>` by the design system,
 * so we keep `theme="system"` here and rely on token CSS variables to flip
 * surface/text/border colors automatically when the user toggles themes.
 */
export function Toaster({ className, position = "top-right", ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      theme="system"
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast pointer-events-auto",
            "rounded-md border border-border-strong bg-surface-2 text-text-primary shadow-popover",
            "px-4 py-3 font-sans text-body",
          ),
          title: "text-body font-medium text-text-primary",
          description: "text-body-sm text-text-muted",
          actionButton: cn(
            "rounded-sm px-3 py-1 text-body-sm font-medium",
            "bg-accent-500 text-fg-on-accent border border-accent-400",
          ),
          cancelButton: cn(
            "rounded-sm px-3 py-1 text-body-sm font-medium",
            "bg-overlay-white-soft text-text-secondary border border-border-default",
          ),
          success: "[&>[data-icon]]:text-success",
          error: "[&>[data-icon]]:text-danger",
          warning: "[&>[data-icon]]:text-warning",
          info: "[&>[data-icon]]:text-info",
        },
      }}
      {...props}
    />
  );
}
Toaster.displayName = "Toaster";

export const toast = sonnerToast;
