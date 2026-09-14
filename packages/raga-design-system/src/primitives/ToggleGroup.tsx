import * as RxToggleGroup from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const toggleGroupVariants = cva(
  cn(
    "inline-flex items-center gap-control-gap",
    "data-[disabled]:opacity-40 data-[disabled]:pointer-events-none",
  ),
  {
    variants: {
      variant: {
        default: "",
        segmented: cn(
          "bg-overlay-white-soft border border-border-default rounded-md p-1 gap-0",
        ),
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

const toggleGroupItemVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-control-gap rounded-sm",
    "text-body text-text-secondary outline-none transition-colors select-none",
    "focus-visible:focus-ring",
    "disabled:opacity-40 disabled:pointer-events-none",
  ),
  {
    variants: {
      variant: {
        default: cn(
          "px-control-px bg-overlay-white-soft border border-border-default",
          "hover:bg-overlay-white-fill",
          "data-[state=on]:bg-accent-500 data-[state=on]:text-fg-on-accent data-[state=on]:border-accent-400",
        ),
        segmented: cn(
          "px-control-px bg-transparent border border-transparent",
          "hover:text-text-primary",
          "data-[state=on]:bg-surface-3 data-[state=on]:text-text-primary data-[state=on]:border-border-default data-[state=on]:shadow-sm",
        ),
      },
      size: {
        sm: "h-control-sm",
        md: "h-control-md",
        lg: "h-control-lg",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

interface ToggleGroupContextValue {
  variant: NonNullable<VariantProps<typeof toggleGroupItemVariants>["variant"]>;
  size: NonNullable<VariantProps<typeof toggleGroupItemVariants>["size"]>;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: "default",
  size: "md",
});

type ToggleGroupRootProps = (
  | React.ComponentPropsWithoutRef<typeof RxToggleGroup.Root>
) &
  VariantProps<typeof toggleGroupVariants>;

export const ToggleGroup = React.forwardRef<
  React.ComponentRef<typeof RxToggleGroup.Root>,
  ToggleGroupRootProps
>(({ className, variant = "default", size = "md", children, ...props }, ref) => (
  <RxToggleGroup.Root
    ref={ref}
    className={cn(toggleGroupVariants({ variant, size }), className)}
    {...props}
  >
    <ToggleGroupContext.Provider
      value={{ variant: variant ?? "default", size: size ?? "md" }}
    >
      {children}
    </ToggleGroupContext.Provider>
  </RxToggleGroup.Root>
));
ToggleGroup.displayName = "ToggleGroup";

export const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof RxToggleGroup.Item>,
  React.ComponentPropsWithoutRef<typeof RxToggleGroup.Item> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, variant, size, ...props }, ref) => {
  const ctx = React.useContext(ToggleGroupContext);
  return (
    <RxToggleGroup.Item
      ref={ref}
      className={cn(
        toggleGroupItemVariants({
          variant: variant ?? ctx.variant,
          size: size ?? ctx.size,
        }),
        className,
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem";

/**
 * Single-select wrapper around `ToggleGroup` that mirrors the Mantine
 * `SegmentedControl` API (data accepts strings or `{value, label, disabled}`).
 */
export type SegmentedControlData<T extends string = string> = readonly (
  | T
  | { value: T; label: React.ReactNode; disabled?: boolean }
)[];

export interface SegmentedControlProps<T extends string = string>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RxToggleGroup.Root>,
    "type" | "value" | "defaultValue" | "onValueChange" | "onChange" | "children"
  > {
  data: SegmentedControlData<T>;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: VariantProps<typeof toggleGroupItemVariants>["size"];
  fullWidth?: boolean;
}

const SegmentedControlInner = React.forwardRef(
  <T extends string>(
    {
      data,
      value,
      defaultValue,
      onChange,
      className,
      size = "md",
      fullWidth = false,
      ...props
    }: SegmentedControlProps<T>,
    ref: React.ForwardedRef<React.ComponentRef<typeof RxToggleGroup.Root>>,
  ) => {
    const items = React.useMemo(
      () =>
        data.map((item) =>
          typeof item === "string"
            ? { value: item, label: item, disabled: false }
            : { value: item.value, label: item.label, disabled: item.disabled ?? false },
        ),
      [data],
    );
    return (
      <ToggleGroup
        ref={ref}
        type="single"
        variant="segmented"
        size={size}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(v: string) => {
          if (v.length > 0) onChange?.(v as T);
        }}
        className={cn(fullWidth && "w-full", className)}
        {...props}
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(fullWidth && "flex-1")}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  },
);
SegmentedControlInner.displayName = "SegmentedControl";

export const SegmentedControl = SegmentedControlInner as <T extends string>(
  props: SegmentedControlProps<T> & {
    ref?: React.ForwardedRef<React.ComponentRef<typeof RxToggleGroup.Root>>;
  },
) => React.ReactElement;
