import { Coffee, HelpCircle, Info, Menu as MenuIcon, ScrollText, Download, Server } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { GitHubIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { ServiceDialog } from "@/components/dialogs/ServiceDialog";
import { TermsDialog } from "@/components/dialogs/TermsDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { cn } from "@/lib/utils";

export const GITHUB_URL = "https://github.com/simeontsvetanov/pdf-to-png";
export const COFFEE_URL = "https://buymeacoffee.com/simeontsvetanov";

type DialogName = "about" | "help" | "terms" | "service" | null;

interface MenuAction {
  readonly id: string;
  readonly label: string;
  readonly Icon: ComponentType<{ className?: string }>;
  readonly onSelect?: () => void;
  readonly href?: string;
}

/**
 * App header: brand on the left; theme control + a modern menu on the right
 * (dropdown on desktop, slide-in sheet on mobile).
 */
export function Header(): ReactNode {
  const [dialog, setDialog] = useState<DialogName>(null);
  const { canInstall, promptInstall } = useInstallPrompt();

  const actions: MenuAction[] = [
    { id: "about", label: "About", Icon: Info, onSelect: () => setDialog("about") },
    { id: "help", label: "Help", Icon: HelpCircle, onSelect: () => setDialog("help") },
    { id: "terms", label: "Terms & Conditions", Icon: ScrollText, onSelect: () => setDialog("terms") },
    { id: "service", label: "Use as a service", Icon: Server, onSelect: () => setDialog("service") },
    ...(canInstall
      ? [{ id: "install", label: "Install app", Icon: Download, onSelect: () => void promptInstall() }]
      : []),
  ];

  const links: MenuAction[] = [
    { id: "coffee", label: "Buy me a coffee", Icon: Coffee, href: COFFEE_URL },
    { id: "github", label: "View on GitHub", Icon: GitHubIcon, href: GITHUB_URL },
  ];

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[var(--content-max)] items-center justify-between px-4 sm:px-6">
        <a href="." aria-label="PDF to PNG home" className="flex items-center">
          <Logo size={36} withWordmark />
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              {actions.map((a) => (
                <DropdownMenuItem key={a.id} onSelect={a.onSelect}>
                  <a.Icon /> {a.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {links.map((a) => (
                <DropdownMenuItem key={a.id} asChild>
                  <a href={a.href} target="_blank" rel="noreferrer">
                    <a.Icon /> {a.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent title="Menu">
              <span className="mb-3 mt-1 font-display text-lg font-bold">Menu</span>
              <ThemeToggle className="mb-3 w-full justify-between" />
              <nav className="flex flex-col gap-1">
                {actions.map((a) => (
                  <SheetClose key={a.id} asChild>
                    <MobileItem Icon={a.Icon} label={a.label} onClick={a.onSelect} />
                  </SheetClose>
                ))}
                <div className="my-1.5 h-px bg-muted" />
                {links.map((a) => (
                  <MobileItem key={a.id} Icon={a.Icon} label={a.label} href={a.href} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AboutDialog open={dialog === "about"} onOpenChange={(o) => setDialog(o ? "about" : null)} />
      <HelpDialog open={dialog === "help"} onOpenChange={(o) => setDialog(o ? "help" : null)} />
      <ServiceDialog open={dialog === "service"} onOpenChange={(o) => setDialog(o ? "service" : null)} />
      <TermsDialog open={dialog === "terms"} onOpenChange={(o) => setDialog(o ? "terms" : null)} />
    </header>
  );
}

/** A single tappable menu row used inside the mobile sheet. */
function MobileItem({
  Icon,
  label,
  onClick,
  href,
}: {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  href?: string;
}): ReactNode {
  const className = cn(
    "flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
    "hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
    "[&_svg]:size-4 [&_svg]:text-muted-foreground",
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        <Icon /> {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon /> {label}
    </button>
  );
}
