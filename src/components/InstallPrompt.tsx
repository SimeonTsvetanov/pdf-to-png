import { Download, Share, X } from "lucide-react";
import { type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

/**
 * A dismissible banner inviting the user to install the app — but only when it
 * is NOT already installed. On iOS (no native prompt) it shows "Add to Home
 * Screen" instructions instead.
 */
export function InstallPrompt(): ReactNode {
  const { canInstall, isStandalone, isIOS, dismissed, promptInstall, dismiss } = useInstallPrompt();

  // Hide if installed, already dismissed, or there's nothing to offer.
  if (isStandalone || dismissed) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-xl)]">
        <Logo size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install PDF→PNG</p>
          {isIOS ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Tap <Share className="inline size-3.5" /> then “Add to Home Screen”.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Use it like an app — offline, fullscreen, one tap away.
            </p>
          )}
        </div>
        {canInstall && (
          <Button size="sm" variant="gradient" onClick={() => void promptInstall()}>
            <Download /> Install
          </Button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
