import { Star } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Total number of stars. Defaults to 5. */
  count?: number;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  /** Smallest selectable increment. Defaults to 1. Pass 0.5 for half-stars. */
  fractions?: number;
  /** Called whenever the user picks a new value. */
  onChange?: (value: number) => void;
  /** Called as the user hovers over different stars. */
  onHover?: (value: number) => void;
  /** Render in read-only mode. */
  readOnly?: boolean;
  /** Disable interaction and dim the visual. */
  disabled?: boolean;
  /** Star size — token name or explicit pixel value. */
  size?: "sm" | "md" | "lg" | number;
  /** Color override for filled stars. Defaults to the warm accent. */
  color?: "accent" | "warm" | "warning";
  /** Accessible label for the whole rating control. */
  "aria-label"?: string;
}

const SIZE_CLASS = {
  sm: "h-icon-md w-icon-md",
  md: "h-icon-lg w-icon-lg",
  lg: "h-control-sm w-control-sm",
} as const;

const COLOR_CLASS = {
  accent: "text-accent-400",
  warm: "text-accent2-400",
  warning: "text-warning",
} as const;

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      count = 5,
      value,
      defaultValue,
      fractions = 1,
      onChange,
      onHover,
      readOnly = false,
      disabled = false,
      size = "md",
      color = "warm",
      className,
      "aria-label": ariaLabel = "Rating",
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue ?? 0);
    const [hovered, setHovered] = React.useState<number | null>(null);
    const liveValue = isControlled ? value : internal;
    const current = hovered ?? liveValue;
    const interactive = !readOnly && !disabled;
    const step = 1 / Math.max(1, Math.round(fractions));
    const segments = Math.max(1, Math.round(1 / step));
    const isNumericSize = typeof size === "number";
    const sizeClass = isNumericSize ? "" : SIZE_CLASS[size];
    const sizeStyle: React.CSSProperties | undefined = isNumericSize
      ? { width: size, height: size }
      : undefined;
    const colorClass = COLOR_CLASS[color];

    const commit = (next: number) => {
      const clamped = Math.max(0, Math.min(count, next));
      if (!isControlled) setInternal(clamped);
      onChange?.(clamped);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      let next = liveValue;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = Math.min(count, liveValue + step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = Math.max(0, liveValue - step);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = count;
          break;
        default:
          return;
      }
      event.preventDefault();
      commit(next);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-readonly={readOnly}
        aria-disabled={disabled}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex items-center gap-1 text-text-muted",
          interactive && "outline-none focus-visible:focus-ring rounded-xs",
          disabled && "opacity-40 pointer-events-none",
          className,
        )}
        onMouseLeave={() => {
          if (interactive) {
            setHovered(null);
            onHover?.(liveValue);
          }
        }}
        {...props}
      >
        {Array.from({ length: count }, (_, i) => {
          const starValue = i + 1;
          const filled = Math.max(0, Math.min(1, current - i));
          return (
            <span
              key={starValue}
              role="presentation"
              className={cn("relative inline-block", sizeClass, interactive && "cursor-pointer")}
              style={sizeStyle}
            >
              <Star
                className={cn(sizeClass, "text-text-disabled")}
                style={sizeStyle}
                strokeWidth={1.5}
              />
              <span
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ width: `${(filled * 100).toString()}%` }}
              >
                <Star
                  className={cn(sizeClass, colorClass, "fill-current")}
                  style={sizeStyle}
                  strokeWidth={1.5}
                />
              </span>
              {interactive
                ? Array.from({ length: segments }, (__, segIdx) => {
                    const segValue = i + step * (segIdx + 1);
                    return (
                      <button
                        key={segValue}
                        type="button"
                        role="radio"
                        aria-checked={liveValue === segValue}
                        aria-label={`${segValue.toString()} of ${count.toString()}`}
                        tabIndex={-1}
                        className={cn(
                          "absolute top-0 h-full",
                          "outline-none rounded-xs",
                        )}
                        style={{
                          left: `${((segIdx / segments) * 100).toString()}%`,
                          width: `${((1 / segments) * 100).toString()}%`,
                        }}
                        onMouseEnter={() => {
                          setHovered(segValue);
                          onHover?.(segValue);
                        }}
                        onClick={() => {
                          commit(segValue);
                        }}
                      />
                    );
                  })
                : null}
            </span>
          );
        })}
      </div>
    );
  },
);
Rating.displayName = "Rating";
