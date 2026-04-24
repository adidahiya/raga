import * as RxSlider from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "../lib/cn";

export type SliderProps = React.ComponentPropsWithoutRef<typeof RxSlider.Root>;

export const Slider = React.forwardRef<
  React.ComponentRef<typeof RxSlider.Root>,
  SliderProps
>(({ className, ...props }, ref) => (
  <RxSlider.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      "data-[disabled]:opacity-40 data-[disabled]:pointer-events-none",
      className,
    )}
    {...props}
  >
    <RxSlider.Track className="bg-overlay-white-soft relative h-slider-track-h w-full grow overflow-hidden rounded-pill">
      <RxSlider.Range className="bg-accent-500 absolute h-full" />
    </RxSlider.Track>
    <RxSlider.Thumb
      className={cn(
        "block h-icon-md w-icon-md rounded-pill bg-fg-on-accent border border-accent-400",
        "shadow-knob-glow",
        "outline-none focus-visible:focus-ring",
      )}
    />
  </RxSlider.Root>
));
Slider.displayName = "Slider";
