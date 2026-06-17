import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Sheet root (a side drawer built on Radix Dialog). */
export const Sheet = DialogPrimitive.Root;
/** Sheet trigger. */
export const SheetTrigger = DialogPrimitive.Trigger;
/** Sheet close. */
export const SheetClose = DialogPrimitive.Close;

/**
 * A slide-in panel anchored to the right edge (used as the mobile menu).
 *
 * @param title - Accessible title (visually hidden by default).
 */
export function SheetContent({
  className,
  children,
  title = "Menu",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { title?: string }): ReactNode {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col gap-2 bg-surface p-5 shadow-[var(--shadow-xl)]",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
          className,
        )}
        {...props}
      >
        <VisuallyHidden>
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
        </VisuallyHidden>
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-muted-foreground",
            "transition-colors hover:bg-surface-2 hover:text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
          )}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
