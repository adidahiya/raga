import * as RxDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const Dialog = RxDialog.Root;
export const DialogTrigger = RxDialog.Trigger;
export const DialogClose = RxDialog.Close;
export const DialogPortal = RxDialog.Portal;

export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof RxDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RxDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RxDialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-overlay-black-50",
      "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
      "transition-opacity duration-150",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof RxDialog.Content> {
  /** Render the close (×) button in the top-right corner. Defaults to true. */
  showCloseButton?: boolean;
  /** Optional overlay className override. */
  overlayClassName?: string;
}

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof RxDialog.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, overlayClassName, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className={overlayClassName} />
    <RxDialog.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "rounded-md border border-border-strong bg-surface-1 text-text-primary shadow-popover",
        "p-6 outline-none font-sans",
        "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
        "transition-opacity duration-150",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <RxDialog.Close
          className={cn(
            "absolute right-3 top-3 inline-flex h-control-sm w-control-sm items-center justify-center rounded-sm",
            "text-text-muted hover:text-text-primary hover:bg-overlay-white-soft",
            "outline-none focus-visible:focus-ring transition-colors",
          )}
          aria-label="Close"
        >
          <X className="h-icon-md w-icon-md" />
        </RxDialog.Close>
      ) : null}
    </RxDialog.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof RxDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RxDialog.Title>
>(({ className, ...props }, ref) => (
  <RxDialog.Title
    ref={ref}
    className={cn("text-h2 font-semibold text-text-primary", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof RxDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RxDialog.Description>
>(({ className, ...props }, ref) => (
  <RxDialog.Description
    ref={ref}
    className={cn("text-body text-text-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
