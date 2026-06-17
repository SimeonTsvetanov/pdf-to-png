import * as Menu from "@radix-ui/react-dropdown-menu";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Dropdown root. */
export const DropdownMenu = Menu.Root;
/** Dropdown trigger. */
export const DropdownMenuTrigger = Menu.Trigger;
/** Dropdown group. */
export const DropdownMenuGroup = Menu.Group;

/** Floating dropdown panel (borderless, elevated). */
export function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "end",
  ...props
}: ComponentProps<typeof Menu.Content>): React.ReactNode {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-56 overflow-hidden rounded-xl bg-surface p-1.5 shadow-[var(--shadow-lg)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

/** A single dropdown item with icon support and hover tint. */
export function DropdownMenuItem({
  className,
  inset,
  ...props
}: ComponentProps<typeof Menu.Item> & { inset?: boolean }): React.ReactNode {
  return (
    <Menu.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm outline-none",
        "transition-colors focus:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        inset && "pl-9",
        className,
      )}
      {...props}
    />
  );
}

/** A thin separator (subtle tint, not a border). */
export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Menu.Separator>): React.ReactNode {
  return <Menu.Separator className={cn("my-1.5 h-px bg-muted", className)} {...props} />;
}

/** A small label/heading inside the menu. */
export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof Menu.Label>): React.ReactNode {
  return (
    <Menu.Label
      className={cn("px-3 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}
