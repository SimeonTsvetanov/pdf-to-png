import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Button styles. Per the project's design rules there are NO borders; emphasis
 * comes from fills, subtle tints, and a soft hover "lift" shadow.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium " +
    "transition-[box-shadow,transform,background-color,color] duration-200 ease-out " +
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] " +
    "disabled:pointer-events-none disabled:opacity-50 select-none " +
    "[&_svg]:pointer-events-none [&_svg]:size-[1.1em] [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:shadow-[var(--glow-primary)] hover:-translate-y-0.5",
        gradient:
          "text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--glow-primary)] hover:-translate-y-0.5 " +
          "[background-image:var(--brand-gradient)]",
        secondary:
          "bg-surface-2 text-foreground shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5",
        ghost: "bg-transparent text-foreground hover:bg-surface-2",
        subtle: "bg-accent text-accent-foreground hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/** Props for {@link Button}. */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (Radix Slot) instead of a <button>. */
  asChild?: boolean;
}

/** A themeable, borderless button with a soft hover lift. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
