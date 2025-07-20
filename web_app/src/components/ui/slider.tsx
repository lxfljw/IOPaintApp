import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    tabIndex={-1}
    {...props}
  >
    <SliderPrimitive.Track
      className="relative h-1.5 w-full grow overflow-hidden rounded-full data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
      style={{ backgroundColor: "#22c55e20" }}
    >
      <SliderPrimitive.Range
        className="absolute h-full data-[disabled]:cursor-not-allowed"
        style={{ backgroundColor: "#22c55e" }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      tabIndex={-1}
      className="block h-4 w-4 rounded-full bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[disabled]:cursor-not-allowed"
      style={{ borderColor: "#22c55e60" }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
