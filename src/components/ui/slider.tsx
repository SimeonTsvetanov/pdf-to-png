import * as SliderPrimitive from "@radix-ui/react-slider";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A borderless range slider. The track uses a subtle tint, the range uses the
 * brand gradient, and the thumb lifts with a soft shadow.
 */
export function Slider({
  className,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>): React.ReactNode {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full [background-image:var(--brand-gradient)]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block size-5 rounded-full bg-surface shadow-[var(--shadow-md)] transition-shadow",
          "hover:shadow-[var(--shadow-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        )}
        aria-label="Quality"
      />
    </SliderPrimitive.Root>
  );
}
