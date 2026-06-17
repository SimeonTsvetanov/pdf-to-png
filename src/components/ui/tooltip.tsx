import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Tooltip provider (wrap the app once). */
export const TooltipProvider = TooltipPrimitive.Provider;
/** Tooltip root. */
export const Tooltip = TooltipPrimitive.Root;
/** Tooltip trigger. */
export const TooltipTrigger = TooltipPrimitive.Trigger;

/** Floating tooltip bubble (borderless, elevated). */
export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>): React.ReactNode {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-[var(--shadow-md)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
